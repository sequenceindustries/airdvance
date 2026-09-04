import Link from "next/link";

const steps = [
  { title: "Choose a device and a plan", copy: "Browse smartphones, tablets and laptops. Pick the rental term that fits your monthly budget — you'll always see the monthly payment and total payable upfront." },
  { title: "Apply", copy: "Create an account and complete a short application: your details, address, and employment information. Upload the documents we ask for." },
  { title: "We review your application", copy: "Most applications are reviewed quickly. You can check your status at any time from your account." },
  { title: "Your agreement is created", copy: "Once approved, we generate your rental agreement and payment schedule automatically, and assign your device." },
  { title: "Make your monthly payments", copy: "Your dashboard shows your next payment, your ownership progress, and your device status at all times." },
  { title: "Own it", copy: "Once you've made every required payment, the device is officially yours — no further payments, no catches." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">How Airdvance works</h1>
      <p className="mt-3 text-slate-600">
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
              <p className="mt-1 text-slate-600">{step.copy}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 rounded-lg border border-slate-200 bg-white p-6">
        <p className="font-medium text-ink">What happens if I miss a payment?</p>
        <p className="mt-2 text-sm text-slate-600">
          We'll always let you know before anything happens. If a payment stays overdue past the grace
          period on your agreement, the device may be temporarily restricted until the outstanding
          payment is made. As soon as we receive it, access is restored.
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
