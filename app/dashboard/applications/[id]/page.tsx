import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { InfoResponse } from "./info-response";
import { Alert, StatusBadge } from "@/components/ui";
import { requireVerifiedUser } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/dates";
import { normaliseApplication, type ApplicationRow } from "@/lib/loans";
import { formatRand } from "@/lib/pricing";
import { withdrawApplication } from "@/lib/actions/customer";

export const metadata = { title: "Application" };

const STAGES = ["Submitted", "Under review", "Decision", "Sign", "Paid out"];

export default async function ApplicationPage({ params, searchParams }: { params: { id: string }; searchParams: { submitted?: string } }) {
  const user = await requireVerifiedUser();
  const raw = await one<ApplicationRow>("select * from applications where id = $1 and user_id = $2", [params.id, user.id]).catch(() => null);
  if (!raw) notFound();
  const app = normaliseApplication(raw);
  const loan = await one<{ id: string }>("select id from loans where application_id = $1", [app.id]);
  if (loan && !searchParams.submitted) redirect(`/dashboard/loans/${loan.id}`);
  const docs = await query<{ id: string; kind: string; filename: string; created_at: string }>(
    "select id, kind, filename, created_at from documents where application_id = $1 order by created_at",
    [app.id],
  );
  const stage = app.status === "SUBMITTED" || app.status === "MORE_INFO_REQUIRED" ? 1 : 2;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">← My account</Link>
      {searchParams.submitted && (
        <Alert tone="success">
          Application received. We'll review it and let you know by SMS and on this page — we aim to respond within one business day.
        </Alert>
      )}
      <div className="glass p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">Application {app.reference}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold">{formatRand(Number(app.requested_amount), { cents: false })}</h1>
            <p className="mt-1 text-sm text-ink-muted">Repay {formatRand(app.quote.totalRepayable)} on {formatDate(app.requested_due_date)} (quoted)</p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        {!["DECLINED", "WITHDRAWN"].includes(app.status) && (
          <ol className="mt-6 grid grid-cols-5 gap-1.5">
            {STAGES.map((s, i) => (
              <li key={s}>
                <div className={`h-1.5 rounded-full ${i <= stage ? "bg-gradient-to-r from-ember to-amber" : "bg-white/10"}`} />
                <p className={`mt-2 text-[11px] sm:text-xs ${i <= stage ? "text-ink" : "text-ink-faint"}`}>{s}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {app.status === "MORE_INFO_REQUIRED" && (
        <div className="glass border-amber/30 p-6">
          <h2 className="text-lg font-semibold">We need more information</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{app.info_request}</p>
          <div className="mt-5">
            <InfoResponse applicationId={app.id} />
          </div>
        </div>
      )}

      {app.status === "DECLINED" && (
        <div className="glass p-6">
          <h2 className="text-lg font-semibold">We couldn't approve this application</h2>
          <p className="mt-2 text-sm text-ink-muted">{app.decision_reason}</p>
          <p className="mt-3 text-sm text-ink-muted">
            You're entitled to a free credit report from the credit bureau we used. If your circumstances change you're welcome to apply again. See{" "}
            <Link href="/responsible-lending" className="text-ember-300 underline">responsible lending</Link> for free support.
          </p>
        </div>
      )}

      <div className="glass p-6">
        <h2 className="text-lg font-semibold">Documents</h2>
        <ul className="mt-3 divide-y divide-white/[0.06] text-sm">
          {docs.map((d) => (
            <li key={d.id} className="flex justify-between gap-3 py-2.5">
              <a href={`/api/documents/${d.id}`} target="_blank" className="truncate hover:underline">{d.filename}</a>
              <span className="shrink-0 text-ink-faint">{d.kind.replace("_", " ").toLowerCase()}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-faint">Submitted {formatDateTime(app.submitted_at)}</p>
      </div>

      {(app.status === "SUBMITTED" || app.status === "MORE_INFO_REQUIRED") && (
        <form action={withdrawApplication} className="text-center">
          <input type="hidden" name="applicationId" value={app.id} />
          <button className="text-sm text-ink-faint underline hover:text-ink">Withdraw this application</button>
        </form>
      )}
    </div>
  );
}
