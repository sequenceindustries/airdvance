import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/domain";

const statusCopy: Record<ApplicationStatus, { title: string; body: string }> = {
  DRAFT: { title: "Draft", body: "Your application hasn't been submitted yet." },
  SUBMITTED: { title: "Debit order authorized", body: "We won't charge you today. Your first payment is scheduled for your next payday." },
  UNDER_REVIEW: { title: "Debit order authorized", body: "We won't charge you today. Your first payment is scheduled for your next payday. As soon as it clears, we'll deliver your device within 7 days." },
  MORE_INFORMATION_REQUIRED: { title: "More information needed", body: "We need a bit more information before we can continue. Check your notifications for details." },
  APPROVED: { title: "You're approved!", body: "Your first payment went through and your agreement is active. We'll deliver your device within 7 days." },
  DECLINED: { title: "Payment didn't go through", body: "We couldn't collect your first payment from the bank details provided on your payday. No agreement has been created and nothing further will be charged. You're welcome to apply again with the same or different bank details." },
  CANCELLED: { title: "Cancelled", body: "This application has been cancelled." },
};

export default async function ApplicationStatusPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*, product:products(name, slug)")
    .eq("id", params.id)
    .maybeSingle();

  if (!application) notFound();

  const copy = statusCopy[application.status as ApplicationStatus];
  const declined = application.status === "DECLINED";
  const pending = application.status === "UNDER_REVIEW" || application.status === "SUBMITTED";

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <p className="text-sm text-slate-400">Application status</p>
      <h1 className="mt-2 font-display text-3xl">{copy.title}</h1>
      <p className="mt-4 text-slate-300">{copy.body}</p>
      {pending && application.next_collection_date && (
        <p className="mt-2 text-sm text-slate-400">Next payment date: {application.next_collection_date}</p>
      )}
      {application.product?.name && (
        <p className="mt-6 text-sm text-slate-400">Device: {application.product.name}</p>
      )}
      {declined ? (
        <Link href={`/product/${application.product?.slug ?? ""}`} className="mt-8 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">
          Try again
        </Link>
      ) : (
        <Link href="/dashboard" className="mt-8 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">
          Go to my account
        </Link>
      )}
    </div>
  );
}
