"use client";

import type Lenis from "lenis";
import { SECTIONS } from "./sections";
import type { SectionId } from "./store";

let lenisInstance: Lenis | null = null;

type VelocityControls = {
  impart: (deltaProgress: number) => void;
  getPlayhead: () => number;
  scrollToProgress: (progress: number) => void;
};

let velocityControls: VelocityControls | null = null;

export function setLenisInstance(lenis: Lenis | null) {
  lenisInstance = lenis;
}

export function registerVelocityControls(controls: VelocityControls | null) {
  velocityControls = controls;
}

export function scrollToSection(id: SectionId) {
  const index = SECTIONS.findIndex((s) => s.id === id);
  if (index < 0) return;

  const progress = index / Math.max(1, SECTIONS.length - 1);

  if (velocityControls) {
    const current = velocityControls.getPlayhead();
    velocityControls.impart((progress - current) * 0.45);
    return;
  }

  if (!lenisInstance) return;
  const limit = lenisInstance.limit;
  const target = progress * limit;
  lenisInstance.scrollTo(target, { duration: 2 });
}

export function getSectionReveal(
  progress: number,
  sectionIndex: number,
): number {
  const total = SECTIONS.length;
  const start = sectionIndex / total;
  const end = (sectionIndex + 1.1) / total;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}
