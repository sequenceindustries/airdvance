const faqs = [
  { q: "Do I need a deposit?", a: "Some plans require a small deposit, shown clearly before you apply. Many plans have no deposit at all." },
  { q: "What happens when I finish paying?", a: "Once you've made every required payment on your agreement, the device becomes yours outright. We'll confirm this in your dashboard." },
  { q: "What if my payment is late?", a: "You'll get a reminder before your payment is due. If a payment goes unpaid past the grace period on your agreement, your device may be temporarily restricted until it's settled — access is restored as soon as we receive payment." },
  { q: "Can I pay off my plan early?", a: "Yes. Paying ahead simply moves you closer to ownership sooner." },
  { q: "What documents do I need to apply?", a: "We'll ask for proof of identity and proof of income as part of the application. You can upload these securely from your phone or computer." },
  { q: "Is my personal information secure?", a: "Yes. Your data is protected with row-level access controls, and only you and authorised Airdvance staff can see your information." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">Frequently asked questions</h1>
      <div className="mt-10 divide-y divide-white/10">
        {faqs.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
              <span className="flex items-center justify-between">
                {item.q}
                <span className="ml-4 text-slate-500 group-open:rotate-45 transition">+</span>
              </span>
            </summary>
            <p className="mt-3 text-slate-300">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
