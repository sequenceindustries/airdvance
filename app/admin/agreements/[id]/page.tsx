import { notFound, redirect } from "next/navigation";
import clsx from "clsx";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/pricing";
import { recordPayment } from "@/lib/actions/payments";

const statusStyles: Record<string, string> = {
  PAID: "bg-signal-light text-signal-dark",
  SCHEDULED: "bg-slate-100 text-slate-600",
  OVERDUE: "bg-alert-light text-alert-dark",
  PROCESSING: "bg-amber-100 text-amber-800",
  FAILED: "bg-alert-light text-alert-dark",
  CANCELLED: "bg-slate-100 text-slate-400",
};

export default async function AdminAgreementDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: agreement } = await supabase
    .from("agreements")
    .select("*, product:products(name), customer:profiles(full_name, email), device:inventory(*, device_control(*))")
    .eq("id", params.id)
    .maybeSingle();
  if (!agreement) notFound();

  const { data: schedule } = await supabase
    .from("payment_schedule")
    .select("*")
    .eq("agreement_id", agreement.id)
    .order("payment_number", { ascending: true });

  const control = Array.isArray(agreement.device?.device_control)
    ? agreement.device.device_control[0]
    : agreement.device?.device_control;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-slate-500">{agreement.agreement_number}</p>
      <h1 className="font-display text-3xl">{agreement.product?.name}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {agreement.customer?.full_name} · {agreement.customer?.email}
      </p>

      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-3 text-sm">
        <div>
          <p className="text-slate-500">Agreement status</p>
          <p className="mt-1 font-medium">{agreement.status}</p>
        </div>
        <div>
          <p className="text-slate-500">Ownership</p>
          <p className="mt-1 font-medium">{agreement.ownership_status}</p>
        </div>
        <div>
          <p className="text-slate-500">Device control</p>
          <p className="mt-1 font-medium">{control?.status ?? "NOT_REGISTERED"}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl">Payment schedule</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Due</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule?.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-2">{payment.payment_number}</td>
                <td className="px-4 py-2">{payment.due_date}</td>
                <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-2">
                  <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", statusStyles[payment.status])}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {payment.status !== "PAID" && payment.status !== "CANCELLED" && (
                    <form action={async () => { "use server"; await recordPayment(payment.id); }}>
                      <button className="rounded-md border border-signal/40 px-3 py-1 text-xs font-medium text-signal hover:bg-signal-light">
                        Mark paid
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Marking a payment paid restores a restricted device automatically, and grants ownership once every
        required payment has been recorded.
      </p>
    </div>
  );
}
