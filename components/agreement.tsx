import { COMPANY } from "@/lib/config";
import { formatDate } from "@/lib/dates";
import { formatRand, type Quote } from "@/lib/pricing";

/**
 * Pre-agreement statement / agreement key terms (NCA s92 & Form 20 style):
 * every figure a consumer needs before signing.
 */
export function AgreementTerms({
  quote,
  reference,
  customer,
  bank,
}: {
  quote: Quote;
  reference: string;
  customer: { name: string; idLast4: string; mobile: string; address: string };
  bank: { bankName: string; last4: string };
}) {
  const rows: [string, string][] = [
    ["Credit provider", `${COMPANY.legalName} t/a Airdvance (${COMPANY.ncrcp})`],
    ["Consumer", `${customer.name} · ID ending ${customer.idLast4}`],
    ["Agreement reference", reference],
    ["Type of agreement", "Short-term credit transaction (National Credit Act)"],
    ["Principal debt (paid to you)", formatRand(quote.principal)],
    ["Paid into", `${bank.bankName} account ending ${bank.last4}`],
    ["Initiation fee (once-off)", formatRand(quote.initiationFee)],
    ["Monthly service fee", `R60.00 per month, pro-rated by day: ${formatRand(quote.serviceFee)} for ${quote.days} days`],
    ["Interest rate", `${(quote.monthlyRate * 100).toFixed(0)}% per month (${(quote.monthlyRate * 1200).toFixed(0)}% per year), simple, fixed`],
    ["Interest for the term", formatRand(quote.interest)],
    ["Credit insurance", "None"],
    ["Total cost of credit", formatRand(quote.costOfCredit)],
    ["Total amount repayable", formatRand(quote.totalRepayable)],
    ["Number of instalments", `One, on ${formatDate(quote.dueDate)}`],
    ["Method of payment", "DebiCheck debit order from the account above"],
    ["Term", `${quote.days} days`],
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-ink/[0.06] last:border-0">
              <th scope="row" className="w-[42%] px-4 py-2.5 text-left align-top font-normal text-ink-muted">{k}</th>
              <td className={`px-4 py-2.5 ${k.startsWith("Total amount") ? "font-semibold text-ink" : ""}`}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AgreementClauses() {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
      <li>The credit provider will pay the principal debt into the consumer's bank account after signature and successful registration of the DebiCheck mandate.</li>
      <li>The consumer must repay the total amount repayable on the repayment date. The consumer authorises one DebiCheck debit order for that amount on that date.</li>
      <li>The consumer may settle early at any time without penalty and will then pay the initiation fee plus the service fee and interest only for the days the principal was outstanding (minimum one day).</li>
      <li>If payment is not received on the repayment date, interest continues at the agreed rate on the principal debt. No penalty interest or default administration charges are levied. Interest, fees and charges accruing during default will not exceed the unpaid balance at the time of default (section 103(5)).</li>
      <li>Before enforcing the agreement, the credit provider will deliver a notice under section 129 informing the consumer of the right to approach a debt counsellor, alternative dispute resolution agent, consumer court or ombud. Default may be reported to credit bureaus after 20 business days' notice.</li>
      <li>The consumer confirms the information supplied in the application is true and complete, and that there are no other debts or expenses that were not disclosed.</li>
      <li>The consumer may contact the credit provider at {COMPANY.email}, the Credit Ombud (0861 662 837) or the National Credit Regulator (0860 627 627) about any complaint.</li>
      <li>This agreement is governed by the National Credit Act 34 of 2005 and the law of South Africa. Electronic signature has the same effect as a handwritten signature (Electronic Communications and Transactions Act 25 of 2002).</li>
    </ol>
  );
}
