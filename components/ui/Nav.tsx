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
      className="pointer-events-auto fixed top-1/2 z-[60] hidden -translate-y-1/2 flex-col gap-3 md:flex"
      style={{ right: "max(1rem, env(safe-area-inset-right, 0px))" }}
      aria-label="Section progress"
    >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToSection(section.id as SectionId)}
          className="pointer-events-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label={section.label}
          aria-current={active === section.id ? "step" : undefined}
          title={section.label}
        >
          <span
            className="pointer-events-none block rounded-full border border-white/50 transition-all duration-300"
            style={{
              width: active === section.id ? 12 : 9,
              height: active === section.id ? 12 : 9,
              backgroundColor:
                active === section.id ? "rgba(255,255,255,0.95)" : "transparent",
            }}
          />
        </button>
      ))}
    </nav>
  );
}
