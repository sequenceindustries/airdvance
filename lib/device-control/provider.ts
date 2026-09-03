import type { DeviceControlStatus, InventoryDevice } from "@/types/domain";

/**
 * DeviceControlProvider is the single seam between Airdvance's business logic
 * and whatever external device-management/MDM vendor eventually locks or
 * unlocks a physical handset, tablet, or laptop.
 *
 * Nothing outside lib/device-control should import a vendor SDK directly.
 * Business logic (agreements, payments, admin actions) talks to
 * DeviceControlService, which talks to whichever provider is configured here.
 */
export interface DeviceControlResult {
  ok: boolean;
  status: DeviceControlStatus;
  providerDeviceId?: string;
  message?: string;
  raw?: unknown;
}

export interface DeviceControlProvider {
  readonly name: string;

  registerDevice(device: InventoryDevice): Promise<DeviceControlResult>;
  activateDevice(device: InventoryDevice): Promise<DeviceControlResult>;
  restrictDevice(device: InventoryDevice, reason: string): Promise<DeviceControlResult>;
  restoreDevice(device: InventoryDevice): Promise<DeviceControlResult>;
  getDeviceStatus(device: InventoryDevice): Promise<DeviceControlResult>;
  releaseDevice(device: InventoryDevice): Promise<DeviceControlResult>;
}
