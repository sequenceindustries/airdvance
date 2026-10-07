import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { loanBalance, normaliseLoan, type LoanRow } from "@/lib/loans";
import { formatRand } from "@/lib/pricing";

const FILTERS = ["OPEN", "OFFERED", "ACCEPTED", "ACTIVE", "ARREARS", "SETTLED", "ALL"];

export default async function AdminLoans({ searchParams }: { searchParams: { status?: string } }) {
  const status = FILTERS.includes(searchParams.status ?? "") ? searchParams.status! : "OPEN";
  const rows = (
    await query<LoanRow & { full_name: string }>(
      `select l.*, u.full_name from loans l join users u on u.id = l.user_id
        where ($1 = 'ALL' or ($1 = 'OPEN' and l.status in ('OFFERED','ACCEPTED','ACTIVE','ARREARS')) or l.status = $1)
        order by l.due_date asc, l.created_at desc limit 300`,
      [status],
    )
  ).map((r) => ({ ...normaliseLoan(r), full_name: r.full_name }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Loans</h1>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={`/admin/loans?status=${f}`} className={`rounded-full border px-3 py-1.5 text-xs ${f === status ? "border-ember bg-ember/15" : "border-white/10 text-ink-muted hover:border-white/25"}`}>
            {f.toLowerCase()}
          </Link>
        ))}
      </div>
      <div className="glass overflow-x-auto">
        <table className="table-x min-w-[760px]">
          <thead>
            <tr><th>Reference</th><th>Customer</th><th>Principal</th><th>Due</th><th>Outstanding today</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink-muted">No loans.</td></tr>}
            {rows.map((l) => {
              const bal = loanBalance(l);
              return (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td><Link href={`/admin/loans/${l.id}`} className="font-medium text-ember-300 hover:underline">{l.reference}</Link></td>
                  <td>{l.full_name}</td>
                  <td className="tabular-nums">{formatRand(Number(l.principal), { cents: false })}</td>
                  <td>{formatDate(l.due_date, { weekday: false })}</td>
                  <td className="tabular-nums">{bal ? formatRand(bal.outstanding) : "—"}</td>
                  <td><StatusBadge status={l.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
