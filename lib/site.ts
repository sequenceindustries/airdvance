import type { Metadata } from "next";

/**
 * Canonical origin for every public URL (canonical tags, sitemap, robots,
 * structured data, social cards). Requests on any other host are 301-redirected
 * here by middleware.ts. Deliberately not derived from APP_URL so a staging or
 * Railway URL can never leak into canonical tags.
 */
export const SITE_URL = "https://airdvance.co.za";
export const SITE_HOST = "airdvance.co.za";

const OG_IMAGE = { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Airdvance — Cash advance before payday, R300 to R1,000" };

export interface PublicPage {
  path: string;
  title: string;
  description: string;
  /** ISO date the page's content last changed — feeds sitemap <lastmod> and "Last updated". */
  updated: string;
  priority: number;
}

/**
 * The only pages that are public, canonical and indexable. The sitemap is
 * generated from this list, so adding a page here is what makes it indexable.
 */
export const PUBLIC_PAGES: PublicPage[] = [
  {
    path: "/",
    title: "Airdvance — Cash advance before payday, R300 to R1,000",
    description:
      "Borrow R300 to R1,000 online and repay in one go on payday. See the full cost before you apply. Registered credit provider. Subject to an affordability assessment.",
    updated: "2026-10-08",
    priority: 1,
  },
  {
    path: "/how-it-works",
    title: "How a cash advance works",
    description:
      "Five steps from choosing an amount to repaying on payday: apply online, a person checks affordability, sign the agreement, get paid, repay by debit order.",
    updated: "2026-10-08",
    priority: 0.8,
  },
  {
    path: "/costs",
    title: "Costs and repayment examples",
    description:
      "Every charge on an Airdvance cash advance: R165 initiation fee, service fee of R2 a day (max R60 a month) and 5% interest a month. Worked repayment examples for R300 to R1,000.",
    updated: "2026-10-08",
    priority: 0.9,
  },
  {
    path: "/eligibility",
    title: "Who can apply for a cash advance",
    description:
      "To apply you need to be 18 or older with an SA ID, employed with your salary paid into your bank account, and not under debt review. See the documents you'll upload.",
    updated: "2026-10-08",
    priority: 0.8,
  },
  {
    path: "/faq",
    title: "Cash advance questions answered",
    description:
      "Answers about how much you can borrow, what it costs, approval, payout, early settlement, repayment by debit order and what to do if you can't pay on payday.",
    updated: "2026-10-08",
    priority: 0.7,
  },
  {
    path: "/responsible-lending",
    title: "Responsible lending",
    description:
      "How Airdvance assesses affordability, what we commit to, and where to get help if you're struggling with debt, including debt counselling and free credit reports.",
    updated: "2026-10-08",
    priority: 0.5,
  },
  {
    path: "/contact",
    title: "Contact us",
    description: "Get in touch with Airdvance by email or the contact form. For complaints, see our complaints process.",
    updated: "2026-10-08",
    priority: 0.5,
  },
  {
    path: "/complaints",
    title: "Complaints process",
    description:
      "How to lodge a complaint with Airdvance, our response times, and how to escalate to the Credit Ombud, National Credit Regulator or Information Regulator.",
    updated: "2026-10-08",
    priority: 0.3,
  },
  {
    path: "/terms",
    title: "Terms and conditions",
    description: "The terms that govern use of the Airdvance website and accounts, applying for credit, signing, repayment and default.",
    updated: "2026-10-08",
    priority: 0.3,
  },
  {
    path: "/privacy",
    title: "Privacy policy (POPIA)",
    description:
      "How Airdvance collects, uses, shares and protects personal information under POPIA, how long we keep it, cookies and analytics, and your rights.",
    updated: "2026-10-08",
    priority: 0.3,
  },
  {
    path: "/paia",
    title: "PAIA manual",
    description: "How to request access to records held by Airdvance under the Promotion of Access to Information Act.",
    updated: "2026-10-07",
    priority: 0.2,
  },
];

export function page(path: string): PublicPage {
  const p = PUBLIC_PAGES.find((x) => x.path === path);
  if (!p) throw new Error(`Not a registered public page: ${path}`);
  return p;
}

export function absoluteUrl(path: string) {
  // Next normalises the root canonical to no trailing slash; the sitemap matches it exactly.
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Full metadata for a public, indexable page: title, description, canonical, Open Graph, Twitter. */
export function publicMetadata(path: string): Metadata {
  const p = page(path);
  const url = absoluteUrl(path);
  return {
    title: path === "/" ? { absolute: p.title } : p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Airdvance",
      locale: "en_ZA",
      url,
      title: p.title,
      description: p.description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [OG_IMAGE.url] },
  };
}

/** Metadata for pages that must never be indexed (auth, account, application, admin). */
export function privateMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
}

/** Human date for "Last updated" lines, from an ISO date. */
export function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}
