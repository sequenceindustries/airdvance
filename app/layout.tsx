import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/demo-banner";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? `https://${BRAND.domain}`),
  title: {
    default: "Airdvance — Cash advances from R300 to R1,000",
    template: "%s · Airdvance",
  },
  description:
    "Borrow R300 to R1,000 until payday, entirely online. See every rand of the cost before you apply. Registered credit provider. Approval subject to an affordability assessment.",
  openGraph: { siteName: "Airdvance", locale: "en_ZA", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#F5F5F7",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <html lang="en-ZA">
      <body className="flex min-h-screen flex-col bg-night font-body text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <DemoBanner />
        <SiteHeader user={user ? { name: user.full_name, role: user.role } : null} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
