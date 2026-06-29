"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import {
  registerVelocityControls,
  setLenisInstance,
} from "@/lib/scrollTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/lib/store";
import { SECTIONS } from "@/lib/sections";

function sectionFromProgress(progress: number): (typeof SECTIONS)[number]["id"] {
  const idx = Math.min(
    SECTIONS.length - 1,
    Math.floor(progress * SECTIONS.length),
  );
  return SECTIONS[idx].id;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const setReducedMotion = useScrollStore((s) => s.setReducedMotion);
  const tickerRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    setReducedMotion(reducedMotion);
  }, [reducedMotion, setReducedMotion]);

  useEffect(() => {
    document.documentElement.classList.add("lenis");

    let playhead = 0;
    let velocity = 0;
    let lastScrollProgress = 0;
    let syncing = false;
    let lastCommitted = -1;

    const FRICTION = 0.91;
    const IMPART = 0.5;

    const impart = (deltaProgress: number) => {
      if (reducedMotion || Math.abs(deltaProgress) < 1e-7) return;
      velocity += deltaProgress * IMPART;
    };

    const lenis = new Lenis({
      smoothWheel: false,
      syncTouch: false,
      content: document.body,
      virtualScroll: ({ deltaY, event }) => {
        if (reducedMotion) return true;
        const limit = lenis.limit;
        if (limit > 0) impart(deltaY / limit);
        if (event.cancelable) event.preventDefault();
        return false;
      },
    });

    setLenisInstance(lenis);

    registerVelocityControls({
      impart,
      getPlayhead: () => playhead,
      scrollToProgress: (progress: number) => {
        playhead = Math.max(0, Math.min(1, progress));
        velocity = 0;
        syncing = true;
        lenis.scrollTo(playhead * lenis.limit, { immediate: true, force: true });
        syncing = false;
        lastScrollProgress = playhead;
        lastCommitted = -1;
      },
    });

    const commit = () => {
      lastCommitted = playhead;
      const { setProgress, setActiveSection } = useScrollStore.getState();
      setProgress(playhead);
      setActiveSection(sectionFromProgress(playhead));
      (window as unknown as { __SCROLL_PROGRESS__: number }).__SCROLL_PROGRESS__ =
        playhead;
      (window as unknown as { __SCROLL_VELOCITY__: number }).__SCROLL_VELOCITY__ =
        velocity;
    };

    const syncLenisToPlayhead = () => {
      const limit = lenis.limit;
      if (limit <= 0) return;
      const targetPx = playhead * limit;
      if (Math.abs(lenis.scroll - targetPx) < 0.5) return;
      syncing = true;
      lenis.scrollTo(targetPx, { immediate: true, force: true });
      syncing = false;
      lastScrollProgress = playhead;
    };

    const onScroll = () => {
      if (syncing || reducedMotion) return;
      const limit = lenis.limit;
      const progress = limit > 0 ? lenis.scroll / limit : 0;
      const delta = progress - lastScrollProgress;
      impart(delta);
      lastScrollProgress = progress;
    };

    lenis.on("scroll", onScroll);

    const onKeyDown = (event: KeyboardEvent) => {
      if (reducedMotion) return;
      const limit = lenis.limit;
      if (limit <= 0) return;

      let deltaPx = 0;
      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          deltaPx = window.innerHeight * 0.85;
          break;
        case "ArrowUp":
        case "PageUp":
          deltaPx = -window.innerHeight * 0.85;
          break;
        case " ":
          deltaPx = event.shiftKey
            ? -window.innerHeight * 0.85
            : window.innerHeight * 0.85;
          break;
        case "Home":
          impart(-playhead);
          return;
        case "End":
          impart(1 - playhead);
          return;
        default:
          return;
      }

      event.preventDefault();
      impart(deltaPx / limit);
    };

    window.addEventListener("keydown", onKeyDown);

    let lastTime = performance.now();

    const step = (time: number) => {
      const dt = Math.min(48, time - lastTime);
      lastTime = time;

      lenis.raf(time);

      if (reducedMotion) {
        const limit = lenis.limit;
        playhead = limit > 0 ? lenis.scroll / limit : 0;
        velocity = 0;
        lastScrollProgress = playhead;
      } else {
        const frames = dt / (1000 / 60);
        velocity *= Math.pow(FRICTION, frames);
        playhead += velocity * frames;

        if (playhead <= 0) {
          playhead = 0;
          if (velocity < 0) velocity = 0;
        }
        if (playhead >= 1) {
          playhead = 1;
          if (velocity > 0) velocity = 0;
        }

        syncLenisToPlayhead();
      }

      if (
        Math.abs(playhead - lastCommitted) > 0.00012 ||
        Math.abs(velocity) > 0.00012 ||
        (Math.abs(velocity) <= 0.00012 && lastCommitted !== playhead)
      ) {
        commit();
      }
    };

    const ticker = (time: number) => step(time);
    tickerRef.current = ticker;
    requestAnimationFrame(function raf(time) {
      ticker(time);
      requestAnimationFrame(raf);
    });

    const refresh = () => {
      lenis.resize();
      if (reducedMotion) {
        onScroll();
        playhead = lastScrollProgress;
        velocity = 0;
        commit();
      } else {
        lastScrollProgress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      }
    };

    requestAnimationFrame(refresh);
    window.addEventListener("resize", refresh);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", refresh);
      ro.disconnect();
      document.documentElement.classList.remove("lenis");
      registerVelocityControls(null);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
