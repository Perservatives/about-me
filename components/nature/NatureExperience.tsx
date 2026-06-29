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
/** Opening scroll segment — load this range before revealing (still far less than the full reel). */
const INITIAL_BURST = 40;
const POOL_SIZE = 24;
const SETTLE_MS = 220;

export function NatureExperience() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [frames, setFrames] = useState<(Blob | null)[] | null>(null);
  const [firstPainted, setFirstPainted] = useState(false);
  const [initialReady, setInitialReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
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
      if (pending.length === 0) return Promise.resolve();
      return fetchInPool(pending, POOL_SIZE, async (idx) => loadOne(idx));
    };

    (async () => {
      try {
        const manifest = await (await fetch(`${FRAMES_DIR}/manifest.json`)).json();
        const count: number = manifest.count;
        frameCountRef.current = count;
        framesRef.current = new Array<Blob | null>(count).fill(null);

        const burstEnd = Math.min(INITIAL_BURST, count);
        const burstIndices = Array.from({ length: burstEnd }, (_, i) => i);

        const burstPromise = loadMany(burstIndices);

        while (!cancelled && !framesRef.current[0]) {
          await new Promise((resolve) => setTimeout(resolve, 16));
        }
        if (cancelled) return;

        try {
          const warmed = await createImageBitmap(framesRef.current[0]!);
          warmed.close();
        } catch {
          /* first frame decode failed — canvas will retry */
        }

        setFrames(framesRef.current);

        await burstPromise;
        if (!cancelled) setInitialReady(true);

        const remaining = Array.from({ length: count }, (_, i) => i).filter(
          (i) => i >= burstEnd,
        );
        await fetchInPool(remaining, POOL_SIZE, async (idx) => loadOne(idx));

        if (!cancelled) setLoadProgress(1);
      } catch {
        if (!cancelled) {
          setInitialReady(true);
          setLoadProgress(1);
        }
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

  useEffect(() => {
    if (!firstPainted || !initialReady) return;

    let cancelled = false;
    let timeoutId = 0;

    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) setRevealed(true);
        }, SETTLE_MS);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [firstPainted, initialReady]);

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
      <div
        className="transition-opacity duration-1000 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          pointerEvents: revealed ? undefined : "none",
        }}
        aria-hidden={!revealed}
      >
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07120c]">
          {frames && (
            <NatureScrubFrames
              frames={framesRef.current}
              onFirst={() => setFirstPainted(true)}
              onNeedFrame={requestFrame}
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/28" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_68%,rgba(0,0,0,0.2)_100%)]" />

          <NatureText />
        </div>

        <Nav />
        <ScrollHint />

        <div id="scroll-root" style={{ height: `${SCROLL_VH}vh` }} aria-hidden />
      </div>

      <Preloader progress={loadProgress} done={revealed} />
    </>
  );
}
