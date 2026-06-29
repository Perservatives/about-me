"use client";

import { useSyncExternalStore } from "react";

function subscribeMediaQuery(query: string, cb: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => subscribeMediaQuery("(prefers-reduced-motion: reduce)", cb),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function useIsMobile(breakpoint = 768): boolean {
  const query = `(max-width: ${breakpoint}px)`;
  return useSyncExternalStore(
    (cb) => subscribeMediaQuery(query, cb),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
