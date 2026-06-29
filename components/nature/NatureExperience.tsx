"use client";

import { useEffect, useRef, useState } from "react";
import { NatureScrubFrames } from "./NatureScrubFrames";
import { NatureText } from "./NatureText";
import { Preloader } from "./Preloader";
import { Nav } from "@/components/ui/Nav";
import { ScrollHint } from "@/components/ui/ScrollHint";
import { prefetchGithubRepos } from "@/hooks/useGithubRepos";
import {
  fetchInPool,
  frameUrl,
  FRAMES_DIR,
  indicesByDistance,
  reelFrameIndex,
} from "@/lib/frameSequence";
import { GITHUB_USERNAME } from "@/lib/sections";
import { useScrollStore } from "@/lib/store";

/** Relaxed scrub length — taller track = slower, calmer scrubbing of the reel. */
const SCROLL_VH = 5600;
const INITIAL_BURST = 48;
const POOL_SIZE = 20;

export function NatureExperience() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [frames, setFrames] = useState<(Blob | null)[] | null>(null);
  const [firstPainted, setFirstPainted] = useState(false);
  const framesRef = useRef<(Blob | null)[]>([]);
  const loadingRef = useRef<Set<number>>(new Set());
  const frameCountRef = useRef(0);

  useEffect(() => {
    prefetchGithubRepos(GITHUB_USERNAME, 3);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadOne = async (idx: number) => {
      if (cancelled || framesRef.current[idx] || loadingRef.current.has(idx)) {
        return;
      }
      loadingRef.current.add(idx);
      try {
        const res = await fetch(frameUrl(idx));
        if (!res.ok) return;
        framesRef.current[idx] = await res.blob();
        const loaded = framesRef.current.filter(Boolean).length;
        const total = frameCountRef.current;
        if (!cancelled && total > 0) {
          setLoadProgress(Math.min(0.99, loaded / total));
        }
      } finally {
        loadingRef.current.delete(idx);
      }
    };

    const loadMany = (indices: number[]) => {
      const pending = indices.filter(
        (idx) => !framesRef.current[idx] && !loadingRef.current.has(idx),
      );
      if (pending.length === 0) return;
      void fetchInPool(pending, POOL_SIZE, async (idx) => loadOne(idx));
    };

    (async () => {
      try {
        const manifest = await (await fetch(`${FRAMES_DIR}/manifest.json`)).json();
        const count: number = manifest.count;
        frameCountRef.current = count;
        framesRef.current = new Array<Blob | null>(count).fill(null);

        await loadOne(0);
        if (cancelled) return;

        setFrames(framesRef.current);
        loadMany(Array.from({ length: Math.min(INITIAL_BURST, count) }, (_, i) => i));

        const remaining = Array.from({ length: count }, (_, i) => i).filter(
          (i) => i >= INITIAL_BURST,
        );
        await fetchInPool(remaining, POOL_SIZE, async (idx) => loadOne(idx));

        if (!cancelled) setLoadProgress(1);
      } catch {
        if (!cancelled) setLoadProgress(1);
      }
    })();

    const unsub = useScrollStore.subscribe((state, prev) => {
      if (state.progress === prev.progress) return;
      const count = frameCountRef.current;
      if (count === 0) return;
      const hot = reelFrameIndex(state.progress, count);
      loadMany(indicesByDistance(hot, 24).slice(0, 24));
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const requestFrame = (index: number) => {
    if (
      index < 0 ||
      index >= framesRef.current.length ||
      framesRef.current[index] ||
      loadingRef.current.has(index)
    ) {
      return;
    }
    void (async () => {
      loadingRef.current.add(index);
      try {
        const res = await fetch(frameUrl(index));
        if (!res.ok) return;
        framesRef.current[index] = await res.blob();
        const loaded = framesRef.current.filter(Boolean).length;
        setLoadProgress(Math.min(0.99, loaded / frameCountRef.current));
      } finally {
        loadingRef.current.delete(index);
      }
    })();
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07120c]">
        {frames && (
          <NatureScrubFrames
            frames={framesRef.current}
            onFirst={() => setFirstPainted(true)}
            onNeedFrame={requestFrame}
          />
        )}

        {/* Minimal scrims only where text sits — kept light so the footage stays vivid and crisp */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/28" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_68%,rgba(0,0,0,0.2)_100%)]" />

        <NatureText />
      </div>

      <Nav />
      <ScrollHint />

      <div id="scroll-root" style={{ height: `${SCROLL_VH}vh` }} aria-hidden />

      <Preloader progress={loadProgress} done={firstPainted} />
    </>
  );
}
