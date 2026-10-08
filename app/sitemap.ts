import type { MetadataRoute } from "next";
import { PUBLIC_PAGES, absoluteUrl } from "@/lib/site";

/** Generated from the public-page registry in lib/site.ts, so it can't drift from what's indexable. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.updated,
    changeFrequency: p.path === "/" || p.path === "/costs" ? "weekly" : "monthly",
    priority: p.priority,
  }));
}
