import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/pricing";

const outcomeCopy: Record<string, { label: string; classes: string }> = {
  APPROVED: { label: "Debit succeeded — agreement created", classes: "bg-signal-light text-signal-dark" },
  DECLINED: { label: "Debit failed — no agreement created", classes: "bg-alert-light text-alert-dark" },
};

export default async function AdminApplicationDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*, product:products(*), plan:rental_plans(*), customer:profiles(*), mandate:debit_order_mandates(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!application) notFound();

  const outcome = outcomeCopy[application.status];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-slate-400">Application</p>
      <h1 className="font-display text-3xl">{application.personal_info?.full_name}</h1>
      <p className="mt-2 text-sm text-slate-400">
        Applications are now processed automatically — the first debit order determines the outcome,
        there's no manual approval step. This page is a read-only record of what happened.
      </p>
      {outcome && (
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${outcome.classes}`}>
          {outcome.label}
        </span>
      )}

      <section className="mt-6 rounded-lg border border-white/10 bg-surface p-6">
        <h2 className="font-medium text-ink">Requested device</h2>
        <p className="mt-2 text-slate-200">{application.product?.name}</p>
        <p className="text-sm text-slate-400">
          {application.plan?.term_months} months · {formatCurrency(application.plan?.monthly_payment ?? 0)}/month
          {application.plan?.admin_fee ? ` + ${formatCurrency(application.plan.admin_fee)} admin fee` : ""} · Total{" "}
          {formatCurrency(application.plan?.total_payable ?? 0)}
        </p>
      </section>

      <section className="mt-6 grid gap-6 rounded-lg border border-white/10 bg-surface p-6 md:grid-cols-2">
        <div>
          <h2 className="font-medium text-ink">Personal information</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label="ID number" value={application.personal_info?.id_number} />
            <Row label="Date of birth" value={application.personal_info?.date_of_birth} />
            <Row label="Mobile" value={application.personal_info?.mobile} />
            <Row label="Email" value={application.personal_info?.email} />
          </dl>
        </div>
        <div>
          <h2 className="font-medium text-ink">Address</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label="Residential" value={application.address?.residential} />
            <Row label="Postal" value={application.address?.postal} />
          </dl>
        </div>
        <div>
          <h2 className="font-medium text-ink">Employment</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label="Status" value={application.employment?.status} />
            <Row label="Employer" value={application.employment?.employer} />
            <Row label="Monthly income" value={application.employment?.monthly_income ? formatCurrency(application.employment.monthly_income) : undefined} />
          </dl>
        </div>
        <div>
          <h2 className="font-medium text-ink">Debit order</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label="Bank" value={application.mandate?.bank_name} />
            <Row label="Account holder" value={application.mandate?.account_holder} />
            <Row label="Account number" value={application.mandate ? `••••${application.mandate.account_number_last4}` : undefined} />
            <Row label="First debit result" value={application.first_debit_status} />
          </dl>
        </div>
      </section>

      {application.internal_notes?.length > 0 && (
        <section className="mt-6 rounded-lg border border-white/10 bg-surface p-6">
          <h2 className="font-medium text-ink">Internal notes</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {application.internal_notes.map((note: any, i: number) => (
              <li key={i} className="border-l-2 border-white/10 pl-3">
                {note.note}
                <span className="ml-2 text-xs text-slate-500">{new Date(note.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-100">{value || "—"}</dd>
    </div>
  );
}
