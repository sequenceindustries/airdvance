import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/config";

export const metadata = { title: "PAIA manual" };

export default function PaiaPage() {
  return (
    <LegalPage title="PAIA manual" updated="7 October 2026" intro="Summary of how to request access to records held by Airdvance under the Promotion of Access to Information Act 2 of 2000.">
      <h2>1. Contact details</h2>
      <ul>
        <li>Private body: {COMPANY.legalName}, trading as Airdvance</li>
        <li>Information Officer: {COMPANY.informationOfficer}</li>
        <li>Email: {COMPANY.privacyEmail}</li>
        <li>Address: {COMPANY.physicalAddress}</li>
      </ul>
      <h2>2. Guide from the Information Regulator</h2>
      <p>The Information Regulator publishes a guide on how to use PAIA, available at www.inforegulator.org.za.</p>
      <h2>3. Records we hold</h2>
      <ul>
        <li>Customer records: applications, identity documents, credit agreements, payment history, correspondence.</li>
        <li>Statutory records: NCR registration and returns, company records, tax records.</li>
        <li>Operational records: policies, supplier agreements, IT and security records.</li>
      </ul>
      <h2>4. Processing of personal information</h2>
      <p>Our purposes, categories of data subjects, recipients and security measures are described in our privacy policy.</p>
      <h2>5. How to request a record</h2>
      <p>Complete the prescribed form (Form 2) and email it to the Information Officer. We will respond within 30 days. A prescribed fee may apply to requests for records other than your own personal information.</p>
      <h2>6. Availability</h2>
      <p>This manual is available on our website and on request from the Information Officer.</p>
    </LegalPage>
  );
}
