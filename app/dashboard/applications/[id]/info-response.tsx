"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui";

export function InfoResponse({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [kind, setKind] = useState("OTHER");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.set("kind", kind);
    body.set("note", note);
    files.forEach((f) => body.append("files", f));
    const res = await fetch(`/api/applications/${applicationId}/documents`, { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "Something went wrong.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <label className="block">
        <span className="label">What are you uploading?</span>
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="ID">ID document</option>
          <option value="PAYSLIP">Payslip</option>
          <option value="BANK_STATEMENT">Bank statement</option>
          <option value="OTHER">Something else</option>
        </select>
      </label>
      <label className="btn-ghost btn-sm cursor-pointer">
        {files.length ? `${files.length} file(s) chosen` : "Choose files"}
        <input type="file" multiple className="sr-only" accept="application/pdf,image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      </label>
      <label className="block">
        <span className="label">Note for our team (optional)</span>
        <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button onClick={send} disabled={busy} className="btn-primary">
        {busy ? "Sending…" : "Send and resubmit"}
      </button>
    </div>
  );
}
