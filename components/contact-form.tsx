"use client";

import { useFormState } from "react-dom";
import { sendContactMessage } from "@/lib/actions/contact";
import { Submit } from "./auth-forms";
import { Alert } from "./ui";

export function ContactForm() {
  const [state, action] = useFormState(sendContactMessage, undefined);
  if (state?.message) return <Alert tone="success">{state.message}</Alert>;
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Name</label>
          <input id="c-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-mobile" className="label">Cellphone (optional)</label>
          <input id="c-mobile" name="mobile" type="tel" className="input" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="label">Email</label>
        <input id="c-email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="c-topic" className="label">Topic</label>
        <select id="c-topic" name="topic" className="input" defaultValue="General">
          {["General", "My application", "My loan or repayment", "Complaint", "Privacy request"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" rows={5} required className="input" />
        <span className="hint">Please don't include your full ID or bank account number.</span>
      </div>
      <Submit>Send message</Submit>
    </form>
  );
}
