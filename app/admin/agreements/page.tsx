import { redirect } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/pricing";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-signal-light text-signal-dark",
  PAUSED: "bg-amber-100 text-amber-800",
  DEFAULTED: "bg-alert-light text-alert-dark",
  COMPLETED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-slate-100 text-slate-400",
};

export default async function AdminAgreementsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: agreements } = await supabase
    .from("agreements")
    .select("*, product:products(name), customer:profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">Agreements</h1>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Agreement</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Device</th>
              <th className="px-4 py-2">Progress</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agreements?.map((agreement: any) => (
              <tr key={agreement.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/agreements/${agreement.id}`} className="font-medium text-ink hover:text-signal">
                    {agreement.agreement_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{agreement.customer?.full_name}</td>
                <td className="px-4 py-3">{agreement.product?.name}</td>
                <td className="px-4 py-3">
                  {agreement.payments_completed} / {agreement.payments_required} · {formatCurrency(agreement.amount_remaining)} left
                </td>
                <td className="px-4 py-3">
                  <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", statusStyles[agreement.status])}>
                    {agreement.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
