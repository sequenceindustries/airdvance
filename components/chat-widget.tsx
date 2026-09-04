"use client";

import { useState } from "react";
import { askAssistant } from "@/lib/actions/assistant";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi, I'm the airdvance assistant. Ask me about applying, payments, buyouts, or how the debit order works." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);
    const answer = await askAssistant(text);
    setMessages((m) => [...m, { role: "assistant", text: answer }]);
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-white/10 bg-surface p-5">
      <div>
        <p className="font-medium text-ink">airdvance assistant</p>
        <p className="text-sm text-slate-400">Instant answers to common questions.</p>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-md border border-white/10 bg-white/5 p-3" style={{ minHeight: 220, maxHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                "inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm " +
                (m.role === "user" ? "bg-brand text-white" : "bg-white/10 text-slate-200")
              }
            >
              {m.text}
            </span>
          </div>
        ))}
        {sending && <p className="text-xs text-slate-500">Typing…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
