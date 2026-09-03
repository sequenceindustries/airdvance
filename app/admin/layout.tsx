import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-6 px-6 py-3 text-sm">
          <Link href="/admin" className="font-medium text-slate-700 hover:text-ink">Overview</Link>
          <Link href="/admin/applications" className="font-medium text-slate-700 hover:text-ink">Applications</Link>
          <Link href="/admin/agreements" className="font-medium text-slate-700 hover:text-ink">Agreements</Link>
          <Link href="/admin/devices" className="font-medium text-slate-700 hover:text-ink">Devices</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
