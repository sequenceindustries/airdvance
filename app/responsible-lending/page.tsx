import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/responsible-lending");

export default function ResponsibleLendingPage() {
  return (
    <LegalPage title="Responsible lending" path="/responsible-lending" intro="A short-term loan can help with a one-off gap. It isn't a solution for ongoing money trouble, and we'd rather decline than lend you money you can't repay.">
      <h2>Before you borrow</h2>
      <ul>
        <li>Borrow only for something essential, and only what you need.</li>
        <li>Check the total you'll repay will still leave enough for rent, food, transport and other debts after payday.</li>
        <li>Avoid taking a new loan to repay another one.</li>
      </ul>
      <h2>Our commitments</h2>
      <ul>
        <li>We assess every application for affordability using your payslip, bank statements, declared expenses and credit record, as the National Credit Act requires.</li>
        <li>We never lend to anyone under debt review, and we limit customers to one loan at a time.</li>
        <li>Our charges stay within the legal maximums and are shown in full before you apply.</li>
        <li>We don't use penalty interest, and we never threaten, harass or contact your employer or family about your debt.</li>
        <li>We explain why if we decline you.</li>
      </ul>
      <h2>If you're struggling</h2>
      <p>Contact us <strong>before</strong> your payday through the <Link href="/contact">contact page</Link>. Depending on your circumstances we can discuss options.</p>
      <p>You have the right to apply to a registered debt counsellor. You can find one through the National Credit Regulator: www.ncr.org.za or 0860 627 627.</p>
      <h2>Your credit report</h2>
      <p>You're entitled to one free credit report a year from each registered credit bureau. Check it for errors and dispute anything that's wrong with the bureau directly.</p>
    </LegalPage>
  );
}
