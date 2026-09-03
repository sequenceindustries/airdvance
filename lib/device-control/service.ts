import type { InventoryDevice } from "@/types/domain";
import type { DeviceControlProvider, DeviceControlResult } from "./provider";
import { MockDeviceControlProvider } from "./mock-provider";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * DeviceControlService is what the rest of the application calls.
 * It resolves the active provider, calls it, then persists the result to the
 * device_control table and writes an audit_logs row — so every command is
 * auditable regardless of which provider executed it.
 *
 * To go live with a real vendor: implement DeviceControlProvider in a new
 * file (e.g. acme-mdm-provider.ts) and change `resolveProvider()` below.
 * No other code in the app needs to change.
 */
function resolveProvider(): DeviceControlProvider {
  // process.env.DEVICE_CONTROL_PROVIDER would select a real provider here.
  return new MockDeviceControlProvider();
}

async function recordCommand(
  device: InventoryDevice,
  command: string,
  result: DeviceControlResult,
  actor: string,
  reason?: string,
) {
  const supabase = createServiceClient();

  await supabase
    .from("device_control")
    .update({
      status: result.status,
      last_command: command,
      last_command_at: new Date().toISOString(),
      last_response: result.message ?? null,
      provider: resolveProvider().name,
      provider_device_id: result.providerDeviceId ?? undefined,
      restriction_reason: command === "restrictDevice" ? reason ?? null : undefined,
      restricted_at: command === "restrictDevice" ? new Date().toISOString() : undefined,
      restored_at: command === "restoreDevice" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("device_id", device.id);

  const auditAction =
    command === "restrictDevice"
      ? "DEVICE_RESTRICTED"
      : command === "restoreDevice"
        ? "DEVICE_RESTORED"
        : command === "registerDevice"
          ? "DEVICE_REGISTERED"
          : command === "releaseDevice"
            ? "DEVICE_RELEASED"
            : "DEVICE_ACTIVATED";

  await supabase.from("audit_logs").insert({
    actor,
    action: auditAction,
    entity: "device",
    entity_id: device.id,
    metadata: { command, reason, result },
  });
}

export const DeviceControlService = {
  async registerDevice(device: InventoryDevice, actor = "system") {
    const result = await resolveProvider().registerDevice(device);
    await recordCommand(device, "registerDevice", result, actor);
    return result;
  },

  async activateDevice(device: InventoryDevice, actor = "system") {
    const result = await resolveProvider().activateDevice(device);
    await recordCommand(device, "activateDevice", result, actor);
    return result;
  },

  async restrictDevice(device: InventoryDevice, reason: string, actor = "system") {
    const result = await resolveProvider().restrictDevice(device, reason);
    await recordCommand(device, "restrictDevice", result, actor, reason);
    return result;
  },

  async restoreDevice(device: InventoryDevice, actor = "system") {
    const result = await resolveProvider().restoreDevice(device);
    await recordCommand(device, "restoreDevice", result, actor);
    return result;
  },

  async getDeviceStatus(device: InventoryDevice) {
    return resolveProvider().getDeviceStatus(device);
  },

  async releaseDevice(device: InventoryDevice, actor = "system") {
    const result = await resolveProvider().releaseDevice(device);
    await recordCommand(device, "releaseDevice", result, actor);
    return result;
  },
};
