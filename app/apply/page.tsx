import Link from "next/link";
import { ApplyWizard } from "./apply-wizard";
import { Glow } from "@/components/ui";
import { requireVerifiedUser } from "@/lib/auth";
import { PRODUCT } from "@/lib/config";
import { daysBetween, defaultPayday, isIsoDate, todaySA } from "@/lib/dates";
import { isRepeatThisYear, openItemsFor } from "@/lib/loans";

export const metadata = { title: "Apply" };

export default async function ApplyPage({ searchParams }: { searchParams: { amount?: string; due?: string } }) {
  const qs = new URLSearchParams(searchParams as Record<string, string>).toString();
  const user = await requireVerifiedUser(`/apply${qs ? `?${qs}` : ""}`);
  const today = todaySA();

  if (user.role === "ADMIN") {
    return (
      <Notice title="Admin accounts can't apply">
        Log in with a customer account to test the application flow. <Link href="/admin" className="text-ember-300 underline">Go to admin</Link>
      </Notice>
    );
  }

  const { app, loan } = await openItemsFor(user.id);
  if (app || loan) {
    const href = loan ? `/dashboard/loans/${loan.id}` : `/dashboard/applications/${app!.id}`;
    return (
      <Notice title="You already have an open application or loan">
        You can have one Airdvance application or loan at a time.{" "}
        <Link href={href} className="text-ember-300 underline">
          View {loan ? `loan ${loan.reference}` : `application ${app!.reference}`}
        </Link>
      </Notice>
    );
  }

  let amount = Number(searchParams.amount);
  if (!Number.isFinite(amount) || amount < PRODUCT.minAmount || amount > PRODUCT.maxAmount || amount % PRODUCT.step) amount = 500;
  let due = searchParams.due ?? "";
  if (!isIsoDate(due) || daysBetween(today, due) < PRODUCT.minDays || daysBetween(today, due) > PRODUCT.maxDays) {
    due = defaultPayday(today, PRODUCT.minDays, PRODUCT.maxDays);
  }

  return (
    <section className="relative">
      <Glow className="opacity-60" />
      <div className="container-x relative py-10 sm:py-14">
        <h1 className="text-3xl font-semibold sm:text-4xl">Apply for a cash advance</h1>
        <p className="mt-2 max-w-xl text-ink-muted">About 10 minutes. Have your ID, latest payslip and 3 months of bank statements ready.</p>
        <div className="mt-8">
          <ApplyWizard today={today} initialAmount={amount} initialDue={due} fullName={user.full_name} isRepeat={await isRepeatThisYear(user.id, today)} />
        </div>
      </div>
    </section>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-x py-20">
      <div className="glass mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-ink-muted">{children}</p>
      </div>
    </div>
  );
}
