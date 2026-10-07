import type { MetadataRoute } from "next";

const PAGES = ["", "/how-it-works", "/costs", "/eligibility", "/faq", "/contact", "/apply", "/responsible-lending", "/terms", "/privacy", "/paia", "/complaints"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? "https://airdvance.co.za";
  return PAGES.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.6 }));
}
