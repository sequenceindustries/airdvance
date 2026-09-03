"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DeviceControlService } from "@/lib/device-control/service";
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

/**
 * Records a scheduled payment as PAID (simulating a payment gateway webhook),
 * updates the agreement's progress, restores a restricted device if needed,
 * and completes the agreement + grants ownership once every required
 * payment has been made.
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

  const paymentsCompleted = agreement.payments_completed + 1;
  const amountPaid = Number(agreement.amount_paid) + Number(payment.amount);
  const amountRemaining = Math.max(0, Number(agreement.total_payable) - amountPaid);
  const completed = paymentsCompleted >= agreement.payments_required;

  await service
    .from("agreements")
    .update({
      payments_completed: paymentsCompleted,
      amount_paid: amountPaid,
      amount_remaining: amountRemaining,
      status: completed ? "COMPLETED" : "ACTIVE",
      ownership_status: completed ? "OWNED" : "NOT_OWNED",
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", agreement.id);

  await service.from("audit_logs").insert({
    actor: adminId,
    action: "PAYMENT_RECEIVED",
    entity: "payment_schedule",
    entity_id: paymentId,
    metadata: { agreement_id: agreement.id, payment_number: payment.payment_number },
  });
  await service.from("notifications").insert({
    customer_id: agreement.customer_id,
    type: "PAYMENT_RECEIVED",
    title: "Payment received",
    body: `We've received your payment of R${payment.amount} for agreement ${agreement.agreement_number}.`,
  });

  const { data: device } = await service
    .from("inventory")
    .select("*")
    .eq("id", agreement.device_id)
    .single<InventoryDevice>();

  if (device) {
    const { data: control } = await service
      .from("device_control")
      .select("*")
      .eq("device_id", device.id)
      .maybeSingle();

    if (control?.status === "RESTRICTED") {
      await DeviceControlService.restoreDevice(device, adminId);
      await service.from("notifications").insert({
        customer_id: agreement.customer_id,
        type: "DEVICE_RESTORED",
        title: "Device restored",
        body: "Your device has been restored following your payment.",
      });
    }

    if (completed) {
      await DeviceControlService.releaseDevice(device, adminId);
      await service.from("inventory").update({ status: "OWNED" }).eq("id", device.id);
      await service.from("audit_logs").insert({
        actor: adminId,
        action: "OWNERSHIP_GRANTED",
        entity: "agreement",
        entity_id: agreement.id,
        metadata: {},
      });
      await service.from("audit_logs").insert({
        actor: adminId,
        action: "AGREEMENT_COMPLETED",
        entity: "agreement",
        entity_id: agreement.id,
        metadata: {},
      });
      await service.from("notifications").insert({
        customer_id: agreement.customer_id,
        type: "OWNERSHIP_ACHIEVED",
        title: "Congratulations — it's yours!",
        body: "You've completed every payment. The device is now officially yours.",
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, completed };
}

/**
 * Simulates the scheduled job that would run daily in production.
 * Uses the configurable device_control_rules row rather than a hard-coded
 * grace period (spec §18).
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
        await DeviceControlService.restrictDevice(device, `Payment #${payment.payment_number} overdue by ${daysOverdue} days`, "system");
        await service.from("agreements").update({ status: "DEFAULTED" }).eq("id", agreement.id);
        await service.from("notifications").insert({
          customer_id: agreement.customer_id,
          type: "DEVICE_RESTRICTED",
          title: "Device restricted",
          body: "Your device has been restricted because a payment is overdue. Make your outstanding payment to restore access.",
        });
        restrictedCount++;
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, markedOverdueCount, restrictedCount };
}
