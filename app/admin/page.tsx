import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { one, query } from "@/lib/db";
import { formatDate, formatDateTime, todaySA } from "@/lib/dates";
import { runSweep } from "@/lib/loans";
import { formatRand } from "@/lib/pricing";

export default async function AdminOverview() {
  const sweep = await runSweep();
  const today = todaySA();
  const stats = await one<Record<string, string>>(
    `select
       (select count(*) from applications where status = 'SUBMITTED') as review,
       (select count(*) from applications where status = 'MORE_INFO_REQUIRED') as info,
       (select count(*) from loans where status = 'OFFERED') as offered,
       (select count(*) from loans where status = 'ACCEPTED') as payout,
       (select count(*) from loans where status = 'ACTIVE') as active,
       (select count(*) from loans where status = 'ARREARS') as arrears,
       (select coalesce(sum(principal),0) from loans where status in ('ACTIVE','ARREARS')) as book,
       (select coalesce(sum(principal),0) from loans where disbursed_on >= date_trunc('month', $1::date)) as disbursed_month,
       (select count(*) from loans where status = 'ACTIVE' and due_date = $1::date) as due_today,
       (select count(*) from contact_messages where handled_at is null) as messages`,
    [today],
  );
  const queue = await query<{ id: string; reference: string; full_name: string; requested_amount: string; submitted_at: string; affordability: any; status: string }>(
    `select a.id, a.reference, u.full_name, a.requested_amount, a.submitted_at, a.affordability, a.status
       from applications a join users u on u.id = a.user_id
      where a.status = 'SUBMITTED' order by a.submitted_at limit 8`,
  );
  const payouts = await query<{ id: string; reference: string; full_name: string; principal: string; signed_at: string }>(
    `select l.id, l.reference, u.full_name, l.principal, l.signed_at from loans l join users u on u.id = l.user_id
      where l.status = 'ACCEPTED' order by l.signed_at limit 8`,
  );
  const due = await query<{ id: string; reference: string; full_name: string; due_date: string; status: string }>(
    `select l.id, l.reference, u.full_name, l.due_date, l.status from loans l join users u on u.id = l.user_id
      where l.status in ('ACTIVE','ARREARS') order by l.due_date limit 8`,
  );

  const tiles = [
    { label: "Awaiting review", value: stats!.review, href: "/admin/applications?status=SUBMITTED", hot: Number(stats!.review) > 0 },
    { label: "Waiting on customer", value: stats!.info, href: "/admin/applications?status=MORE_INFO_REQUIRED" },
    { label: "Offers unsigned", value: stats!.offered, href: "/admin/loans?status=OFFERED" },
    { label: "Ready for payout", value: stats!.payout, href: "/admin/loans?status=ACCEPTED", hot: Number(stats!.payout) > 0 },
    { label: "Active loans", value: stats!.active, href: "/admin/loans?status=ACTIVE" },
    { label: "In arrears", value: stats!.arrears, href: "/admin/loans?status=ARREARS", hot: Number(stats!.arrears) > 0 },
    { label: "Book (principal)", value: formatRand(Number(stats!.book), { cents: false }), href: "/admin/loans" },
    { label: "Paid out this month", value: formatRand(Number(stats!.disbursed_month), { cents: false }), href: "/admin/loans" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">Overview</h1>
        <p className="text-xs text-ink-faint">
          {formatDate(today)} · housekeeping: {sweep.expired} offers expired, {sweep.arrears} moved to arrears
          {Number(stats!.messages) > 0 && (
            <>
              {" · "}
              <Link href="/admin/messages" className="text-ember-300 underline">{stats!.messages} unread messages</Link>
            </>
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`glass p-4 transition hover:border-white/20 ${t.hot ? "border-ember/40" : ""}`}>
            <p className="text-xs text-ink-muted">{t.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{t.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Review queue" empty="No applications waiting." href="/admin/applications?status=SUBMITTED">
          {queue.map((a) => (
            <Row key={a.id} href={`/admin/applications/${a.id}`} left={a.full_name} sub={`${a.reference} · ${formatDateTime(a.submitted_at)}`}>
              <span className="tabular-nums">{formatRand(Number(a.requested_amount), { cents: false })}</span>
              <span className={`badge ${a.affordability?.passes ? "border-mint/40 text-mint-300" : "border-rose/40 text-rose-300"}`}>
                {a.affordability?.passes ? "Affordable" : "Check"}
              </span>
            </Row>
          ))}
        </Panel>
        <Panel title="Ready for payout" empty="Nothing to pay out." href="/admin/loans?status=ACCEPTED">
          {payouts.map((l) => (
            <Row key={l.id} href={`/admin/loans/${l.id}`} left={l.full_name} sub={`${l.reference} · signed ${formatDateTime(l.signed_at)}`}>
              <span className="tabular-nums">{formatRand(Number(l.principal), { cents: false })}</span>
            </Row>
          ))}
        </Panel>
        <Panel title="Upcoming repayments" empty="No active loans." href="/admin/loans?status=ACTIVE">
          {due.map((l) => (
            <Row key={l.id} href={`/admin/loans/${l.id}`} left={l.full_name} sub={`${l.reference} · due ${formatDate(l.due_date, { weekday: false })}`}>
              <StatusBadge status={l.status} />
            </Row>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, empty, href, children }: { title: string; empty: string; href: string; children: React.ReactNode[] }) {
  return (
    <section className="glass p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-xs text-ember-300 hover:underline">View all</Link>
      </div>
      {children.length === 0 ? <p className="mt-3 text-sm text-ink-muted">{empty}</p> : <ul className="mt-3 divide-y divide-white/[0.06]">{children}</ul>}
    </section>
  );
}

function Row({ href, left, sub, children }: { href: string; left: string; sub: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-ink">
        <span className="min-w-0">
          <span className="block truncate font-medium">{left}</span>
          <span className="block truncate text-xs text-ink-faint">{sub}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">{children}</span>
      </Link>
    </li>
  );
}
