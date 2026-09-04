"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/actions/contact";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"idle" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult("idle");
    const res = await submitContactMessage(form);
    setSending(false);
    if (res?.error) {
      setResult("error");
      setErrorText(res.error);
      return;
    }
    setResult("sent");
    setForm({ name: "", email: "", message: "" });
  }

  if (result === "sent") {
    return (
      <div className="rounded-lg border border-signal/30 bg-signal-light p-5 text-sm text-signal-dark">
        Thanks — we've received your message and will get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-white/10 bg-surface p-5">
      <label className="text-sm">
        <span className="block text-slate-300">Name</span>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input mt-1"
          required
        />
      </label>
      <label className="text-sm">
        <span className="block text-slate-300">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="input mt-1"
          required
        />
      </label>
      <label className="text-sm">
        <span className="block text-slate-300">Message</span>
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="input mt-1"
          rows={4}
          required
        />
      </label>
      {result === "error" && <p className="text-sm text-alert">{errorText}</p>}
      <button
        type="submit"
        disabled={sending}
        className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
      >
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
