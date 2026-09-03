"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DeviceControlService } from "@/lib/device-control/service";
import { totalPayable } from "@/lib/pricing";
import type { Application, InventoryDevice, RentalPlan } from "@/types/domain";

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
 * Approves an application: allocates an available physical device, creates
 * the agreement, generates the full payment schedule, and registers +
 * activates the device with the device-control abstraction layer.
 * This is the single place "Application -> Agreement" happens (spec §14).
 */
export async function approveApplication(applicationId: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();

  const { data: application } = await service
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single<Application>();
  if (!application) return { error: "Application not found." };

  const { data: plan } = await service
    .from("rental_plans")
    .select("*")
    .eq("id", application.rental_plan_id)
    .single<RentalPlan>();
  if (!plan) return { error: "Rental plan not found." };

  const { data: device } = await service
    .from("inventory")
    .select("*")
    .eq("product_id", application.product_id)
    .eq("status", "AVAILABLE")
    .limit(1)
    .maybeSingle<InventoryDevice>();
  if (!device) return { error: "No available device in stock for this product." };

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
      total_payable: total,
      payments_required: plan.term_months,
      payments_completed: 0,
      amount_paid: 0,
      amount_remaining: total,
      status: "ACTIVE",
      ownership_status: "NOT_OWNED",
    })
    .select()
    .single();
  if (agreementErr) return { error: agreementErr.message };

  const schedule = Array.from({ length: plan.term_months }).map((_, i) => {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i + 1);
    return {
      agreement_id: agreement.id,
      customer_id: application.customer_id,
      payment_number: i + 1,
      amount: plan.monthly_payment,
      due_date: due.toISOString().slice(0, 10),
      status: "SCHEDULED",
    };
  });
  await service.from("payment_schedule").insert(schedule);
  await service.from("audit_logs").insert(
    schedule.map((s) => ({
      actor: adminId,
      action: "PAYMENT_CREATED",
      entity: "payment_schedule",
      entity_id: agreement.id,
      metadata: { payment_number: s.payment_number, due_date: s.due_date },
    })),
  );

  await service
    .from("inventory")
    .update({ status: "ALLOCATED", agreement_id: agreement.id, customer_id: application.customer_id })
    .eq("id", device.id);

  await DeviceControlService.registerDevice(device, adminId);
  await DeviceControlService.activateDevice({ ...device, status: "ACTIVE" }, adminId);
  await service.from("inventory").update({ status: "ACTIVE" }).eq("id", device.id);

  await service
    .from("applications")
    .update({ status: "APPROVED", decided_at: new Date().toISOString() })
    .eq("id", applicationId);

  await service.from("audit_logs").insert([
    { actor: adminId, action: "APPLICATION_APPROVED", entity: "application", entity_id: applicationId, metadata: {} },
    { actor: adminId, action: "AGREEMENT_CREATED", entity: "agreement", entity_id: agreement.id, metadata: { agreement_number: agreementNumber } },
  ]);

  await service.from("notifications").insert([
    { customer_id: application.customer_id, type: "APPLICATION_APPROVED", title: "Application approved", body: `Your application was approved. Agreement ${agreementNumber} is now active.`, },
    { customer_id: application.customer_id, type: "AGREEMENT_CREATED", title: "Agreement created", body: `Your rent-to-own agreement ${agreementNumber} has been created.` },
  ]);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true, agreementId: agreement.id };
}

export async function declineApplication(applicationId: string, reason: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();

  const { data: application } = await service.from("applications").select("*").eq("id", applicationId).single();

  await service
    .from("applications")
    .update({
      status: "DECLINED",
      decided_at: new Date().toISOString(),
      internal_notes: [...(application?.internal_notes ?? []), { author: adminId, note: reason, created_at: new Date().toISOString() }],
    })
    .eq("id", applicationId);

  await service.from("audit_logs").insert({
    actor: adminId,
    action: "APPLICATION_DECLINED",
    entity: "application",
    entity_id: applicationId,
    metadata: { reason },
  });

  if (application) {
    await service.from("notifications").insert({
      customer_id: application.customer_id,
      type: "APPLICATION_DECLINED",
      title: "Application declined",
      body: "Unfortunately your application was not approved this time.",
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
}

export async function requestMoreInformation(applicationId: string, note: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();
  const { data: application } = await service.from("applications").select("*").eq("id", applicationId).single();

  await service
    .from("applications")
    .update({
      status: "MORE_INFORMATION_REQUIRED",
      internal_notes: [...(application?.internal_notes ?? []), { author: adminId, note, created_at: new Date().toISOString() }],
    })
    .eq("id", applicationId);

  await service.from("audit_logs").insert({
    actor: adminId,
    action: "APPLICATION_MORE_INFO_REQUESTED",
    entity: "application",
    entity_id: applicationId,
    metadata: { note },
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
}

export async function adminRestrictDevice(deviceId: string, reason: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();
  const { data: device } = await service.from("inventory").select("*").eq("id", deviceId).single<InventoryDevice>();
  if (!device) return { error: "Device not found." };
  await DeviceControlService.restrictDevice(device, reason, adminId);
  revalidatePath("/admin/devices");
  return { success: true };
}

export async function adminRestoreDevice(deviceId: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();
  const { data: device } = await service.from("inventory").select("*").eq("id", deviceId).single<InventoryDevice>();
  if (!device) return { error: "Device not found." };
  await DeviceControlService.restoreDevice(device, adminId);
  revalidatePath("/admin/devices");
  return { success: true };
}

export async function adminReleaseDevice(deviceId: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();
  const { data: device } = await service.from("inventory").select("*").eq("id", deviceId).single<InventoryDevice>();
  if (!device) return { error: "Device not found." };
  await DeviceControlService.releaseDevice(device, adminId);
  revalidatePath("/admin/devices");
  return { success: true };
}
