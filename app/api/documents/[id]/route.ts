import { getCurrentUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { audit } from "@/lib/records";

export const runtime = "nodejs";

/** Serves an uploaded document to its owner or an admin. Never cached, never sniffed. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response("Not found", { status: 404 });
  const doc = await one<{ user_id: string; filename: string; mime: string; data: Buffer; application_id: string }>(
    "select user_id, filename, mime, data, application_id from documents where id = $1",
    [params.id],
  );
  if (!doc || (doc.user_id !== user.id && user.role !== "ADMIN")) return new Response("Not found", { status: 404 });
  if (user.role === "ADMIN") {
    await audit(null, { actorId: user.id, action: "DOCUMENT_VIEWED", entity: "document", entityId: params.id, metadata: { application: doc.application_id } });
  }
  return new Response(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename="${doc.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
