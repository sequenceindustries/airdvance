import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Crawling is allowed everywhere except areas that only ever redirect to the
 * login page or return private data. Pages that must not be indexed but are
 * harmless to crawl (login, register, password reset) are left crawlable so
 * search engines can see their noindex tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api/", "/verify"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
