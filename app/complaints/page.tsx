import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/config";

export const metadata = { title: "Complaints" };

export default function ComplaintsPage() {
  return (
    <LegalPage title="Complaints" updated="7 October 2026" intro="If we've got something wrong, we want to fix it quickly and fairly.">
      <h2>1. Tell us</h2>
      <p>Email {COMPANY.complaintsEmail} or use the contact form with the topic "Complaint". Include your name, cellphone number, loan or application reference and what you'd like us to do.</p>
      <h2>2. What happens next</h2>
      <ul>
        <li>We acknowledge your complaint within 2 business days.</li>
        <li>We aim to resolve it within 15 business days and will tell you our outcome and reasons in writing.</li>
        <li>We won't take collection steps on an amount that is the subject of a genuine dispute while we investigate.</li>
      </ul>
      <h2>3. If you're not satisfied</h2>
      <ul>
        <li>Credit Ombud — www.creditombud.org.za, 0861 662 837</li>
        <li>National Credit Regulator — www.ncr.org.za, 0860 627 627</li>
        <li>For privacy matters, the Information Regulator — www.inforegulator.org.za</li>
      </ul>
    </LegalPage>
  );
}
