import Link from "next/link";

export const metadata = { title: "Terms & Conditions — airdvance" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-slate-400">Legal</p>
      <h1 className="mt-2 font-display text-3xl">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-300">
        <Section title="1. What this agreement is">
          <p>
            This is a <strong className="text-ink">rent-to-buy agreement</strong>, not a credit agreement. You
            do not need a good credit score to qualify. We assess your application based on your
            employment status and whether the monthly payment is affordable for you, not on a credit
            check or credit history.
          </p>
          <p className="mt-3">
            You rent a device from airdvance for an agreed term at a fixed monthly payment. If you
            complete every payment on your agreement and pay the final buyout amount shown on your
            agreement, ownership of the device transfers to you. Until that buyout payment is made,
            the device remains the property of airdvance.
          </p>
        </Section>

        <Section title="2. Applying and eligibility">
          <p>
            To apply you must be at least 18 years old, provide accurate personal, address and
            employment information, and hold a valid South African bank account in your name (or as
            otherwise permitted) for debit order purposes. Providing false or misleading information
            may result in your application being declined or your agreement being cancelled.
          </p>
        </Section>

        <Section title="3. Debit orders and payment">
          <p>
            By submitting your application you authorize airdvance to debit your nominated bank
            account by debit order for your first payment (your monthly installment plus a once-off
            admin fee) on your next payday, and thereafter monthly on the anniversary of that date for
            the remainder of your agreement term, until the agreement ends or is cancelled.
          </p>
          <p className="mt-3">
            We do not charge you on the day you apply. Your first payment is scheduled for your next
            payday as you specify it in your application. Your device is shipped to you only once
            that first payment has successfully cleared, and is delivered within 7 days of that
            payment clearing.
          </p>
        </Section>

        <Section title="4. What happens if a debit order fails">
          <p>
            <strong className="text-ink">If a debit order fails, your device will be locked</strong>{" "}
            (restricted) until the outstanding payment is resolved. Failed debit orders are{" "}
            <strong className="text-ink">not automatically retried</strong>. To restore access to your
            device, you must make a manual payment for the outstanding amount through your account.
            We may also contact you to arrange payment. Repeated non-payment may result in your
            agreement being placed in default and, where permitted by law, the device being recovered.
          </p>
        </Section>

        <Section title="5. Ownership and the buyout payment">
          <p>
            Ownership of the device does not transfer automatically once your rental term ends.
            Once every monthly payment under your agreement has been made, you become eligible to pay
            a final buyout amount (shown on your agreement and dashboard, from as little as R1
            depending on your plan) to take full ownership of the device. Until that buyout payment
            is made and confirmed, the device remains the property of airdvance.
          </p>
        </Section>

        <Section title="6. Device care and condition">
          <p>
            You are responsible for taking reasonable care of the device for the duration of your
            agreement, including keeping it safe from loss, theft and damage. The device must not be
            resold, given away, pawned or used as security for any other obligation while it remains
            the property of airdvance.
          </p>
        </Section>

        <Section title="7. Cancellation">
          <p>
            You may settle your agreement early at any time by paying the remaining balance plus the
            buyout amount. airdvance may cancel your agreement if you materially breach these terms,
            including sustained non-payment following a locked device. Cancellation does not
            necessarily waive amounts already owing.
          </p>
        </Section>

        <Section title="8. Your information">
          <p>
            We collect and use your personal information in accordance with our{" "}
            <Link href="/privacy" className="text-accent underline">Privacy Policy</Link> and the
            Protection of Personal Information Act (POPIA). We only ever store the last 4 digits of
            your bank account number.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about these terms can be sent through our{" "}
            <Link href="/contact" className="text-accent underline">contact page</Link>.
          </p>
        </Section>

        <p className="text-xs text-slate-500">
          This is a summary of the terms that govern your agreement with airdvance and is provided
          for general informational purposes. It does not replace the specific terms and conditions
          set out in your individual rental agreement, which take precedence in the event of any
          conflict.
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
