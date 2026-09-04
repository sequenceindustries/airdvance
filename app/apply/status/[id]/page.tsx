import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/domain";

const statusCopy: Record<ApplicationStatus, { title: string; body: string }> = {
  DRAFT: { title: "Draft", body: "Your application hasn't been submitted yet." },
  SUBMITTED: { title: "Submitted", body: "We've received your application and will begin reviewing it shortly." },
  UNDER_REVIEW: { title: "Under review", body: "We're reviewing your application. We'll update you when a decision has been made." },
  MORE_INFORMATION_REQUIRED: { title: "More information needed", body: "We need a bit more information before we can continue. Check your notifications for details." },
  APPROVED: { title: "Approved", body: "Congratulations — your application has been approved and your agreement is being set up." },
  DECLINED: { title: "Declined", body: "Unfortunately your application wasn't approved this time." },
  CANCELLED: { title: "Cancelled", body: "This application has been cancelled." },
};

export default async function ApplicationStatusPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*, product:products(name)")
    .eq("id", params.id)
    .maybeSingle();

  if (!application) notFound();

  const copy = statusCopy[application.status as ApplicationStatus];

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <p className="text-sm text-slate-400">Application status</p>
      <h1 className="mt-2 font-display text-3xl">{copy.title}</h1>
      <p className="mt-4 text-slate-300">{copy.body}</p>
      {application.product?.name && (
        <p className="mt-6 text-sm text-slate-400">Device: {application.product.name}</p>
      )}
      <Link href="/dashboard" className="mt-8 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">
        Go to my account
      </Link>
    </div>
  );
}
