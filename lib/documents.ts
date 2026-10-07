import "server-only";
import type { PoolClient } from "pg";
import { ALLOWED_MIME, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "./application-schema";

export type DocKind = "ID" | "PAYSLIP" | "BANK_STATEMENT" | "OTHER";

/** Identify the real file type from its first bytes. */
export function sniffMime(buf: Buffer): string | null {
  if (buf.subarray(0, 4).toString("latin1") === "%PDF") return "application/pdf";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  const brand = buf.subarray(4, 12).toString("latin1");
  if (/^ftyp(heic|heix|mif1|msf1|hevc)/.test(brand)) return "image/heic";
  return null;
}

export interface PreparedDoc {
  kind: DocKind;
  filename: string;
  mime: string;
  data: Buffer;
}

export async function prepareFiles(entries: { kind: DocKind; file: File }[]): Promise<PreparedDoc[] | { error: string }> {
  let total = 0;
  const out: PreparedDoc[] = [];
  for (const { kind, file } of entries) {
    if (!file || file.size === 0) continue;
    if (file.size > MAX_FILE_BYTES) return { error: `${file.name} is larger than 8 MB. Please upload a smaller file.` };
    total += file.size;
    if (total > MAX_TOTAL_BYTES) return { error: "Your files add up to more than 30 MB. Please upload smaller files." };
    const data = Buffer.from(await file.arrayBuffer());
    const mime = sniffMime(data);
    if (!mime || !ALLOWED_MIME.includes(mime)) {
      return { error: `${file.name} isn't a PDF or photo we can read. Please upload a PDF, JPG or PNG.` };
    }
    const filename = (file.name || "document").replace(/[^\w.\- ]+/g, "_").slice(0, 120);
    out.push({ kind, filename, mime, data });
  }
  return out;
}

export async function insertDocs(c: PoolClient, applicationId: string, userId: string, docs: PreparedDoc[]) {
  for (const d of docs) {
    await c.query(
      "insert into documents (application_id, user_id, kind, filename, mime, size_bytes, data) values ($1,$2,$3,$4,$5,$6,$7)",
      [applicationId, userId, d.kind, d.filename, d.mime, d.data.length, d.data],
    );
  }
}
