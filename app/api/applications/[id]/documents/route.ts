import { NextResponse } from "next/server";
import { clientIp, getCurrentUser } from "@/lib/auth";
import { one, tx } from "@/lib/db";
import { insertDocs, prepareFiles, type DocKind } from "@/lib/documents";
import { audit } from "@/lib/records";

export const runtime = "nodejs";

/** Customer uploads extra documents in response to a "more information" request, then resubmits. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const app = await one<{ id: string; status: string }>("select id, status from applications where id = $1 and user_id = $2", [params.id, user.id]);
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (app.status !== "MORE_INFO_REQUIRED") return NextResponse.json({ error: "This application isn't waiting for more information." }, { status: 409 });

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "OTHER") as DocKind;
  const note = String(form.get("note") ?? "").slice(0, 1000);
  const entries = form.getAll("files").filter((f): f is File => f instanceof File).map((file) => ({ kind: (["ID", "PAYSLIP", "BANK_STATEMENT", "OTHER"].includes(kind) ? kind : "OTHER") as DocKind, file }));
  if (!entries.length && !note.trim()) return NextResponse.json({ error: "Add a file or a note for our team." }, { status: 400 });
  const docs = await prepareFiles(entries);
  if ("error" in docs) return NextResponse.json({ error: docs.error }, { status: 400 });

  await tx(async (c) => {
    await insertDocs(c, app.id, user.id, docs);
    await c.query(
      `update applications set status = 'SUBMITTED', updated_at = now(),
         admin_notes = admin_notes || $2::jsonb where id = $1`,
      [app.id, JSON.stringify(note.trim() ? [{ at: new Date().toISOString(), by: "Customer", note: note.trim() }] : [])],
    );
    await audit(c, { actorId: user.id, action: "INFO_PROVIDED", entity: "application", entityId: app.id, metadata: { files: docs.length }, ip: clientIp() });
  });
  return NextResponse.json({ ok: true });
}
