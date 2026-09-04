"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DeviceControlService } from "@/lib/device-control/service";
import { PaymentGatewayService } from "@/lib/payment-gateway/service";
import type { Agreement, InventoryDevice, ScheduledPayment } from "@/types/domain";

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

async function finalizeBuyout(agreement: Agreement, actor: string) {
  const service = createServiceClient();

  await service
    .from("agreements")
    .update({ status: "COMPLETED", ownership_status: "OWNED", completed_at: new Date().toISOString() })
    .eq("id", agreement.id);

  const { data: device } = await service
    .from("inventory")
    .select("*")
    .eq("id", agreement.device_id)
    .single<InventoryDevice>();

  if (device) {
    await DeviceControlService.releaseDevice(device, actor);
    await service.from("inventory").update({ status: "OWNED" }).eq("id", device.id);
  }

  await service.from("audit_logs").insert([
    { actor, action: "OWNERSHIP_GRANTED", entity: "agreement", entity_id: agreement.id, metadata: {} },
    { actor, action: "AGREEMENT_COMPLETED", entity: "agreement", entity_id: agreement.id, metadata: {} },
  ]);
  await service.from("notifications").insert({
    customer_id: agreement.customer_id,
    type: "OWNERSHIP_ACHIEVED",
    title: "Congratulations — it's yours!",
    body: "Your buyout payment went through. The device is now officially yours.",
  });
}

/**
 * Records a scheduled payment as PAID (used for admin-recorded manual payments --
 * e.g. after a debit order failure, the customer pays manually to restore access).
 * Restores a restricted device if needed. Once every monthly installment is paid,
 * ownership moves to OWNERSHIP_PENDING (not OWNED yet) -- the device is only fully
 * owned once the separate final buyout payment is recorded.
 */
export async function recordPayment(paymentId: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();

  const { data: payment } = await service
    .from("payment_schedule")
    .select("*")
    .eq("id", paymentId)
    .single<ScheduledPayment>();
  if (!payment) return { error: "Payment not found." };
  if (payment.status === "PAID") return { error: "Payment already recorded as paid." };

  await service
    .from("payment_schedule")
    .update({
      status: "PAID",
      paid_date: new Date().toISOString().slice(0, 10),
      payment_reference: `PMT-${payment.agreement_id.slice(0, 8)}-${payment.payment_number}`,
      provider: "mock-gateway",
    })
    .eq("id", paymentId);

  const { data: agreement } = await service
    .from("agreements")
    .select("*")
    .eq("id", payment.agreement_id)
    .single<Agreement>();
  if (!agreement) return { error: "Agreement not found." };

  await service.from("audit_logs").insert({
    actor: adminId,
    action: "PAYMENT_RECEIVED",
    entity: "payment_schedule",
    entity_id: paymentId,
    metadata: { agreement_id: agreement.id, payment_number: payment.payment_number, manual: true },
  });
  await service.from("notifications").insert({
    customer_id: agreement.customer_id,
    type: "PAYMENT_RECEIVED",
    title: "Payment received",
    body: `We've received your manual payment of R${payment.amount} for agreement ${agreement.agreement_number}.`,
  });

  const { data: device } = await service
    .from("inventory")
    .select("*")
    .eq("id", agreement.device_id)
    .single<InventoryDevice>();

  if (device) {
    const { data: control } = await service.from("device_control").select("*").eq("device_id", device.id).maybeSingle();
    if (control?.status === "RESTRICTED") {
      await DeviceControlService.restoreDevice(device, adminId);
      await service.from("notifications").insert({
        customer_id: agreement.customer_id,
        type: "DEVICE_RESTORED",
        title: "Device restored",
        body: "Your device has been restored following your payment.",
      });
    }
  }

  if (payment.payment_type === "BUYOUT") {
    await finalizeBuyout(agreement, adminId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, completed: true };
  }

  const amountPaid = Number(agreement.amount_paid) + Number(payment.amount);
  const isMonthlyOrFee = payment.payment_type === "MONTHLY" || payment.payment_type === "ADMIN_FEE";
  const paymentsCompleted = isMonthlyOrFee ? agreement.payments_completed + 1 : agreement.payments_completed;
  const rentalComplete = paymentsCompleted >= agreement.payments_required;
  const amountRemaining = Math.max(0, Number(agreement.total_payable) - amountPaid);

  await service
    .from("agreements")
    .update({
      payments_completed: paymentsCompleted,
      amount_paid: amountPaid,
      amount_remaining: amountRemaining,
      ownership_status: rentalComplete ? "OWNERSHIP_PENDING" : "NOT_OWNED",
    })
    .eq("id", agreement.id);

  if (rentalComplete && agreement.ownership_status !== "OWNERSHIP_PENDING") {
    await service.from("notifications").insert({
      customer_id: agreement.customer_id,
      type: "PAYMENT_RECEIVED",
      title: "Rental period complete",
      body: `You've made every rental payment. Buy your device now for R${agreement.buyout_amount} to make it officially yours.`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, completed: false };
}

/**
 * Self-service buyout: the customer pays the small final buyout amount once the
 * rental term is complete, transferring ownership immediately. This is the "own
 * it for as little as R10" moment -- no admin involvement required.
 */
export async function payBuyout(agreementId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const service = createServiceClient();
  const { data: agreement } = await service
    .from("agreements")
    .select("*")
    .eq("id", agreementId)
    .eq("customer_id", user.id)
    .single<Agreement>();
  if (!agreement) return { error: "Agreement not found." };
  if (agreement.ownership_status !== "OWNERSHIP_PENDING") {
    return { error: "This agreement isn't ready for buyout yet." };
  }

  const { data: buyoutPayment } = await service
    .from("payment_schedule")
    .select("*")
    .eq("agreement_id", agreementId)
    .eq("payment_type", "BUYOUT")
    .maybeSingle<ScheduledPayment>();

  const result = await PaymentGatewayService.chargeBuyout(agreement.customer_id, agreement.buyout_amount);
  if (!result.ok) return { error: result.message ?? "Buyout payment failed. Please try again." };

  if (buyoutPayment) {
    await service
      .from("payment_schedule")
      .update({
        status: "PAID",
        paid_date: new Date().toISOString().slice(0, 10),
        payment_reference: result.reference,
        provider: "mock",
      })
      .eq("id", buyoutPayment.id);
  }

  const amountPaid = Number(agreement.amount_paid) + Number(agreement.buyout_amount);
  await service.from("agreements").update({ amount_paid: amountPaid, amount_remaining: 0 }).eq("id", agreement.id);
  await service.from("audit_logs").insert({
    actor: user.id,
    action: "PAYMENT_RECEIVED",
    entity: "agreement",
    entity_id: agreement.id,
    metadata: { type: "BUYOUT", amount: agreement.buyout_amount, reference: result.reference },
  });

  await finalizeBuyout({ ...agreement, amount_paid: amountPaid }, user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Simulates the scheduled job that would run daily in production.
 * Uses the configurable device_control_rules row rather than a hard-coded
 * grace period. Debit orders are never automatically retried once they fail --
 * the device stays restricted until the customer makes a manual payment.
 */
export async function runOverdueSweep() {
  const adminId = await requireAdmin();
  const service = createServiceClient();

  const { data: rules } = await service.from("device_control_rules").select("*").limit(1).single();
  const restrictAfterDays = rules?.restrict_after_days_overdue ?? 7;

  const today = new Date();
  const { data: duePayments } = await service
    .from("payment_schedule")
    .select("*")
    .in("status", ["SCHEDULED", "OVERDUE"])
    .neq("payment_type", "BUYOUT")
    .lt("due_date", today.toISOString().slice(0, 10));

  let restrictedCount = 0;
  let markedOverdueCount = 0;

  for (const payment of duePayments ?? []) {
    const daysOverdue = Math.floor((today.getTime() - new Date(payment.due_date).getTime()) / 86400000);

    if (payment.status !== "OVERDUE") {
      await service.from("payment_schedule").update({ status: "OVERDUE" }).eq("id", payment.id);
      await service.from("audit_logs").insert({
        actor: adminId,
        action: "PAYMENT_OVERDUE",
        entity: "payment_schedule",
        entity_id: payment.id,
        metadata: { days_overdue: daysOverdue },
      });
      markedOverdueCount++;
    }

    if (daysOverdue >= restrictAfterDays) {
      const { data: agreement } = await service
        .from("agreements")
        .select("*")
        .eq("id", payment.agreement_id)
        .single<Agreement>();
      if (!agreement) continue;

      const { data: device } = await service
        .from("inventory")
        .select("*")
        .eq("id", agreement.device_id)
        .single<InventoryDevice>();
      if (!device) continue;

      const { data: control } = await service
        .from("device_control")
        .select("*")
        .eq("device_id", device.id)
        .maybeSingle();
      if (control && control.status !== "RESTRICTED") {
        await DeviceControlService.restrictDevice(
          device,
          `Debit order for payment #${payment.payment_number} failed and has not been resolved for ${daysOverdue} days`,
          "system",
        );
        await service.from("agreements").update({ status: "DEFAULTED" }).eq("id", agreement.id);
        await service.from("notifications").insert({
          customer_id: agreement.customer_id,
          type: "DEVICE_RESTRICTED",
          title: "Device restricted",
          body: "Your debit order failed and hasn't been resolved. Your device has been restricted -- make a manual payment to restore access. Debit orders are not automatically retried.",
        });
        restrictedCount++;
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, markedOverdueCount, restrictedCount };
}
