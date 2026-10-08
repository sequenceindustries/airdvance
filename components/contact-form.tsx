"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { track } from "@/lib/analytics";
import { sendContactMessage } from "@/lib/actions/contact";
import { Submit } from "./auth-forms";
import { Alert } from "./ui";

export function ContactForm() {
  const [state, action] = useFormState(sendContactMessage, undefined);
  useEffect(() => {
    if (state?.message) track("contact_submitted");
  }, [state?.message]);
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
          <label htmlFor="c-email" className="label">Email</label>
          <input id="c-email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" rows={5} required className="input" />
        <span className="hint">Don't include ID or account numbers.</span>
      </div>
      <Submit>Send message</Submit>
    </form>
  );
}
