"use client";

import { useRef, useState } from "react";
import { searchAddress } from "@/lib/actions/address";

export function AddressAutocomplete({
  value,
  onChange,
  rows = 3,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<{ label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    onChange(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < 4) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchAddress(next);
      setLoading(false);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 500);
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="input"
        rows={rows}
        required={required}
        placeholder="Start typing your address…"
      />
      {loading && <p className="mt-1 text-xs text-slate-500">Searching…</p>}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-white/10 bg-surface shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.label);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
