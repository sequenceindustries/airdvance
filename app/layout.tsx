import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentProfile } from "@/lib/data/customer";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "airdvance — Get the device you need now. Pay over time. Buy it.",
  description:
    "Rent-to-buy smartphones and tablets — not credit, just affordability. Choose a device, spread the cost over an agreed term, and buy it at the end for as little as R1.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-body flex min-h-screen flex-col bg-paper text-ink antialiased">
        <SiteHeader profile={profile} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
