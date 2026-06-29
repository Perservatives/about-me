"use client";

import { useScrollStore } from "@/lib/store";

export function useScrollProgress() {
  return useScrollStore((s) => s.progress);
}

export function useActiveSection() {
  return useScrollStore((s) => s.activeSection);
}
