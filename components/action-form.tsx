"use client";

import { useFormState } from "react-dom";
import type { FormState } from "@/lib/actions/auth";
import { Submit } from "./auth-forms";
import { Alert } from "./ui";

export function ActionForm({
  action,
  hidden,
  submit,
  submitClass = "btn-primary",
  confirm,
  children,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  hidden?: Record<string, string>;
  submit: string;
  submitClass?: string;
  confirm?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useFormState(action, undefined);
  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.message && <Alert tone="success">{state.message}</Alert>}
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {children}
      <Submit className={submitClass}>{submit}</Submit>
    </form>
  );
}
