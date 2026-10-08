"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { POSTERS, Poster } from "./poster";

/**
 * Pinned hero: poster cards drift toward the viewer through 3D space as the page
 * scrolls, while the headline and actions stay put in the centre. Only transforms
 * and opacity change (GPU-composited, one rAF per frame). With reduced motion the
 * section is not pinned and the cards sit still.
 */

// x/y as % offsets from centre, z0 = starting depth (0 far … 1 near)
const FIELD = [
  { i: 0, x: -36, y: -26, z0: 0.9 },
  { i: 1, x: 34, y: -30, z0: 0.75 },
  { i: 2, x: -30, y: 28, z0: 0.6 },
  { i: 3, x: 38, y: 24, z0: 0.95 },
  { i: 4, x: -8, y: -36, z0: 0.35 },
  { i: 5, x: 14, y: 36, z0: 0.45 },
  { i: 6, x: -44, y: 2, z0: 0.2 },
  { i: 7, x: 46, y: -4, z0: 0.15 },
  { i: 8, x: 20, y: -22, z0: 0.05 },
  { i: 9, x: -22, y: 18, z0: 0.0 },
];

export function PaydayHero({ exampleTotal }: { exampleTotal: string }) {
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
      el.style.setProperty("--p", "0.08");
      return;
    }
    let frame = 0;
    const tick = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      el.style.setProperty("--p", p.toFixed(4));
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
      style={{ ["--p" as any]: 0.18 }}
    >
      <div className={`${still ? "relative min-h-[88svh]" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        {/* glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,.28),rgba(224,54,122,.12)_55%,transparent)] blur-2xl" />

        {/* card field */}
        <div aria-hidden className={`absolute inset-0 [perspective:900px] [transform-style:preserve-3d] ${still ? "opacity-50" : ""}`}>
          {FIELD.map((f, n) => {
            const spec = POSTERS[f.i];
            return (
              <div
                key={spec.key}
                className={`absolute left-1/2 top-1/2 w-[30vw] max-w-[210px] will-change-transform sm:w-[18vw] ${n >= 7 ? "hidden sm:block" : ""}`}
                style={
                  {
                    "--zp": `calc(${f.z0} + var(--p) * 1.45)`,
                    transform: `translate(-50%, -50%) translate3d(${f.x}vw, ${f.y}vh, calc(var(--zp) * 900px - 1100px))`,
                    opacity: `clamp(0, min(calc(var(--zp) * 2.5), calc((1.95 - var(--zp)) * 3)), 1)`,
                  } as React.CSSProperties
                }
              >
                <Poster spec={spec} compact />
              </div>
            );
          })}
        </div>

        {/* copy */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <div className="relative max-w-3xl px-2 py-8 sm:px-10">
            <div aria-hidden className="absolute -inset-x-24 -inset-y-20 -z-10 bg-[radial-gradient(closest-side,rgba(0,0,0,.92),rgba(0,0,0,.75)_55%,transparent)]" />
            <h1 className="animate-rise text-[2.4rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">Cash before payday.</h1>
            <p className="mx-auto mt-5 max-w-xl animate-rise text-base text-ink-muted [animation-delay:.12s] sm:text-xl">
              R300 to R1,000, repaid in one go on payday.
            </p>
            <div className="mt-8 flex animate-rise flex-col items-center justify-center gap-3 [animation-delay:.24s] sm:flex-row">
              <Link href="/apply" className="btn bg-ink px-7 py-3 text-base text-night hover:bg-white">
                Apply now
              </Link>
              <Link href="#calculator" className="btn-ghost px-7 py-3 text-base">
                See my cost
              </Link>
            </div>
            <p className="mt-6 animate-rise text-xs text-ink-faint [animation-delay:.36s]">
              Subject to approval.
            </p>
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
