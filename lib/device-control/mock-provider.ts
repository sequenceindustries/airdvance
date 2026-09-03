import type { InventoryDevice } from "@/types/domain";
import type { DeviceControlProvider, DeviceControlResult } from "./provider";

/**
 * MockDeviceControlProvider simulates a real MDM/device-financing vendor for
 * local development and demos. It does NOT lock or unlock a physical device —
 * it only returns the same shape of result a real provider would return, so
 * the rest of the system (agreements, payments, dashboards) can be built and
 * demonstrated end-to-end before a real vendor is integrated.
 *
 * Swap this out in production by implementing DeviceControlProvider against
 * the chosen vendor's SDK/API and wiring it up in lib/device-control/service.ts.
 */
export class MockDeviceControlProvider implements DeviceControlProvider {
  readonly name = "mock";

  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  async registerDevice(device: InventoryDevice): Promise<DeviceControlResult> {
    await this.simulateLatency();
    return {
      ok: true,
      status: "REGISTERED",
      providerDeviceId: `mock_${device.asset_number}`,
      message: "Device registered with mock provider (simulation only).",
    };
  }

  async activateDevice(_device: InventoryDevice): Promise<DeviceControlResult> {
    await this.simulateLatency();
    return {
      ok: true,
      status: "ACTIVE",
      message: "Device marked active (simulation only).",
    };
  }

  async restrictDevice(_device: InventoryDevice, reason: string): Promise<DeviceControlResult> {
    await this.simulateLatency();
    return {
      ok: true,
      status: "RESTRICTED",
      message: `Device restricted (simulation only). Reason: ${reason}`,
    };
  }

  async restoreDevice(_device: InventoryDevice): Promise<DeviceControlResult> {
    await this.simulateLatency();
    return {
      ok: true,
      status: "ACTIVE",
      message: "Device restored (simulation only).",
    };
  }

  async getDeviceStatus(device: InventoryDevice): Promise<DeviceControlResult> {
    await this.simulateLatency();
    return {
      ok: true,
      status: "ACTIVE",
      providerDeviceId: `mock_${device.asset_number}`,
    };
  }

  async releaseDevice(_device: InventoryDevice): Promise<DeviceControlResult> {
    await this.simulateLatency();
    return {
      ok: true,
      status: "RELEASED",
      message: "Device released from control (simulation only).",
    };
  }
}
