"use server";

/**
 * A lightweight rule-based assistant for common questions. This is the seam to
 * swap in a real LLM-backed assistant later -- callers only depend on
 * askAssistant(message) returning a string, so the implementation underneath
 * can change without touching the chat widget.
 */
const RULES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["credit score", "credit check", "credit"],
    answer: "airdvance is rent-to-buy, not credit — there's no credit check. We just look at your employment and whether the monthly payment is affordable for you.",
  },
  {
    keywords: ["payday", "when will i be charged", "when do you charge", "when charged"],
    answer: "We don't charge you the day you apply. We collect your first payment (installment + admin fee) on your next payday, and only ship your device once that payment clears.",
  },
  {
    keywords: ["buyout", "own it", "buy it", "at the end", "r1"],
    answer: "Once you've made every monthly payment, you can buy your device outright for a small buyout fee — as little as R1 on some plans. It's a one-tap payment from your dashboard.",
  },
  {
    keywords: ["lock", "locked", "restrict", "fail", "declin", "debit order fail"],
    answer: "If a debit order fails, your device is locked until it's resolved. We don't automatically retry failed debit orders — you'll need to make a manual payment from your dashboard to unlock it again.",
  },
  {
    keywords: ["deliver", "delivery", "ship", "shipping", "how long"],
    answer: "As soon as your first payment clears, we deliver your device within 7 days.",
  },
  {
    keywords: ["laptop"],
    answer: "We currently only offer smartphones and tablets — laptops aren't available at the moment.",
  },
  {
    keywords: ["apply", "sign up", "get started", "how do i start"],
    answer: "Pick a device and a plan, then apply — it takes a few minutes and covers your details, address, employment, and your debit order for payments.",
  },
  {
    keywords: ["contact", "human", "agent", "call", "speak to someone"],
    answer: "You can reach us on WhatsApp using the button on this page, or send a message through the contact form and we'll get back to you.",
  },
];

const FALLBACK =
  "I'm not sure about that one — try our FAQ page, or send us a message through the contact form and a real person will get back to you.";

export async function askAssistant(message: string): Promise<string> {
  const lower = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.answer;
    }
  }
  return FALLBACK;
}
