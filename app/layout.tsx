import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/motion";
import { Analytics } from "@/components/analytics";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Airdvance — Cash advance before payday",
    template: "%s · Airdvance",
  },
  applicationName: "Airdvance",
  formatDetection: { telephone: false },
  openGraph: { siteName: "Airdvance", locale: "en_ZA", type: "website" },
};

/**
 * Read at request time so Search Console's HTML-tag verification can be switched on with the
 * GOOGLE_SITE_VERIFICATION Railway variable (the content="" value Google gives you), no rebuild.
 */
export function generateMetadata(): Metadata {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return google ? { ...baseMetadata, verification: { google } } : baseMetadata;
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <html lang="en-ZA">
      <body className="flex min-h-screen flex-col bg-night font-body text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-night">
          Skip to content
        </a>
        <SiteHeader user={user ? { name: user.full_name, role: user.role } : null} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <RevealObserver />
        <Analytics />
      </body>
    </html>
  );
}
