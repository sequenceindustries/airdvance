import { PRODUCT } from "./config";

export const STEPS = [
  { title: "Pick an amount", body: "R300 to R1,000, repaid on your next payday." },
  { title: "Apply online", body: "About 10 minutes, with your ID, payslip and statements." },
  { title: "We review it", body: "A person checks affordability, usually within a business day." },
  { title: "Sign and get paid", body: "Sign online, approve the debit order, and we pay you." },
  { title: "Repay on payday", body: "One debit order. Settle early and pay less." },
];

export const REQUIREMENTS = ["SA ID", "Latest payslip", "3 months' bank statements"];

export const ELIGIBILITY = [
  "18 or older with an SA ID",
  "Employed, with salary paid into your bank account",
  "Payday 5–31 days away",
  "Not under debt review",
];

export const FAQS: { q: string; a: string; home?: boolean }[] = [
  { q: "How much can I borrow?", a: `R${PRODUCT.minAmount} to R1,000, repaid in one go on your next payday (${PRODUCT.minDays}–${PRODUCT.maxDays} days away).`, home: true },
  { q: "Is approval guaranteed?", a: "No. We check affordability and your credit record. If we decline, we tell you why.", home: true },
  { q: "What does it cost?", a: "An R165 initiation fee, R60 a month service fee (charged per day) and 5% interest a month (3% for later loans that year). The calculator shows your exact total.", home: true },
  { q: "Any other fees?", a: "No. No insurance, application fee or early-settlement penalty. Late payment doesn't add penalty interest.", home: true },
  { q: "How fast is the payout?", a: "We aim to decide within a business day and pay out once you've signed." },
  { q: "Can I repay early?", a: "Yes, any time. You only pay interest and service fees for the days you used." },
  { q: "How do I repay?", a: "One DebiCheck debit order on payday, which you approve with your bank first." },
  { q: "What if I can't pay on payday?", a: "Contact us before payday so we can help. You can also go to a debt counsellor." },
  { q: "Will you ask for my banking password?", a: "Never. We only send a PIN to confirm your cellphone number." },
  { q: "Can I have two loans?", a: "No, one at a time. Once you've settled, you can apply again." },
];
