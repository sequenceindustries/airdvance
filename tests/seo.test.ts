import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_PAGES, SITE_URL, absoluteUrl } from "../lib/site";
import { sanitizePath } from "../lib/analytics";
import { calculateQuote, type Quote } from "../lib/pricing";
import { FAQS } from "../lib/content";

const PRIVATE = /^\/(admin|dashboard|api|verify|apply|login|register|forgot-password)(\/|$)/;

test("every sitemap page exists, is public and unique", () => {
  const seen = new Set<string>();
  for (const p of PUBLIC_PAGES) {
    assert.ok(!PRIVATE.test(p.path), `${p.path} is private`);
    assert.ok(!seen.has(p.path), `${p.path} duplicated`);
    seen.add(p.path);
    const file = p.path === "/" ? "app/page.tsx" : `app${p.path}/page.tsx`;
    assert.ok(existsSync(join(process.cwd(), file)), `${file} missing`);
    assert.match(p.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.description.length >= 70 && p.description.length <= 200, `${p.path} description length ${p.description.length}`);
  }
  assert.equal(new Set(PUBLIC_PAGES.map((p) => p.title)).size, PUBLIC_PAGES.length, "titles must be distinct");
  assert.equal(new Set(PUBLIC_PAGES.map((p) => p.description)).size, PUBLIC_PAGES.length, "descriptions must be distinct");
  assert.equal(absoluteUrl("/costs"), `${SITE_URL}/costs`);
  assert.ok(SITE_URL.startsWith("https://"));
});

test("analytics paths never carry IDs or query strings", () => {
  assert.equal(sanitizePath("/dashboard/loans/3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab"), "/dashboard/loans/:id");
  assert.equal(sanitizePath("/dashboard/applications/AD-12345"), "/dashboard/applications/:id");
  assert.equal(sanitizePath("/costs"), "/costs");
});

test("published cost example matches the pricing engine", () => {
  const q = calculateQuote({ principal: 1000, startDate: "2026-01-01", dueDate: "2026-01-31", allowShortTerm: true }) as Quote;
  assert.equal(q.totalRepayable, 1274.32);
  assert.ok(FAQS.some((f) => f.a.includes("R274.32") && f.a.includes("R1,274.32")));
});
