import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, getCustomerAgreements, getAgreementSchedule } from "@/lib/data/customer";
import { OwnershipMeter } from "@/components/ownership-meter";
import { RestrictionBanner } from "@/components/restriction-banner";
import { formatCurrency } from "@/lib/pricing";
import clsx from "clsx";

const statusStyles: Record<string, string> = {
  PAID: "bg-signal-light text-signal-dark",
  SCHEDULED: "bg-white/10 text-slate-300",
  OVERDUE: "bg-alert-light text-alert-dark",
  PROCESSING: "bg-amber-100 text-amber-800",
  FAILED: "bg-alert-light text-alert-dark",
  CANCELLED: "bg-white/10 text-slate-500",
};

export default async function AgreementDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const agreements = await getCustomerAgreements(profile.id);
  const agreement = agreements.find((a) => a.id === params.id);
  if (!agreement) notFound();

  const schedule = await getAgreementSchedule(agreement.id);
  const restricted = agreement.device_control?.status === "RESTRICTED";
  const nextPayment = schedule.find((p) => p.status === "SCHEDULED" || p.status === "OVERDUE");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-slate-400">{agreement.agreement_number}</p>
      <h1 className="font-display text-3xl">{agreement.product.name}</h1>

      {restricted && (
        <div className="mt-4">
          <RestrictionBanner />
        </div>
      )}

      <div className="mt-6 grid gap-6 rounded-lg border border-white/10 bg-surface p-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-400">Next payment</p>
          <p className="mt-1 font-medium">
            {nextPayment ? `${formatCurrency(nextPayment.amount)} due ${nextPayment.due_date}` : "None due"}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Device status</p>
          <p className="mt-1 font-medium">
            {agreement.ownership_status === "OWNED" ? "Owned" : agreement.device.status}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-surface p-6">
        <OwnershipMeter
          paymentsCompleted={agreement.payments_completed}
          paymentsRequired={agreement.payments_required}
          amountRemaining={agreement.amount_remaining}
        />
      </div>

      <h2 className="mt-10 font-display text-xl">Payment schedule</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Due date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {schedule.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-2">{payment.payment_number}</td>
                <td className="px-4 py-2">{payment.due_date}</td>
                <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-2">
                  <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", statusStyles[payment.status])}>
                    {payment.status}
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
