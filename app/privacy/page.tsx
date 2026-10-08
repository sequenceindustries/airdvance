import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/config";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/privacy");

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" path="/privacy" intro="How Airdvance collects, uses and protects your personal information under the Protection of Personal Information Act (POPIA).">
      <h2>Responsible party</h2>
      <p>{COMPANY.legalName}, trading as Airdvance. Information Officer: {COMPANY.informationOfficer}, {COMPANY.privacyEmail}.</p>

      <h2>What we collect</h2>
      <ul>
        <li>Identity and contact details: name, ID number, date of birth, cellphone, email, address.</li>
        <li>Employment and financial details: employer, income, expenses, existing debt repayments, payslips and bank statements.</li>
        <li>Bank account details for paying out and collecting your loan.</li>
        <li>Credit information from registered credit bureaus.</li>
        <li>Technical information: IP address, device and browser details, and log-in records.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To verify your identity and prevent fraud.</li>
        <li>To assess affordability and creditworthiness, as the National Credit Act requires.</li>
        <li>To conclude and administer your credit agreement, pay out and collect your loan.</li>
        <li>To meet legal duties, including reporting to the National Credit Regulator and credit bureaus and FICA obligations.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>Registered credit bureaus, our payment and debit-order service providers, messaging providers (if we contact you by SMS), hosting providers, Google (website analytics, only with your consent), regulators and authorities where the law requires, and professional advisers. Service providers process information only on our instructions and under confidentiality obligations. We never sell your personal information.</p>

      <h2>How we protect it</h2>
      <p>All traffic is encrypted in transit. ID numbers and bank account numbers are encrypted at rest. Access to customer records is limited to staff who need it and is logged. Passwords are stored only as salted hashes.</p>

      <h2>How long we keep it</h2>
      <p>For as long as needed for the purposes above and as required by law — generally at least three years after your agreement ends under the NCA, and five years under FICA. Applications that don't proceed are kept for the period the NCA requires for declined applications.</p>

      <h2>Your rights</h2>
      <p>You may ask what information we hold about you, ask us to correct or delete it (where the law allows), object to processing, and withdraw consent you have given (including for analytics cookies, using "Cookie settings" at the bottom of every page). Use our <Link href="/contact">contact form</Link> or email {COMPANY.privacyEmail}. You may complain to the Information Regulator at www.inforegulator.org.za. See also our <Link href="/paia">PAIA manual</Link>.</p>

      <h2>Cookies</h2>
      <p>We use one essential cookie to keep you logged in, and one to remember your cookie choice. Only if you accept analytics cookies do we load Google Analytics, which tells us which pages are visited and which steps of the application people reach, with device type and approximate location. We don't send Google your name, contact details, ID number, application answers, amounts or bank details, and page addresses are stripped of reference numbers first. Google Analytics is set not to use advertising features. You can change your choice at any time with "Cookie settings" at the bottom of every page.</p>
    </LegalPage>
  );
}
