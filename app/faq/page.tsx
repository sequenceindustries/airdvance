const faqs = [
  { q: "How do I pay?", a: "By debit order. We collect your first installment plus a once-off admin fee when you apply, then debit your account automatically every month for the rest of the term." },
  { q: "What happens when my rental term ends?", a: "Once you've made every monthly payment, you can buy your device outright for a small buyout fee — as little as R1 on some plans. You'll see the exact amount on your dashboard and can pay it in one tap." },
  { q: "What happens if my debit order fails?", a: "Your device will be locked until the payment is resolved. We do not automatically retry a failed debit order — you'll need to make a manual payment from your dashboard to unlock your device again." },
  { q: "Can I pay off my plan early?", a: "Yes. Paying ahead simply moves you closer to your buyout sooner." },
  { q: "What do I need to apply?", a: "Your ID, address, employment details, and your bank account details for the debit order. The whole process, including your first payment, takes a few minutes." },
  { q: "Is my banking information secure?", a: "Yes. We only ever store the last 4 digits of your account number, and your data is protected with row-level access controls — only you and authorised airdvance staff can see your information." },
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
