import { markMessageHandled } from "@/lib/actions/admin";
import { query } from "@/lib/db";
import { formatDateTime } from "@/lib/dates";

export default async function AdminMessages() {
  const rows = await query<any>("select * from contact_messages order by handled_at nulls first, created_at desc limit 200");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Messages</h1>
      {rows.length === 0 && <p className="text-ink-muted">No messages yet.</p>}
      <div className="space-y-3">
        {rows.map((m) => (
          <div key={m.id} className={`glass p-5 ${m.handled_at ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.name} <span className="ml-2 badge border-ink/15 text-ink-muted">{m.topic}</span></p>
                <p className="text-sm text-ink-muted">{m.email}{m.mobile ? ` · ${m.mobile}` : ""} · {formatDateTime(m.created_at)}</p>
              </div>
              {!m.handled_at && (
                <form action={markMessageHandled}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="btn-ghost btn-sm">Mark handled</button>
                </form>
              )}
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
