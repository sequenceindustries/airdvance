import { PRODUCT } from "./config";

export const STEPS = [
  { title: "Pick an amount", body: "R300 to R1,000, repaid on your next payday." },
  { title: "Apply online", body: "About 10 minutes, with your ID, payslip and statements." },
  { title: "We review it", body: "A person checks affordability. We aim to reply within one business day." },
  { title: "Sign and get paid", body: "If approved, sign online, approve the debit order, and we pay you by EFT." },
  { title: "Repay on payday", body: "One debit order for the full total. Settle early and pay less." },
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
  { q: "Is approval guaranteed?", a: "No. We check affordability and your credit record, and may offer less than you asked for. If we decline, we tell you the main reason.", home: true },
  { q: "What does it cost?", a: "An R165 initiation fee, a service fee of R2 a day (never more than R60 a month) and interest of 5% a month on the amount borrowed, charged per day (3% a month for later loans in the same calendar year). Example: R1,000 for 30 days costs R274.32, so you repay R1,274.32. The calculator shows your exact total.", home: true },
  { q: "Any other fees?", a: "No. No insurance, application fee, early-settlement penalty or late-payment fee. If you pay late, interest keeps running at the same daily rate, capped by law at the unpaid balance.", home: true },
  { q: "How fast is the payout?", a: "We aim to decide within one business day. If you're approved and sign, we pay by EFT; when it reflects depends on your bank." },
  { q: "Can I repay early?", a: "Yes, any time. You only pay interest and service fees for the days you used." },
  { q: "How do I repay?", a: "One DebiCheck debit order for the full total on your repayment date, which you approve with your bank first. You can also settle early by EFT." },
  { q: "What if I can't pay on payday?", a: "Contact us before payday. Missed payments may be reported to credit bureaus after written notice, so talk to us early. You can also apply to a registered debt counsellor." },
  { q: "Will you ask for my banking password?", a: "Never. We also never ask for a bank OTP, card PIN or an upfront fee." },
  { q: "Can I have two loans?", a: "No, one at a time. Once you've settled, you can apply again." },
];
