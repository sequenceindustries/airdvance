import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, StatusBadge } from "@/components/ui";
import { requireVerifiedUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/dates";
import { loanBalance, normaliseLoan, OPEN_LOAN, type LoanRow } from "@/lib/loans";
import { formatRand } from "@/lib/pricing";
import { markNotificationsRead } from "@/lib/actions/customer";
import { displayMobile } from "@/lib/sa";

export const metadata = { title: "My account" };

export default async function DashboardPage() {
  const user = await requireVerifiedUser("/dashboard");
  if (user.role === "ADMIN") redirect("/admin");

  const loans = (await query<LoanRow>("select * from loans where user_id = $1 order by created_at desc", [user.id])).map(normaliseLoan);
  const apps = await query<{ id: string; reference: string; status: string; requested_amount: string; submitted_at: string; info_request: string | null }>(
    "select id, reference, status, requested_amount, submitted_at, info_request from applications where user_id = $1 order by created_at desc",
    [user.id],
  );
  const notes = await query<{ id: string; title: string; body: string; href: string | null; read_at: string | null; created_at: string }>(
    "select * from notifications where user_id = $1 order by created_at desc limit 8",
    [user.id],
  );

  const openLoan = loans.find((l) => (OPEN_LOAN as readonly string[]).includes(l.status));
  const openApp = apps.find((a) => a.status === "SUBMITTED" || a.status === "MORE_INFO_REQUIRED");
  const unread = notes.filter((n) => !n.read_at).length;
  const firstName = user.full_name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">My account</p>
          <h1 className="text-3xl font-semibold">Hi {firstName}</h1>
        </div>
        {!openLoan && !openApp && (
          <Link href="/apply" className="btn-primary">
            Apply for a cash advance
          </Link>
        )}
      </div>

      {openLoan && <LoanCard loan={openLoan} />}

      {openApp && (
        <Link href={`/dashboard/applications/${openApp.id}`} className="glass block p-6 transition hover:border-ink/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-ink-muted">Application {openApp.reference}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{formatRand(Number(openApp.requested_amount), { cents: false })}</p>
            </div>
            <StatusBadge status={openApp.status} />
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            {openApp.status === "MORE_INFO_REQUIRED"
              ? "We need a little more information from you. Tap to see what's needed."
              : `Submitted ${formatDateTime(openApp.submitted_at)}. We aim to review it within one business day.`}
          </p>
        </Link>
      )}

      {!openLoan && !openApp && (
        <div className="glass p-6 text-ink-muted">
          You don't have an open application or loan. When you need one, it takes about 10 minutes to apply.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="glass p-6">
          <h2 className="text-lg font-semibold">History</h2>
          {apps.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Nothing yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/[0.06]">
              {apps.map((a) => {
                const loan = loans.find((l) => (l as any).application_id === a.id);
                const href = loan ? `/dashboard/loans/${loan.id}` : `/dashboard/applications/${a.id}`;
                return (
                  <li key={a.id}>
                    <Link href={href} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-ink">
                      <span>
                        <span className="font-medium">{loan?.reference ?? a.reference}</span>
                        <span className="ml-2 text-ink-faint">{formatDate(new Date(a.submitted_at), { weekday: false })}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="tabular-nums text-ink-muted">{formatRand(Number(loan?.principal ?? a.requested_amount), { cents: false })}</span>
                        <StatusBadge status={loan?.status ?? a.status} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="glass p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages {unread > 0 && <span className="ml-1 rounded-full bg-ember px-2 py-0.5 text-xs text-white">{unread}</span>}</h2>
            {unread > 0 && (
              <form action={markNotificationsRead}>
                <button className="text-xs text-ember-300 hover:underline">Mark all read</button>
              </form>
            )}
          </div>
          {notes.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No messages.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {notes.map((n) => (
                <li key={n.id} className="text-sm">
                  <p className={`font-medium ${n.read_at ? "text-ink-muted" : "text-ink"}`}>
                    {!n.read_at && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-ember" />}
                    {n.href ? <Link href={n.href} className="hover:underline">{n.title}</Link> : n.title}
                  </p>
                  <p className="mt-0.5 text-ink-muted">{n.body}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{formatDateTime(n.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="glass p-6 text-sm text-ink-muted">
        <h2 className="text-lg font-semibold text-ink">Your details</h2>
        <p className="mt-3">{user.full_name} · {user.email} · {displayMobile(user.mobile)}</p>
        <p className="mt-1 text-xs text-ink-faint">To change these, <Link href="/contact" className="underline">contact us</Link> — we'll verify it's you first.</p>
      </section>
    </div>
  );
}

function LoanCard({ loan }: { loan: LoanRow }) {
  const bal = loanBalance(loan);
  const href = `/dashboard/loans/${loan.id}`;
  const quote = loan.final_quote ?? loan.offer_quote;
  return (
    <div className="glass relative overflow-hidden p-6">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Loan {loan.reference}</p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {bal ? formatRand(bal.outstanding) : formatRand(quote.totalRepayable)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {loan.status === "OFFERED" && `Offer of ${formatRand(Number(loan.principal), { cents: false })} ready to sign — repay ${formatRand(quote.totalRepayable)} on ${formatDate(loan.due_date)}`}
            {loan.status === "ACCEPTED" && "Signed — we'll pay out once final checks are done"}
            {loan.status === "ACTIVE" && `To settle today · ${formatRand(quote.totalRepayable)} due ${formatDate(loan.due_date)}`}
            {loan.status === "ARREARS" && `Overdue since ${formatDate(loan.due_date)}`}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>
      {loan.status === "ARREARS" && (
        <div className="relative mt-4">
          <Alert tone="error">Your repayment is overdue. Please settle or contact us as soon as possible — we'd rather help than escalate.</Alert>
        </div>
      )}
      <Link href={href} className={`relative mt-5 ${loan.status === "OFFERED" ? "btn-primary" : "btn-ghost"}`}>
        {loan.status === "OFFERED" ? "Review and sign" : "View loan"}
      </Link>
    </div>
  );
}
