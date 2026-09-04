"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DeviceControlService } from "@/lib/device-control/service";
import { PaymentGatewayService } from "@/lib/payment-gateway/service";
import { totalPayable } from "@/lib/pricing";
import type { InventoryDevice, RentalPlan } from "@/types/domain";

export interface ApplicationDraft {
  product_id: string;
  rental_plan_id: string;
  personal_info: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    mobile: string;
    email: string;
  };
  address: { residential: string; postal?: string };
  employment: { status: string; employer?: string; monthly_income: number; notes?: string };
  debit_order: {
    bank_name: string;
    account_holder: string;
    account_number: string;
    branch_code: string;
    account_type: string;
  };
  consent_accepted: boolean;
}

function nextAgreementNumber() {
  return `AIR-${Math.floor(100000 + Math.random() * 899999)}`;
}

/**
 * The full signup -> debit order -> agreement flow, in one step (no manual admin
 * review gate). The customer applies, we immediately attempt to collect the first
 * installment + admin fee via debit order, and on success the agreement, payment
 * schedule and device allocation are all created automatically so the device can
 * be shipped. If the debit fails, nothing is created and the customer is told to
 * try again -- there is no partial/pending agreement left behind.
 */
export async function submitApplication(draft: ApplicationDraft) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to apply." };

  if (!draft.consent_accepted) {
    return { error: "You must accept the declaration and debit order authorization to continue." };
  }

  const accountNumber = draft.debit_order.account_number.replace(/\s+/g, "");
  if (accountNumber.length < 4) {
    return { error: "Please enter a valid bank account number." };
  }

  const service = createServiceClient();

  const { data: plan } = await service
    .from("rental_plans")
    .select("*")
    .eq("id", draft.rental_plan_id)
    .single<RentalPlan>();
  if (!plan) return { error: "That rental plan is no longer available." };

  const { data: device } = await service
    .from("inventory")
    .select("*")
    .eq("product_id", draft.product_id)
    .eq("status", "AVAILABLE")
    .limit(1)
    .maybeSingle<InventoryDevice>();
  if (!device) return { error: "This device is currently out of stock. Please check back soon." };

  // 1. Record the application (kept for audit history even though nothing waits on it).
  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      customer_id: user.id,
      product_id: draft.product_id,
      rental_plan_id: draft.rental_plan_id,
      personal_info: draft.personal_info,
      address: draft.address,
      employment: draft.employment,
      consent_accepted: draft.consent_accepted,
      status: "SUBMITTED",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (appError) return { error: appError.message };

  await service.from("audit_logs").insert({
    actor: user.id,
    action: "APPLICATION_SUBMITTED",
    entity: "application",
    entity_id: application.id,
    metadata: { product_id: draft.product_id, rental_plan_id: draft.rental_plan_id },
  });

  // 2. Capture the debit order mandate (only the last 4 digits of the account number
  //    are stored -- there is no legitimate reason to retain the full number).
  const { data: mandate, error: mandateError } = await service
    .from("debit_order_mandates")
    .insert({
      customer_id: user.id,
      application_id: application.id,
      bank_name: draft.debit_order.bank_name,
      account_holder: draft.debit_order.account_holder,
      account_number_last4: accountNumber.slice(-4),
      branch_code: draft.debit_order.branch_code,
      account_type: draft.debit_order.account_type,
    })
    .select()
    .single();
  if (mandateError) return { error: mandateError.message };

  await service.from("applications").update({ debit_order_mandate_id: mandate.id }).eq("id", application.id);

  // 3. Attempt the first combined charge: first installment + admin fee.
  const initialAmount = plan.monthly_payment + plan.admin_fee;
  const debitResult = await PaymentGatewayService.chargeInitialDebit(
    {
      bankName: draft.debit_order.bank_name,
      accountHolder: draft.debit_order.account_holder,
      accountNumber,
      branchCode: draft.debit_order.branch_code,
      accountType: draft.debit_order.account_type,
    },
    initialAmount,
  );

  await service
    .from("applications")
    .update({ first_debit_status: debitResult.ok ? "SUCCEEDED" : "FAILED" })
    .eq("id", application.id);

  if (!debitResult.ok) {
    await service.from("applications").update({ status: "DECLINED", decided_at: new Date().toISOString() }).eq("id", application.id);
    await service.from("audit_logs").insert({
      actor: "system",
      action: "PAYMENT_FAILED",
      entity: "application",
      entity_id: application.id,
      metadata: { reason: debitResult.message, amount: initialAmount },
    });
    redirect(`/apply/status/${application.id}`);
  }

  // 4. Debit succeeded -- create the agreement, payment schedule, and allocate the device.
  const total = totalPayable(plan);
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + plan.term_months);
  const agreementNumber = nextAgreementNumber();

  const { data: agreement, error: agreementErr } = await service
    .from("agreements")
    .insert({
      agreement_number: agreementNumber,
      customer_id: user.id,
      product_id: draft.product_id,
      device_id: device.id,
      rental_plan_id: plan.id,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      term_months: plan.term_months,
      monthly_payment: plan.monthly_payment,
      deposit: plan.deposit,
      admin_fee: plan.admin_fee,
      buyout_amount: plan.buyout_amount,
      total_payable: total,
      payments_required: plan.term_months,
      payments_completed: 1,
      amount_paid: initialAmount,
      amount_remaining: Math.max(0, total - initialAmount),
      status: "ACTIVE",
      ownership_status: "NOT_OWNED",
    })
    .select()
    .single();
  if (agreementErr) return { error: agreementErr.message };

  // Payment #1 (installment + admin fee, already collected), then the remaining
  // monthly debits, then the final buyout row that transfers ownership.
  const schedule = [
    {
      agreement_id: agreement.id,
      customer_id: user.id,
      payment_number: 1,
      amount: initialAmount,
      payment_type: "ADMIN_FEE",
      due_date: startDate.toISOString().slice(0, 10),
      status: "PAID",
      paid_date: startDate.toISOString().slice(0, 10),
      payment_reference: debitResult.reference,
      provider: "mock",
    },
    ...Array.from({ length: plan.term_months - 1 }).map((_, i) => {
      const due = new Date(startDate);
      due.setMonth(due.getMonth() + i + 1);
      return {
        agreement_id: agreement.id,
        customer_id: user.id,
        payment_number: i + 2,
        amount: plan.monthly_payment,
        payment_type: "MONTHLY",
        due_date: due.toISOString().slice(0, 10),
        status: "SCHEDULED",
      };
    }),
    {
      agreement_id: agreement.id,
      customer_id: user.id,
      payment_number: plan.term_months + 1,
      amount: plan.buyout_amount,
      payment_type: "BUYOUT",
      due_date: endDate.toISOString().slice(0, 10),
      status: "SCHEDULED",
    },
  ];
  await service.from("payment_schedule").insert(schedule);

  // Device is allocated and registered with device control, but stays in ALLOCATED
  // status (awaiting shipment) until an admin physically ships it and marks it shipped.
  await service
    .from("inventory")
    .update({ status: "ALLOCATED", agreement_id: agreement.id, customer_id: user.id })
    .eq("id", device.id);
  await DeviceControlService.registerDevice(device, "system");

  await service.from("applications").update({ status: "APPROVED", decided_at: new Date().toISOString() }).eq("id", application.id);

  await service.from("audit_logs").insert([
    { actor: "system", action: "PAYMENT_RECEIVED", entity: "application", entity_id: application.id, metadata: { amount: initialAmount, reference: debitResult.reference } },
    { actor: "system", action: "APPLICATION_APPROVED", entity: "application", entity_id: application.id, metadata: {} },
    { actor: "system", action: "AGREEMENT_CREATED", entity: "agreement", entity_id: agreement.id, metadata: { agreement_number: agreementNumber } },
  ]);

  await service.from("notifications").insert([
    { customer_id: user.id, type: "PAYMENT_RECEIVED", title: "First payment collected", body: `We've collected your first payment of R${initialAmount}. Agreement ${agreementNumber} is now active.` },
    { customer_id: user.id, type: "AGREEMENT_CREATED", title: "You're approved!", body: "Your device is being prepared for shipment." },
  ]);

  redirect(`/apply/status/${application.id}`);
}
