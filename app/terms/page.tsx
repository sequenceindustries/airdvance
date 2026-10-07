import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/config";

export const metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & conditions" updated="7 October 2026" intro="These terms govern your use of the Airdvance website and accounts. Each loan is also governed by its own credit agreement, which you sign before any money is paid out.">
      <h2>1. Who we are</h2>
      <p>Airdvance is a trading name of {COMPANY.legalName} ("we", "us"), a registered credit provider ({COMPANY.ncrcp}) under the National Credit Act 34 of 2005 ("NCA"). Contact: {COMPANY.email}.</p>

      <h2>2. The product</h2>
      <ul>
        <li>Short-term credit of R300 to R1,000, repaid in a single payment on a date between 5 and 31 days after the agreement date, normally your payday.</li>
        <li>Charges are limited to an initiation fee, a monthly service fee pro-rated by day, and interest, each within the maximums prescribed under the NCA. Your pre-agreement statement and credit agreement show the exact amounts.</li>
        <li>No credit life insurance or other optional products are sold with the loan.</li>
        <li>You may hold only one Airdvance application or loan at a time.</li>
      </ul>

      <h2>3. Applying</h2>
      <p>You must be 18 or older, hold a valid South African ID, have a regular income paid into a South African bank account in your name, and give us complete and truthful information. Providing false information is an offence and may make the agreement void or lead to legal action.</p>
      <p>By applying you consent to us verifying your identity, employment, income and bank account, and to obtaining your credit report from a registered credit bureau, for the purpose of assessing your application as section 81 of the NCA requires.</p>

      <h2>4. Assessment and decisions</h2>
      <p>Submitting an application does not mean it will be approved. We may decline, or approve a lower amount than you asked for, based on our affordability assessment. If we decline, we will tell you the dominant reason and, where relevant, the credit bureau we used.</p>

      <h2>5. Offers and signing</h2>
      <p>If approved, we present a pre-agreement statement and quotation, valid for the period shown. The loan is only concluded once you sign the credit agreement electronically and authorise the DebiCheck mandate. You may end the agreement at any time by settling it in full, without penalty.</p>

      <h2>6. Repayment</h2>
      <p>You authorise one DebiCheck debit order for the total shown in your agreement on the repayment date. You may settle early at any time without penalty; you then pay the initiation fee plus the service fee and interest for the days the money was outstanding.</p>

      <h2>7. Default</h2>
      <p>If payment isn't received, interest continues at the agreed rate on the amount borrowed. In line with section 103(5) of the NCA, interest, fees and charges that accrue while you are in default will not exceed the unpaid balance at the time of default. Before taking legal action we will give you written notice under section 129 of the NCA, which sets out your right to approach a debt counsellor, alternative dispute resolution agent, consumer court or ombud. Default information may be reported to credit bureaus after notice.</p>

      <h2>8. Your account</h2>
      <p>Keep your password private. We will never ask for your banking password, card PIN or bank OTP. Tell us immediately at {COMPANY.email} if you suspect someone else has accessed your account.</p>

      <h2>9. Privacy</h2>
      <p>We handle personal information as described in our <Link href="/privacy">privacy policy</Link>, in line with the Protection of Personal Information Act 4 of 2013.</p>

      <h2>10. Complaints</h2>
      <p>See our <Link href="/complaints">complaints process</Link>. You may also contact the National Credit Regulator or the Credit Ombud.</p>

      <h2>11. General</h2>
      <p>These terms are governed by South African law. If a provision is found invalid, the rest remain in force. Nothing in these terms limits rights you have under the NCA or the Consumer Protection Act.</p>
    </LegalPage>
  );
}
