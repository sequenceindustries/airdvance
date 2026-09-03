import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/customer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/pricing";
import { approveApplication, declineApplication, requestMoreInformation } from "@/lib/actions/admin";

export default async function AdminApplicationDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const supabase = createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*, product:products(*), plan:rental_plans(*), customer:profiles(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!application) notFound();

  const canDecide = ["SUBMITTED", "UNDER_REVIEW", "MORE_INFORMATION_REQUIRED"].includes(application.status);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-slate-500">Application</p>
      <h1 className="font-display text-3xl">{application.personal_info?.full_name}</h1>
      <p className="mt-1 text-sm text-slate-500">{application.status.replace(/_/g, " ")}</p>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-ink">Requested device</h2>
        <p className="mt-2 text-slate-700">{application.product?.name}</p>
        <p className="text-sm text-slate-500">
          {application.plan?.term_months} months · {formatCurrency(application.plan?.monthly_payment ?? 0)}/month · Total{" "}
          {formatCurrency(application.plan?.total_payable ?? 0)}
        </p>
      </section>

      <section className="mt-6 grid gap-6 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-2">
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
          <h2 className="font-medium text-ink">Documents</h2>
          <p className="mt-2 text-sm text-slate-500">
            {application.documents?.length ? `${application.documents.length} file(s) uploaded` : "No documents uploaded"}
          </p>
        </div>
      </section>

      {application.internal_notes?.length > 0 && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-medium text-ink">Internal notes</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {application.internal_notes.map((note: any, i: number) => (
              <li key={i} className="border-l-2 border-slate-200 pl-3">
                {note.note}
                <span className="ml-2 text-xs text-slate-400">{new Date(note.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canDecide && (
        <section className="mt-8 flex flex-wrap gap-3">
          <form action={async () => { "use server"; await approveApplication(application.id); }}>
            <button className="rounded-md bg-signal px-5 py-2 text-sm font-medium text-white hover:bg-signal-dark">
              Approve
            </button>
          </form>

          <form
            action={async (formData: FormData) => {
              "use server";
              await requestMoreInformation(application.id, String(formData.get("note") ?? ""));
            }}
            className="flex gap-2"
          >
            <input name="note" placeholder="What's needed?" className="input" />
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Request info
            </button>
          </form>

          <form
            action={async (formData: FormData) => {
              "use server";
              await declineApplication(application.id, String(formData.get("reason") ?? "Not specified"));
            }}
            className="flex gap-2"
          >
            <input name="reason" placeholder="Reason for declining" className="input" />
            <button className="rounded-md border border-alert/40 px-4 py-2 text-sm font-medium text-alert hover:bg-alert-light">
              Decline
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-800">{value || "—"}</dd>
    </div>
  );
}
