import Link from "next/link";
import { notFound } from "next/navigation";
import { AgreementClauses, AgreementTerms } from "@/components/agreement";
import { requireVerifiedUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { formatDateTime } from "@/lib/dates";
import { normaliseApplication, normaliseLoan, type ApplicationRow, type LoanRow } from "@/lib/loans";
import { displayMobile } from "@/lib/sa";
import { PrintButton } from "./print-button";

export const metadata = { title: "Credit agreement" };

export default async function AgreementPage({ params }: { params: { id: string } }) {
  const user = await requireVerifiedUser();
  const raw = await one<LoanRow>("select * from loans where id = $1 and (user_id = $2 or $3)", [params.id, user.id, user.role === "ADMIN"]).catch(() => null);
  if (!raw || !raw.signed_at) notFound();
  const loan = normaliseLoan(raw);
  const app = normaliseApplication((await one<ApplicationRow>("select * from applications where id = $1", [loan.application_id]))!);
  const owner = await one<{ full_name: string; mobile: string }>("select full_name, mobile from users where id = $1", [loan.user_id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-none print:text-black">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/dashboard/loans/${loan.id}`} className="text-sm text-ink-muted hover:text-ink">← Back to loan</Link>
        <PrintButton />
      </div>
      <h1 className="text-2xl font-semibold">Short-term credit agreement {loan.reference}</h1>
      <AgreementTerms
        quote={loan.offer_quote}
        reference={loan.reference}
        customer={{ name: owner!.full_name, idLast4: app.id_number_last4, mobile: displayMobile(owner!.mobile), address: `${app.address.street}, ${app.address.city}` }}
        bank={{ bankName: app.bank.bankName, last4: app.bank.last4 }}
      />
      {loan.final_quote && loan.final_quote.totalRepayable !== loan.offer_quote.totalRepayable && (
        <p className="text-sm text-ink-muted">
          Re-priced at payout for {loan.final_quote.days} days: total repayable reduced to R{loan.final_quote.totalRepayable.toFixed(2)}.
        </p>
      )}
      <AgreementClauses />
      <div className="glass p-5 text-sm">
        <p>Signed electronically by <strong>{loan.signature_name}</strong> on {formatDateTime(loan.signed_at!)}.</p>
        <p className="mt-1 text-ink-muted">DebiCheck mandate reference: {loan.mandate_reference}</p>
      </div>
    </div>
  );
}
