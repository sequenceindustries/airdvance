import clsx from "clsx";

/**
 * Original poster artwork for everyday South African payday gaps — layered
 * gradients, a geometric pattern and a bold glyph, all drawn in SVG so it is
 * crisp at any size, weighs almost nothing and needs no licensed photography.
 */

type Pattern = "rings" | "stripes" | "sunburst" | "dots" | "waves" | "arcs";

export interface PosterSpec {
  key: string;
  label: string;
  amount: string;
  from: string;
  to: string;
  pattern: Pattern;
  glyph: keyof typeof GLYPHS;
  ink?: string;
}

const GLYPHS = {
  taxi: "M8 34h48v-9c0-3-2-5-5-6l-6-9H19c-3 0-5 2-6 4l-4 11c-1 1-1 2-1 3zM18 13h10v8H14zM32 13h11l5 8H32zM14 40a4 4 0 1 0 8 0M42 40a4 4 0 1 0 8 0",
  bolt: "M36 4 14 36h16l-4 24 24-34H34z",
  shoe: "M6 40c0-6 2-14 6-18l8 6c4 3 10 4 16 4h10c6 0 12 3 12 8v2H6zM6 44h52",
  signal: "M10 50V40M22 50V32M34 50V22M46 50V10",
  basket: "M8 24h48l-6 28H14zM18 24l10-14M46 24 36 10M22 34v10M32 34v10M42 34v10",
  wrench: "M44 8a12 12 0 0 0-14 15L10 43a5 5 0 0 0 7 7l20-20A12 12 0 0 0 52 16l-7 7-6-2-2-6z",
  home: "M10 30 32 10l22 20M16 26v26h32V26M28 52V38h8v14",
  flame: "M32 6c4 10 14 14 14 28a14 14 0 0 1-28 0c0-8 4-12 6-16 2 6 6 8 8 8-2-8-2-14 0-20z",
  phone: "M22 6h20a4 4 0 0 1 4 4v44a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4zM28 50h8",
  book: "M10 12c8-2 16-1 22 4v38c-6-5-14-6-22-4zM54 12c-8-2-16-1-22 4v38c6-5 14-6 22-4z",
} as const;

export const POSTERS: PosterSpec[] = [
  { key: "taxi", label: "Taxi fare to work", amount: "R300", from: "#FF5E3A", to: "#FFB020", pattern: "sunburst", glyph: "taxi" },
  { key: "power", label: "Prepaid electricity", amount: "R400", from: "#FFB020", to: "#FFE066", pattern: "rings", glyph: "bolt", ink: "#2A1600" },
  { key: "shoes", label: "School shoes", amount: "R550", from: "#E0367A", to: "#FF5E3A", pattern: "stripes", glyph: "shoe" },
  { key: "data", label: "Data to job-hunt", amount: "R300", from: "#4F46E5", to: "#34D399", pattern: "waves", glyph: "signal" },
  { key: "food", label: "Groceries till Friday", amount: "R700", from: "#10B981", to: "#0EA5A4", pattern: "dots", glyph: "basket" },
  { key: "car", label: "Car service", amount: "R1,000", from: "#1E293B", to: "#7C9CFF", pattern: "arcs", glyph: "wrench" },
  { key: "rent", label: "Rent shortfall", amount: "R950", from: "#7C3AED", to: "#E0367A", pattern: "rings", glyph: "home" },
  { key: "gas", label: "Gas refill", amount: "R350", from: "#FF5E3A", to: "#E0367A", pattern: "waves", glyph: "flame" },
  { key: "screen", label: "Cracked screen", amount: "R800", from: "#0EA5A4", to: "#4F46E5", pattern: "stripes", glyph: "phone" },
  { key: "fees", label: "Exam fees", amount: "R600", from: "#FFB020", to: "#FF5E3A", pattern: "arcs", glyph: "book", ink: "#2A1600" },
];

function PatternLayer({ kind, id }: { kind: Pattern; id: string }) {
  const s = { stroke: "rgba(255,255,255,.28)", fill: "none", strokeWidth: 1.4 } as const;
  switch (kind) {
    case "rings":
      return (
        <g {...s}>
          {[18, 34, 50, 66, 82, 98].map((r) => (
            <circle key={r} cx="120" cy="30" r={r} />
          ))}
        </g>
      );
    case "stripes":
      return (
        <g {...s} strokeWidth={10} stroke="rgba(255,255,255,.12)">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={-40 + i * 22} y1="0" x2={40 + i * 22} y2="200" />
          ))}
        </g>
      );
    case "sunburst":
      return (
        <g stroke="rgba(255,255,255,.22)" strokeWidth="2">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI;
            return <line key={i} x1="75" y1="200" x2={75 + Math.cos(a) * -260} y2={200 - Math.sin(a) * 260} />;
          })}
        </g>
      );
    case "dots":
      return (
        <g fill="rgba(255,255,255,.22)">
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 6 }, (_, c) => <circle key={`${r}-${c}`} cx={12 + c * 26} cy={12 + r * 26} r={2.4 + ((r + c) % 3)} />),
          )}
        </g>
      );
    case "waves":
      return (
        <g {...s}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M-10 ${30 + i * 18} q 20 -14 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} />
          ))}
        </g>
      );
    case "arcs":
      return (
        <g {...s} strokeWidth={12} stroke="rgba(255,255,255,.14)">
          <circle cx="0" cy="200" r="60" />
          <circle cx="0" cy="200" r="100" />
          <circle cx="0" cy="200" r="140" />
          <circle cx="150" cy="0" r="50" stroke={`url(#${id}-g)`} />
        </g>
      );
  }
}

export function Poster({ spec, className, compact }: { spec: PosterSpec; className?: string; compact?: boolean }) {
  const id = `p-${spec.key}`;
  const ink = spec.ink ?? "#FFFFFF";
  return (
    <figure
      className={clsx("relative isolate aspect-[3/4] overflow-hidden rounded-2xl shadow-card", className)}
      style={{ background: `linear-gradient(150deg, ${spec.from}, ${spec.to})` }}
    >
      <svg viewBox="0 0 150 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-v`} cx=".5" cy=".35" r=".8">
            <stop offset="0" stopColor="#fff" stopOpacity=".18" />
            <stop offset="1" stopColor="#000" stopOpacity=".28" />
          </radialGradient>
        </defs>
        <PatternLayer kind={spec.pattern} id={id} />
        <rect width="150" height="200" fill={`url(#${id}-v)`} />
        <g transform="translate(43 58) scale(1)" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d={GLYPHS[spec.glyph]} />
        </g>
      </svg>
      {!spec.ink && <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />}
      <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4" style={{ color: ink }}>
        <span className={clsx("block font-display font-semibold leading-none tracking-[-0.04em]", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
          {spec.amount}
        </span>
        <span className={clsx("mt-1 block font-medium leading-tight opacity-90", compact ? "text-[11px]" : "text-xs sm:text-sm")}>{spec.label}</span>
      </figcaption>
    </figure>
  );
}
