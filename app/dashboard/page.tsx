import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile, getCustomerAgreements } from "@/lib/data/customer";
import { OwnershipMeter } from "@/components/ownership-meter";
import { RestrictionBanner } from "@/components/restriction-banner";
import { formatCurrency } from "@/lib/pricing";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const agreements = await getCustomerAgreements(profile.id);
  const active = agreements.filter((a) => a.status !== "CANCELLED");

  if (active.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl">Welcome, {profile.full_name.split(" ")[0]}</h1>
        <p className="mt-3 text-slate-300">You don't have an active agreement yet.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">
          Shop devices
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl">Welcome back, {profile.full_name.split(" ")[0]}</h1>

      <div className="mt-8 flex flex-col gap-6">
        {active.map((agreement) => {
          const restricted = agreement.device_control?.status === "RESTRICTED";
          const nextPayment = null; // fetched in agreement detail page
          return (
            <div key={agreement.id} className="rounded-lg border border-white/10 bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{agreement.agreement_number}</p>
                  <p className="font-display text-xl">{agreement.product.name}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {formatCurrency(agreement.monthly_payment)} / month
                  </p>
                </div>
                <span
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium " +
                    (restricted
                      ? "bg-alert-light text-alert-dark"
                      : agreement.ownership_status === "OWNED"
                        ? "bg-signal-light text-signal-dark"
                        : "bg-white/10 text-slate-300")
                  }
                >
                  {agreement.ownership_status === "OWNED"
                    ? "Owned"
                    : restricted
                      ? "Device restricted"
                      : agreement.device.status}
                </span>
              </div>

              {restricted && (
                <div className="mt-4">
                  <RestrictionBanner />
                </div>
              )}

              <div className="mt-5">
                <OwnershipMeter
                  paymentsCompleted={agreement.payments_completed}
                  paymentsRequired={agreement.payments_required}
                  amountRemaining={agreement.amount_remaining}
                />
              </div>

              <Link
                href={`/dashboard/agreements/${agreement.id}`}
                className="mt-5 inline-block text-sm font-medium text-accent hover:text-accent-dark"
              >
                View agreement & payment history →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
