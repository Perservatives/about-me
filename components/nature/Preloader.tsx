"use client";

import { useEffect, useState } from "react";

export function Preloader({ progress, done }: { progress: number; done: boolean }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (done) {
      const id = setTimeout(() => setHidden(true), 900);
      return () => clearTimeout(id);
    }
  }, [done]);

  if (hidden) return null;

  const pct = Math.round(progress * 100);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07120c] transition-opacity duration-700"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
      aria-hidden={done}
    >
      <p className="mb-6 text-[11px] font-medium tracking-[0.5em] text-white/50 uppercase">
        Loading the experience
      </p>

      <div className="h-px w-56 overflow-hidden bg-white/10">
        <div
          className="h-full bg-white/80 transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-5 font-mono text-xs tabular-nums text-white/40">
        {pct.toString().padStart(3, "0")}%
      </p>
    </div>
  );
}
