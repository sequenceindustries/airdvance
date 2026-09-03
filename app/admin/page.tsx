import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/customer";
import { runOverdueSweep } from "@/lib/actions/payments";

async function getCounts() {
  const supabase = createClient();

  const [
    applications,
    activeCustomers,
    activeAgreements,
    devicesOnRent,
    paymentsDue,
    overduePayments,
    restrictedDevices,
    completedAgreements,
    devicesOwned,
  ] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "UNDER_REVIEW"),
    supabase.from("agreements").select("customer_id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("agreements").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("inventory").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("payment_schedule").select("id", { count: "exact", head: true }).eq("status", "SCHEDULED"),
    supabase.from("payment_schedule").select("id", { count: "exact", head: true }).eq("status", "OVERDUE"),
    supabase.from("device_control").select("id", { count: "exact", head: true }).eq("status", "RESTRICTED"),
    supabase.from("agreements").select("id", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabase.from("inventory").select("id", { count: "exact", head: true }).eq("status", "OWNED"),
  ]);

  return {
    applications: applications.count ?? 0,
    activeCustomers: activeCustomers.count ?? 0,
    activeAgreements: activeAgreements.count ?? 0,
    devicesOnRent: devicesOnRent.count ?? 0,
    paymentsDue: paymentsDue.count ?? 0,
    overduePayments: overduePayments.count ?? 0,
    restrictedDevices: restrictedDevices.count ?? 0,
    completedAgreements: completedAgreements.count ?? 0,
    devicesOwned: devicesOwned.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const counts = await getCounts();

  const cards = [
    { label: "Applications awaiting review", value: counts.applications, href: "/admin/applications" },
    { label: "Active customers", value: counts.activeCustomers },
    { label: "Active agreements", value: counts.activeAgreements },
    { label: "Devices on rent", value: counts.devicesOnRent, href: "/admin/devices" },
    { label: "Payments due", value: counts.paymentsDue },
    { label: "Overdue payments", value: counts.overduePayments },
    { label: "Restricted devices", value: counts.restrictedDevices, href: "/admin/devices" },
    { label: "Completed agreements", value: counts.completedAgreements },
    { label: "Devices owned", value: counts.devicesOwned },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Admin dashboard</h1>
        <form action={async () => { "use server"; await runOverdueSweep(); }}>
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Run overdue payment sweep
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 font-display text-3xl">{card.value}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/admin/applications" className="font-medium text-signal hover:text-signal-dark">
          Review applications →
        </Link>
        <Link href="/admin/devices" className="font-medium text-signal hover:text-signal-dark">
          Manage devices →
        </Link>
      </div>
    </div>
  );
}
