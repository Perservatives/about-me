"use client";

import { useScrollStore } from "@/lib/store";

export function ScrollHint() {
  const progress = useScrollStore((s) => s.progress);

  if (progress > 0.04) return null;

  return (
    <div className="pointer-events-none fixed bottom-10 left-1/2 z-50 -translate-x-1/2">
      <p className="text-center text-[10px] tracking-[0.35em] text-white/50 uppercase drop-shadow">
        Scroll to soar
      </p>
      <div className="mx-auto mt-3 h-8 w-px animate-pulse bg-white/40" />
    </div>
  );
}
