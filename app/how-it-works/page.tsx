import Link from "next/link";

const steps = [
  { title: "Choose a device and a plan", copy: "Browse smartphones and tablets. Pick the rental term that fits your monthly budget — you'll always see the monthly payment, admin fee and buyout amount upfront." },
  { title: "Apply and set up your debit order", copy: "Create an account and complete a short application: your details, address, employment, and your bank account for the debit order." },
  { title: "We collect your first payment", copy: "We immediately debit your first installment plus a once-off admin fee. There's no waiting for manual review — approval is automatic the moment the debit succeeds." },
  { title: "We ship your device", copy: "As soon as your first payment clears, we prepare and ship your device to you." },
  { title: "We debit you monthly", copy: "Your dashboard always shows your next debit date, your progress toward the end of your term, and your device status." },
  { title: "Buy it out for as little as R1", copy: "Once you've made every monthly payment, pay a small final buyout fee from your dashboard and the device is officially yours." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">How airdvance works</h1>
      <p className="mt-3 text-slate-300">
        A straightforward path from choosing a device to owning it outright.
      </p>

      <ol className="mt-12 space-y-10">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal-light font-medium text-signal-dark">
              {i + 1}
            </div>
            <div>
              <p className="font-display text-lg">{step.title}</p>
              <p className="mt-1 text-slate-300">{step.copy}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 rounded-lg border border-white/10 bg-surface p-6">
        <p className="font-medium text-ink">What happens if my debit order fails?</p>
        <p className="mt-2 text-sm text-slate-300">
          Your device will be locked until the payment is resolved. We do not automatically retry a
          failed debit order — you'll need to make a manual payment from your dashboard to unlock
          your device again.
        </p>
      </div>

      <Link
        href="/shop"
        className="mt-10 inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark focus-ring"
      >
        Shop devices
      </Link>
    </div>
  );
}
