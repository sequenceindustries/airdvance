import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { query } from "@/lib/db";
import { formatDateTime } from "@/lib/dates";
import { formatRand } from "@/lib/pricing";

const FILTERS = ["SUBMITTED", "MORE_INFO_REQUIRED", "APPROVED", "DECLINED", "WITHDRAWN", "ALL"];

export default async function AdminApplications({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const status = FILTERS.includes(searchParams.status ?? "") ? searchParams.status! : "SUBMITTED";
  const q = (searchParams.q ?? "").trim();
  const rows = await query<any>(
    `select a.id, a.reference, a.status, a.requested_amount, a.submitted_at, a.affordability, u.full_name, u.mobile
       from applications a join users u on u.id = a.user_id
      where ($1 = 'ALL' or a.status = $1)
        and ($2 = '' or u.full_name ilike '%' || $2 || '%' or a.reference ilike '%' || $2 || '%' or u.mobile like '%' || $2 || '%' or a.id_number_last4 = $2)
      order by a.submitted_at ${status === "SUBMITTED" ? "asc" : "desc"} limit 200`,
    [status, q],
  );
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Applications</h1>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/applications?status=${f}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${f === status ? "border-ember bg-ember/15" : "border-ink/10 text-ink-muted hover:border-ink/25"}`}
          >
            {f === "ALL" ? "All" : f.replaceAll("_", " ").toLowerCase()}
          </Link>
        ))}
        <form className="ml-auto">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Name, ref, mobile, ID last 4" className="input w-64 py-2" />
        </form>
      </div>
      <div className="glass overflow-x-auto">
        <table className="table-x min-w-[720px]">
          <thead>
            <tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Affordability</th><th>Submitted</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-ink-muted">No applications.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-ink/[0.02]">
                <td><Link href={`/admin/applications/${r.id}`} className="font-medium text-ember-300 hover:underline">{r.reference}</Link></td>
                <td>{r.full_name}</td>
                <td className="tabular-nums">{formatRand(Number(r.requested_amount), { cents: false })}</td>
                <td className={r.affordability?.passes ? "text-mint-300" : "text-rose-300"}>
                  {r.affordability ? formatRand(r.affordability.headroomAfterRepayment, { cents: false }) + " left" : "—"}
                </td>
                <td className="text-ink-muted">{formatDateTime(r.submitted_at)}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
