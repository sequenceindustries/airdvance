"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Pinned hero. As the page scrolls, concentric rings ripple outward from behind
 * the headline and glowing orbs drift toward the viewer through 3D space. Only
 * transform and opacity change (GPU-composited, one rAF per frame). With reduced
 * motion the section isn't pinned and everything sits still.
 */

const RINGS = [0, 1, 2, 3, 4, 5, 6, 7];

// x/y as % offsets from centre, z0 = starting depth (0 far … 1 near), s = size in vmin
const ORBS = [
  { x: -34, y: -24, z0: 0.92, s: 19, a: "#FFB020", b: "#FF5E3A", label: "Taxi fare to work", amount: "R300" },
  { x: 33, y: -28, z0: 0.78, s: 17, a: "#FFE066", b: "#FFB020", label: "Prepaid electricity", amount: "R400", dark: true },
  { x: -28, y: 26, z0: 0.62, s: 18, a: "#FF5E3A", b: "#E0367A", label: "School shoes", amount: "R550" },
  { x: 37, y: 22, z0: 0.97, s: 20, a: "#34D399", b: "#4F46E5", label: "Data to job-hunt", amount: "R300" },
  { x: -6, y: -36, z0: 0.38, s: 16, a: "#0EA5A4", b: "#047857", label: "Groceries till Friday", amount: "R700" },
  { x: 12, y: 34, z0: 0.48, s: 17, a: "#7C9CFF", b: "#1E293B", label: "Car service", amount: "R1,000" },
  { x: -44, y: 0, z0: 0.22, s: 17, a: "#E0367A", b: "#7C3AED", label: "Rent shortfall", amount: "R950" },
  { x: 45, y: -2, z0: 0.16, s: 16, a: "#E0367A", b: "#FF5E3A", label: "Gas refill", amount: "R350" },
  { x: 20, y: -18, z0: 0.06, s: 16, a: "#0EA5A4", b: "#4F46E5", label: "Cracked screen", amount: "R800" },
  { x: -20, y: 16, z0: 0.0, s: 16, a: "#FFE066", b: "#FF5E3A", label: "Exam fees", amount: "R600", dark: true },
];

export function PaydayHero() {
  const root = useRef<HTMLElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (still) {
      el.style.setProperty("--p", "0.15");
      return;
    }
    let frame = 0;
    const tick = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      el.style.setProperty("--p", Math.min(1, Math.max(0, -r.top / span)).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [still]);

  return (
    <section
      ref={root}
      aria-label="Airdvance cash advances"
      className={still ? "relative" : "relative h-[190svh] md:h-[240vh]"}
      style={{ ["--p" as any]: 0 }}
    >
      <div className={`${still ? "relative min-h-[88svh]" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        {/* ripple rings */}
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          {RINGS.map((i) => {
            const base = 0.22 + i * 0.16;
            return (
              <div
                key={i}
                className="absolute aspect-square w-[min(92vw,92vh)] rounded-full will-change-transform"
                style={{
                  border: "1.5px solid transparent",
                  background:
                    "linear-gradient(#000,#000) padding-box, conic-gradient(from calc(var(--p) * 220deg), rgba(52,211,153,.95), rgba(124,156,255,.7), rgba(224,54,122,.85), rgba(255,176,32,.75), rgba(52,211,153,.95)) border-box",
                  transform: `scale(calc(${base} + var(--p) * 1.15))`,
                  opacity: `clamp(0, calc(1 - ${i * 0.07} - var(--p) * 0.45), 1)`,
                }}
              />
            );
          })}
          <div className="absolute h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,.25),transparent)] blur-2xl" style={{ transform: "scale(calc(1 + var(--p) * .8))" }} />
        </div>

        {/* orbs */}
        <div aria-hidden className={`absolute inset-0 [perspective:900px] [transform-style:preserve-3d] ${still ? "opacity-60" : ""}`}>
          {ORBS.map((o, n) => (
            <div
              key={n}
              className={`absolute left-1/2 top-1/2 flex flex-col items-center justify-center rounded-full text-center will-change-transform ${n >= 7 ? "hidden sm:flex" : ""}`}
              style={
                {
                  width: `clamp(104px, ${o.s}vmin, 210px)`,
                  height: `clamp(104px, ${o.s}vmin, 210px)`,
                  color: o.dark ? "#2A1600" : "#fff",
                  background: `radial-gradient(circle at 30% 25%, ${o.a} 0%, ${o.a} 15%, ${o.b} 75%, #000 140%)`,
                  boxShadow: `0 0 70px -12px ${o.a}, inset 0 -10px 30px rgba(0,0,0,.25)`,
                  "--zp": `calc(${o.z0} + var(--p) * 1.45)`,
                  transform: `translate(-50%, -50%) translate3d(${o.x}vw, ${o.y}vh, calc(var(--zp) * 900px - 1100px))`,
                  opacity: `clamp(0, min(calc(var(--zp) * 2.5), calc((1.95 - var(--zp)) * 3)), 1)`,
                } as React.CSSProperties
              }
            >
              <span className="font-display text-[clamp(1.1rem,3vmin,1.9rem)] font-extrabold leading-none tracking-tight">{o.amount}</span>
              <span style={{ width: `clamp(80px, ${o.s * 0.75}vmin, 160px)` }} className="mt-1.5 block text-[clamp(.62rem,1.35vmin,.85rem)] font-medium leading-tight opacity-90">{o.label}</span>
            </div>
          ))}
        </div>

        {/* copy */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <div className="relative max-w-3xl py-8 sm:px-10">
            <div aria-hidden className="absolute -inset-x-20 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgba(0,0,0,.9),rgba(0,0,0,.6)_60%,transparent)]" />
            <h1 className="animate-rise text-[2.5rem] font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">Cash advance before payday.</h1>
            <p className="mx-auto mt-5 max-w-xl animate-rise text-base text-ink-muted [animation-delay:.12s] sm:text-xl">
              R300 to R1,000, repaid in one go on payday.
            </p>
            <div className="mt-8 animate-rise [animation-delay:.24s]">
              <Link href="/apply" className="btn bg-ink px-8 py-3.5 text-base text-night hover:bg-white">
                Apply now
              </Link>
            </div>
          </div>
        </div>

        {!still && (
          <div aria-hidden className="absolute inset-x-0 bottom-6 z-10 flex justify-center text-xs text-ink-faint" style={{ opacity: "calc(1 - var(--p) * 6)" }}>
            Scroll
          </div>
        )}
      </div>
    </section>
  );
}
