"use client";

import { SECTIONS } from "@/lib/sections";
import { scrollToSection } from "@/lib/scrollTimeline";
import { useActiveSection } from "@/hooks/useScrollProgress";
import type { SectionId } from "@/lib/store";

/** Reserved right gutter — text layer uses matching padding so panels never sit under nav. */
export const NAV_GUTTER_PX = 56;

export function Nav() {
  const active = useActiveSection();

  return (
    <nav
      className="pointer-events-auto fixed top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-4 md:flex"
      style={{ right: "max(1rem, env(safe-area-inset-right, 0px))" }}
      aria-label="Section progress"
    >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToSection(section.id as SectionId)}
          className="flex h-6 w-6 items-center justify-center"
          aria-label={section.label}
          aria-current={active === section.id ? "step" : undefined}
          title={section.label}
        >
          <span
            className="block rounded-full border border-white/40 transition-all duration-300"
            style={{
              width: active === section.id ? 10 : 8,
              height: active === section.id ? 10 : 8,
              backgroundColor:
                active === section.id ? "rgba(255,255,255,0.9)" : "transparent",
            }}
          />
        </button>
      ))}
    </nav>
  );
}
