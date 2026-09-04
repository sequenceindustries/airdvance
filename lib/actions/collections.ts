"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DeviceControlService } from "@/lib/device-control/service";
import { PaymentGatewayService } from "@/lib/payment-gateway/service";
import { totalPayable } from "@/lib/pricing";
import type { Application, DebitOrderMandate, InventoryDevice, RentalPlan } from "@/types/domain";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "ADMIN") throw new Error("Admin only");
  return user.id;
}

function nextAgreementNumber() {
  return `AIR-${Math.floor(100000 + Math.random() * 899999)}`;
}

/**
 * Runs the collection that would happen automatically on each customer's payday
 * in production. For every application whose scheduled first-collection date
 * has arrived, attempts the debit order. On success, creates the agreement,
 * payment schedule and device allocation (device ships within 7 days from here).
 * On failure, the application is declined -- no partial agreement is left behind.
 */
export async function collectDueFirstPayments() {
  const adminId = await requireAdmin();
  const service = createServiceClient();

  const today = new Date().toISOString().slice(0, 10);
  const { data: dueApplications } = await service
    .from("applications")
    .select("*")
    .eq("status", "UNDER_REVIEW")
    .lte("next_collection_date", today);

  let collected = 0;
  let failed = 0;

  for (const application of (dueApplications ?? []) as Application[]) {
    const { data: plan } = await service
      .from("rental_plans")
      .select("*")
      .eq("id", application.rental_plan_id)
      .single<RentalPlan>();
    const { data: mandate } = await service
      .from("debit_order_mandates")
      .select("*")
      .eq("id", application.debit_order_mandate_id ?? "")
      .maybeSingle<DebitOrderMandate>();
    const { data: device } = await service
      .from("inventory")
      .select("*")
      .eq("product_id", application.product_id)
      .eq("status", "AVAILABLE")
      .limit(1)
      .maybeSingle<InventoryDevice>();

    if (!plan || !mandate || !device) {
      await service
        .from("applications")
        .update({ status: "DECLINED", first_debit_status: "FAILED", decided_at: new Date().toISOString() })
        .eq("id", application.id);
      failed++;
      continue;
    }

    const initialAmount = plan.monthly_payment + plan.admin_fee;
    const debitResult = await PaymentGatewayService.chargeInitialDebit(
      {
        bankName: mandate.bank_name,
        accountHolder: mandate.account_holder,
        accountNumber: mandate.account_number_last4,
        branchCode: mandate.branch_code,
        accountType: mandate.account_type,
      },
      initialAmount,
    );

    await service
      .from("applications")
      .update({ first_debit_status: debitResult.ok ? "SUCCEEDED" : "FAILED" })
      .eq("id", application.id);

    if (!debitResult.ok) {
      await service
        .from("applications")
        .update({ status: "DECLINED", decided_at: new Date().toISOString() })
        .eq("id", application.id);
      await service.from("audit_logs").insert({
        actor: "system",
        action: "PAYMENT_FAILED",
        entity: "application",
        entity_id: application.id,
        metadata: { reason: debitResult.message, amount: initialAmount },
      });
      await service.from("notifications").insert({
        customer_id: application.customer_id,
        type: "PAYMENT_FAILED",
        title: "First payment failed",
        body: "We couldn't collect your first payment. Please apply again with valid bank details.",
      });
      failed++;
      continue;
    }

    const total = totalPayable(plan);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.term_months);
    const agreementNumber = nextAgreementNumber();

    const { data: agreement, error: agreementErr } = await service
      .from("agreements")
      .insert({
        agreement_number: agreementNumber,
        customer_id: application.customer_id,
        product_id: application.product_id,
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
    if (agreementErr || !agreement) {
      failed++;
      continue;
    }

    const schedule = [
      {
        agreement_id: agreement.id,
        customer_id: application.customer_id,
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
          customer_id: application.customer_id,
          payment_number: i + 2,
          amount: plan.monthly_payment,
          payment_type: "MONTHLY",
          due_date: due.toISOString().slice(0, 10),
          status: "SCHEDULED",
        };
      }),
      {
        agreement_id: agreement.id,
        customer_id: application.customer_id,
        payment_number: plan.term_months + 1,
        amount: plan.buyout_amount,
        payment_type: "BUYOUT",
        due_date: endDate.toISOString().slice(0, 10),
        status: "SCHEDULED",
      },
    ];
    await service.from("payment_schedule").insert(schedule);

    await service
      .from("inventory")
      .update({ status: "ALLOCATED", agreement_id: agreement.id, customer_id: application.customer_id })
      .eq("id", device.id);
    await DeviceControlService.registerDevice(device, "system");

    await service
      .from("applications")
      .update({ status: "APPROVED", decided_at: new Date().toISOString() })
      .eq("id", application.id);

    await service.from("audit_logs").insert([
      { actor: adminId, action: "PAYMENT_RECEIVED", entity: "application", entity_id: application.id, metadata: { amount: initialAmount, reference: debitResult.reference } },
      { actor: adminId, action: "APPLICATION_APPROVED", entity: "application", entity_id: application.id, metadata: {} },
      { actor: adminId, action: "AGREEMENT_CREATED", entity: "agreement", entity_id: agreement.id, metadata: { agreement_number: agreementNumber } },
    ]);

    const shipBy = new Date();
    shipBy.setDate(shipBy.getDate() + 7);
    await service.from("notifications").insert([
      { customer_id: application.customer_id, type: "PAYMENT_RECEIVED", title: "First payment collected", body: `We've collected your first payment of R${initialAmount}. Agreement ${agreementNumber} is now active.` },
      { customer_id: application.customer_id, type: "AGREEMENT_CREATED", title: "You're approved!", body: `Your device will be delivered within 7 days (by ${shipBy.toISOString().slice(0, 10)}).` },
    ]);

    collected++;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  return { success: true, collected, failed };
}
