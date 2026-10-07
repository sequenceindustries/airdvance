"use client";

import { useFormState } from "react-dom";
import { acceptOffer } from "@/lib/actions/customer";
import { Submit } from "@/components/auth-forms";
import { Alert } from "@/components/ui";

export function SignOffer({ loanId, fullName }: { loanId: string; fullName: string }) {
  const [state, action] = useFormState(acceptOffer, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <input type="hidden" name="loanId" value={loanId} />
      {[
        ["readStatement", "I have read and understood the pre-agreement statement, quotation and key terms above."],
        ["understandCost", "I understand the total cost of this credit and that I must repay the total amount on the repayment date."],
        ["authoriseDebit", "I authorise Airdvance to register a DebiCheck mandate and collect the total amount repayable from my bank account on the repayment date."],
      ].map(([k, l]) => (
        <label key={k} className="flex items-start gap-3 text-sm text-ink-muted">
          <input type="checkbox" name={k} required className="mt-0.5 h-5 w-5 shrink-0 accent-ember" />
          <span>{l}</span>
        </label>
      ))}
      <label className="block">
        <span className="label">Type your full name to sign</span>
        <input name="signature" required autoComplete="off" className="input font-display text-lg" placeholder={fullName} />
        <span className="hint">Your typed name is your electronic signature. We record the time and your IP address.</span>
      </label>
      <Submit>Sign agreement</Submit>
    </form>
  );
}
