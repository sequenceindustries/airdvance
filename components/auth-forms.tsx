"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  confirmVerificationPin,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  sendVerificationPin,
  type FormState,
} from "@/lib/actions/auth";
import { Alert } from "./ui";

export function Submit({ children, className = "btn-primary w-full py-3.5" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Please wait…" : children}
    </button>
  );
}

function Feedback({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <div className="space-y-2">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      {state.demoCode && (
        <Alert tone="warn">
          Demo mode — no SMS was sent. Your PIN is <strong className="font-mono tracking-widest">{state.demoCode}</strong>
        </Alert>
      )}
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={state?.fields?.email} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          <Link href="/forgot-password" className="mb-1.5 text-xs text-ember-300 hover:underline">Forgot password?</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <Submit>Log in</Submit>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useFormState(register, undefined);
  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="full_name" className="label">Full name</label>
        <input id="full_name" name="full_name" autoComplete="name" required className="input" defaultValue={state?.fields?.full_name} />
      </div>
      <div>
        <label htmlFor="mobile" className="label">Cellphone number</label>
        <input id="mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" placeholder="082 123 4567" required className="input" defaultValue={state?.fields?.mobile} />
        
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={state?.fields?.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" />
        <span className="hint">10+ characters, including a number.</span>
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input type="checkbox" name="terms" required className="mt-0.5 h-5 w-5 shrink-0 accent-ember" />
        <span>
          I accept the <Link href="/terms" className="text-ember-300 underline" target="_blank">terms</Link> and{" "}
          <Link href="/privacy" className="text-ember-300 underline" target="_blank">privacy policy</Link>.
        </span>
      </label>
      <Submit>Create account</Submit>
    </form>
  );
}

export function VerifyForm({ next, autoSend, mobile }: { next: string; autoSend: boolean; mobile: string }) {
  const [state, action] = useFormState(confirmVerificationPin, undefined);
  const [sendState, setSendState] = useState<FormState>(undefined);
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    setSendState(await sendVerificationPin());
    setSending(false);
  }
  useEffect(() => {
    if (autoSend) send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Feedback state={state ?? sendState} />
      {state && sendState?.demoCode && !state.demoCode && (
        <Alert tone="warn">Demo PIN: <strong className="font-mono tracking-widest">{sendState.demoCode}</strong></Alert>
      )}
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="code" className="label">6-digit PIN sent to {mobile}</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            className="input text-center font-mono text-2xl tracking-[0.5em]"
          />
        </div>
        <Submit>Confirm my number</Submit>
      </form>
      <button type="button" onClick={send} disabled={sending} className="btn-ghost w-full">
        {sending ? "Sending…" : "Send a new PIN"}
      </button>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [reqState, reqAction] = useFormState(requestPasswordReset, undefined);
  const [resetState, resetAction] = useFormState(resetPassword, undefined);
  const sent = !!reqState?.message;

  if (!sent) {
    return (
      <form action={reqAction} className="space-y-4">
        <Feedback state={reqState} />
        <div>
          <label htmlFor="mobile" className="label">Cellphone number on your account</label>
          <input id="mobile" name="mobile" type="tel" inputMode="tel" required className="input" placeholder="082 123 4567" defaultValue={reqState?.fields?.mobile} />
        </div>
        <Submit>Send me a PIN</Submit>
      </form>
    );
  }
  return (
    <form action={resetAction} className="space-y-4">
      <Feedback state={resetState ?? reqState} />
      <input type="hidden" name="mobile" value={reqState?.fields?.mobile} />
      <div>
        <label htmlFor="code" className="label">6-digit PIN</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className="input text-center font-mono text-xl tracking-[0.4em]" />
      </div>
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" />
        <span className="hint">At least 10 characters, with letters and a number.</span>
      </div>
      <Submit>Set new password</Submit>
    </form>
  );
}
