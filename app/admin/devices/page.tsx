import { redirect } from "next/navigation";
import clsx from "clsx";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { adminRestrictDevice, adminRestoreDevice, adminReleaseDevice, markDeviceShipped } from "@/lib/actions/admin";

const controlStyles: Record<string, string> = {
  NOT_REGISTERED: "bg-white/10 text-slate-400",
  REGISTERED: "bg-white/10 text-slate-300",
  ACTIVE: "bg-signal-light text-signal-dark",
  RESTRICTION_PENDING: "bg-amber-100 text-amber-800",
  RESTRICTED: "bg-alert-light text-alert-dark",
  RESTORE_PENDING: "bg-amber-100 text-amber-800",
  ERROR: "bg-alert-light text-alert-dark",
  RELEASED: "bg-white/10 text-slate-400",
};

export default async function AdminDevicesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: devices } = await supabase
    .from("inventory")
    .select("*, product:products(name), customer:profiles(full_name), device_control(*), agreement:agreements!inventory_agreement_fk(agreement_number, status)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">Devices</h1>
      <p className="mt-2 text-slate-300">Every physical device, its assignment, and its device-control status.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10 bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-2">Asset</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Agreement</th>
              <th className="px-4 py-2">Device control</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {devices?.map((device: any) => {
              const control = Array.isArray(device.device_control) ? device.device_control[0] : device.device_control;
              return (
                <tr key={device.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{device.asset_number}</p>
                    <p className="text-xs text-slate-500">
                      {device.status === "ALLOCATED" ? "Awaiting shipment" : device.status}
                    </p>
                  </td>
                  <td className="px-4 py-3">{device.product?.name}</td>
                  <td className="px-4 py-3">{device.customer?.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {device.agreement?.agreement_number ?? "—"}
                    {device.agreement?.status && (
                      <p className="text-xs text-slate-500">{device.agreement.status}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", controlStyles[control?.status ?? "NOT_REGISTERED"])}>
                      {control?.status ?? "NOT_REGISTERED"}
                    </span>
                    {control?.restriction_reason && (
                      <p className="mt-1 text-xs text-slate-500">{control.restriction_reason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {device.status === "ALLOCATED" && (
                        <form action={async () => { "use server"; await markDeviceShipped(device.id); }}>
                          <button className="rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-dark">
                            Mark shipped
                          </button>
                        </form>
                      )}
                      {control?.status !== "RESTRICTED" && device.agreement_id && (
                        <form action={async (fd: FormData) => { "use server"; await adminRestrictDevice(device.id, String(fd.get("reason") ?? "Manual restriction")); }}>
                          <input type="hidden" name="reason" value="Restricted by admin" />
                          <button className="rounded-md border border-alert/40 px-3 py-1 text-xs font-medium text-alert hover:bg-alert-light">
                            Restrict
                          </button>
                        </form>
                      )}
                      {control?.status === "RESTRICTED" && (
                        <form action={async () => { "use server"; await adminRestoreDevice(device.id); }}>
                          <button className="rounded-md border border-signal/40 px-3 py-1 text-xs font-medium text-signal hover:bg-signal-light">
                            Restore
                          </button>
                        </form>
                      )}
                      {device.status !== "OWNED" && control?.status !== "RELEASED" && device.agreement_id && (
                        <form action={async () => { "use server"; await adminReleaseDevice(device.id); }}>
                          <button className="rounded-md border border-white/20 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10">
                            Release
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Restrict / Restore / Release call the DeviceControlService abstraction — routed to the mock
        provider in development. Every action is written to device_control and audit_logs.
      </p>
    </div>
  );
}
