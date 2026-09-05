"use server";

/**
 * Address autocomplete backed by OpenStreetMap's free Nominatim service.
 * This project has no Google Places API key configured, so rather than fake
 * an integration, this uses a genuinely free service -- proxied through our
 * own server (not called directly from the browser) so we can attach a
 * proper identifying User-Agent, as Nominatim's usage policy requires, and
 * keep client-side request volume down via debouncing in the UI.
 *
 * If higher address-matching accuracy is needed later, this is the seam to
 * swap in Google Places Autocomplete instead -- callers only depend on
 * searchAddress(query) returning { label: string }[].
 */
export async function searchAddress(query: string): Promise<{ label: string }[]> {
  const trimmed = query.trim();
  if (trimmed.length < 4) return [];

  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "0",
    countrycodes: "za",
    limit: "5",
    q: trimmed,
  });

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "airdvance-app/1.0 (rent-to-buy device platform; contact via airdvance.co.za/contact)",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { display_name: string }[];
    return data.map((d) => ({ label: d.display_name }));
  } catch {
    return [];
  }
}
