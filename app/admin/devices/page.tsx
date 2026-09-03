import { redirect } from "next/navigation";
import clsx from "clsx";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { adminRestrictDevice, adminRestoreDevice, adminReleaseDevice } from "@/lib/actions/admin";
import { recordPayment } from "@/lib/actions/payments";

const controlStyles: Record<string, string> = {
  NOT_REGISTERED: "bg-slate-100 text-slate-500",
  REGISTERED: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-signal-light text-signal-dark",
  RESTRICTION_PENDING: "bg-amber-100 text-amber-800",
  RESTRICTED: "bg-alert-light text-alert-dark",
  RESTORE_PENDING: "bg-amber-100 text-amber-800",
  ERROR: "bg-alert-light text-alert-dark",
  RELEASED: "bg-slate-100 text-slate-500",
};

export default async function AdminDevicesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: devices } = await supabase
    .from("inventory")
    .select("*, product:products(name), customer:profiles(full_name), device_control(*), agreement:agreements(agreement_number, status)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">Devices</h1>
      <p className="mt-2 text-slate-600">Every physical device, its assignment, and its device-control status.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Asset</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Agreement</th>
              <th className="px-4 py-2">Device control</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices?.map((device: any) => {
              const control = Array.isArray(device.device_control) ? device.device_control[0] : device.device_control;
              return (
                <tr key={device.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{device.asset_number}</p>
                    <p className="text-xs text-slate-400">{device.status}</p>
                  </td>
                  <td className="px-4 py-3">{device.product?.name}</td>
                  <td className="px-4 py-3">{device.customer?.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {device.agreement?.agreement_number ?? "—"}
                    {device.agreement?.status && (
                      <p className="text-xs text-slate-400">{device.agreement.status}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", controlStyles[control?.status ?? "NOT_REGISTERED"])}>
                      {control?.status ?? "NOT_REGISTERED"}
                    </span>
                    {control?.restriction_reason && (
                      <p className="mt-1 text-xs text-slate-400">{control.restriction_reason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
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
                          <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
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

      <p className="mt-4 text-xs text-slate-400">
        Restrict / Restore / Release call the DeviceControlService abstraction — routed to the mock
        provider in development. Every action is written to device_control and audit_logs.
      </p>
    </div>
  );
}
