import Link from "next/link";

export const metadata = { title: "Privacy Policy — airdvance" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-slate-400">Legal</p>
      <h1 className="mt-2 font-display text-3xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-300">
        <Section title="1. Overview">
          <p>
            This policy explains what personal information airdvance collects, why we collect it,
            and how we protect it, in line with the Protection of Personal Information Act (POPIA).
          </p>
        </Section>

        <Section title="2. What we collect">
          <ul className="ml-5 list-disc space-y-1">
            <li>Identity details: full name, ID or passport number, date of birth</li>
            <li>Contact details: mobile number, email, residential and postal address</li>
            <li>Employment and affordability details: employment status, employer, monthly income</li>
            <li>Debit order details: bank name, account holder, branch code, account type</li>
            <li>Agreement and payment history: devices rented, payments made, device status</li>
          </ul>
          <p className="mt-3">
            <strong className="text-ink">We only ever store the last 4 digits of your bank account
            number.</strong> The full account number is never retained in our systems after your
            debit order mandate is captured.
          </p>
        </Section>

        <Section title="3. Why we collect it">
          <p>
            We use this information to assess your application for affordability (not creditworthiness
            — this is rent-to-buy, not credit), to set up and collect your debit order payments, to
            create and manage your rental agreement, to deliver your device, and to communicate with
            you about your account.
          </p>
        </Section>

        <Section title="4. Who can see it">
          <p>
            Your information is only accessible to you and to authorised airdvance staff who need it
            to administer your agreement. Our systems use row-level access controls so that customers
            can never see another customer's information. We do not sell your personal information to
            third parties.
          </p>
        </Section>

        <Section title="5. How long we keep it">
          <p>
            We retain your information for as long as your agreement is active, and for a reasonable
            period afterwards as required for legal, accounting, or dispute-resolution purposes.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            Under POPIA, you have the right to request access to the personal information we hold
            about you, to request that it be corrected, and to object to certain uses of it. To
            exercise these rights, reach out through our{" "}
            <Link href="/contact" className="text-accent underline">contact page</Link>.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use industry-standard access controls and encryption to protect your information, and
            limit access to only what's needed to provide our service.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be reflected on this
            page with an updated date.
          </p>
        </Section>

        <p className="text-xs text-slate-500">
          See also our <Link href="/terms" className="text-accent underline">Terms & Conditions</Link>.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
