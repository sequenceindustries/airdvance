import { redirect } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/domain";

const statusStyles: Record<ApplicationStatus, string> = {
  DRAFT: "bg-white/10 text-slate-400",
  SUBMITTED: "bg-white/10 text-slate-300",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  MORE_INFORMATION_REQUIRED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-signal-light text-signal-dark",
  DECLINED: "bg-alert-light text-alert-dark",
  CANCELLED: "bg-white/10 text-slate-500",
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  let query = supabase
    .from("applications")
    .select("*, product:products(name), plan:rental_plans(term_months, monthly_payment)")
    .order("created_at", { ascending: false });

  if (searchParams.status) query = query.eq("status", searchParams.status);

  const { data: applications } = await query;
  const filtered = searchParams.q
    ? applications?.filter((a: any) =>
        (a.personal_info?.full_name ?? "").toLowerCase().includes(searchParams.q!.toLowerCase()),
      )
    : applications;

  const statuses: ApplicationStatus[] = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "MORE_INFORMATION_REQUIRED",
    "APPROVED",
    "DECLINED",
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl">Applications</h1>

      <form className="mt-6 flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          placeholder="Search by name"
          defaultValue={searchParams.q}
          className="input max-w-xs"
        />
        <select name="status" defaultValue={searchParams.status ?? ""} className="input max-w-xs">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-2">Applicant</th>
              <th className="px-4 py-2">Device</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered?.map((application: any) => (
              <tr key={application.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/applications/${application.id}`} className="font-medium text-ink hover:text-signal">
                    {application.personal_info?.full_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3">{application.product?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {application.plan ? `${application.plan.term_months}mo · R${application.plan.monthly_payment}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", statusStyles[application.status as ApplicationStatus])}>
                    {application.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {filtered?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No applications match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
