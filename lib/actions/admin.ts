"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DeviceControlService } from "@/lib/device-control/service";
import type { InventoryDevice } from "@/types/domain";

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
 * Applications are approved automatically the moment the first debit order
 * succeeds (see lib/actions/applications.ts) -- there is no manual review gate
 * in this flow. The one manual step left in the physical world is shipping:
 * once a device has been packed and handed to a courier, an admin marks it
 * shipped, which activates it with the device-control abstraction layer.
 */
export async function markDeviceShipped(deviceId: string) {
  const adminId = await requireAdmin();
  const service = createServiceClient();
  const { data: device } = await service.from("inventory").select("*").eq("id", deviceId).single<InventoryDevice>();
  if (!device) return { error: "Device not found." };

  await DeviceControlService.activateDevice(device, adminId);
  await service.from("inventory").update({ status: "ACTIVE" }).eq("id", deviceId);

  if (device.customer_id) {
    await service.from("notifications").insert({
      customer_id: device.customer_id,
      type: "AGREEMENT_CREATED",
      title: "Your device is on its way",
      body: "Your device has shipped. Keep an eye out for delivery.",
    });
  }

  revalidatePath("/admin/devices");
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
