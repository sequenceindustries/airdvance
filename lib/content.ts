import { PRODUCT } from "./config";

export const STEPS = [
  {
    title: "Choose your amount",
    body: `Pick R${PRODUCT.minAmount} to R1,000 and your next payday. The calculator shows every fee and the exact total before you start.`,
  },
  {
    title: "Apply online",
    body: "Create an account, confirm your mobile with a PIN, and tell us about your income and expenses. Upload your ID, latest payslip and 3 months of bank statements.",
  },
  {
    title: "A person reviews it",
    body: "Our team checks your identity, income and affordability as the National Credit Act requires. We aim to decide within one business day and tell you the reason if we decline.",
  },
  {
    title: "Sign and get paid",
    body: "If approved, read your pre-agreement statement, sign online and authorise one DebiCheck debit order with your bank. We then pay the cash into your account.",
  },
  {
    title: "Repay on payday",
    body: "One debit order collects the agreed total on your payday. Settle early any time and only pay interest and service fees for the days you used.",
  },
];

export const REQUIREMENTS = [
  "South African ID (green barcoded book or smart ID card)",
  "Latest payslip",
  "Last 3 months of bank statements, in your name",
  "A South African cellphone number",
  "A South African bank account in your own name that can accept DebiCheck",
];

export const ELIGIBILITY = [
  "18 years or older with a valid South African ID",
  "Employed with a regular, verifiable income paid into your bank account",
  "Your next payday is between 5 and 31 days away",
  "You can afford the repayment after your living expenses and other debt",
  "You are not under debt review, sequestration or administration",
];

export const FAQS: { q: string; a: string; home?: boolean }[] = [
  {
    q: "How much can I borrow and for how long?",
    a: `From R${PRODUCT.minAmount} to R1,000, in R50 steps. You repay the full amount in one payment on your next payday, which must be ${PRODUCT.minDays} to ${PRODUCT.maxDays} days away.`,
    home: true,
  },
  {
    q: "Is approval guaranteed?",
    a: "No. Every application is assessed for affordability as the National Credit Act requires, and we check your credit record. We'll only lend if the repayment is affordable for you. If we decline, we tell you why and which credit bureau we used.",
    home: true,
  },
  {
    q: "What does it cost?",
    a: "Three charges, all within National Credit Act limits: a once-off initiation fee of R165, a service fee of R60 per month pro-rated by day, and interest of 5% per month on the amount borrowed for your first loan in a calendar year (3% per month for later loans that year). The calculator shows the exact rand amounts for your dates.",
    home: true,
  },
  {
    q: "Are there any other fees?",
    a: "No. There's no credit life insurance, no application fee and no early settlement penalty. If you don't pay on time, interest continues at the same agreed rate — never a penalty rate — and the total that accrues while you're in default can never exceed the unpaid balance (the in duplum rule).",
    home: true,
  },
  {
    q: "How quickly will I get the money?",
    a: "We aim to review applications within one business day. Once you've signed and authorised your DebiCheck debit order, we pay the money into your bank account. Timing can depend on your bank.",
    home: true,
  },
  {
    q: "Can I repay early?",
    a: "Yes, any time, with no penalty. You pay the initiation fee plus interest and service fee only for the days you had the money. Your dashboard shows your settlement amount for today.",
    home: true,
  },
  {
    q: "How is the loan repaid?",
    a: "Through one DebiCheck debit order on your payday for the amount in your agreement. You approve the mandate with your bank — usually in your banking app or by USSD — so nothing is collected that you haven't authorised.",
  },
  {
    q: "What if I can't pay on my payday?",
    a: "Contact us before your payday. We'll talk through your options. Missed payments may be reported to credit bureaus after we've given you written notice, and you have the right to apply to a debt counsellor.",
  },
  {
    q: "Do you need my online banking password?",
    a: "Never. We will never ask for your banking password, PIN or one-time PIN from your bank. The only PIN we send is an Airdvance PIN to confirm your mobile number.",
  },
  {
    q: "Will applying affect my credit record?",
    a: "We do a credit check as part of your assessment, which is recorded as an enquiry on your credit report. Paying on time can help your record; late payments can harm it.",
  },
  {
    q: "Can I have more than one Airdvance loan?",
    a: "No. You can only have one application or loan open at a time. Once your loan is settled you can apply again, and later loans in the same calendar year are charged at the lower 3% per month interest rate.",
  },
];
