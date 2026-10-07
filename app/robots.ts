import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api", "/verify"] },
    sitemap: `${process.env.APP_URL ?? "https://airdvance.co.za"}/sitemap.xml`,
  };
}
