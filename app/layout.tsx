import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentProfile } from "@/lib/data/customer";

const archivoBlack = Archivo_Black({ subsets: ["latin"], variable: "--font-display", weight: "400" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Airdvance — Get the device you need now. Pay over time. Own it.",
  description:
    "Rent-to-own smartphones, tablets and laptops. Choose a device, spread the cost over an agreed term, and own it at the end.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body className="font-body flex min-h-screen flex-col bg-paper text-ink antialiased">
        <SiteHeader profile={profile} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
