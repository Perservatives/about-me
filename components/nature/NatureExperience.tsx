"use client";

import { useEffect, useState } from "react";
import { NatureScrubFrames } from "./NatureScrubFrames";
import { NatureText } from "./NatureText";
import { Preloader } from "./Preloader";
import { Nav } from "@/components/ui/Nav";
import { ScrollHint } from "@/components/ui/ScrollHint";
import { prefetchGithubRepos } from "@/hooks/useGithubRepos";
import { GITHUB_USERNAME } from "@/lib/sections";

/** Relaxed scrub length — taller track = slower, calmer scrubbing of the reel. */
const SCROLL_VH = 5600;
const FRAMES_DIR = "/assets/frames";

async function fetchInPool<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let i = 0;
  const run = async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  };
  await Promise.all(Array.from({ length: limit }, run));
}

export function NatureExperience() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [frames, setFrames] = useState<Blob[] | null>(null);
  const [firstPainted, setFirstPainted] = useState(false);

  // Preload the full frame sequence so scrubbing never waits on the network.
  useEffect(() => {
    prefetchGithubRepos(GITHUB_USERNAME, 3);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const manifest = await (await fetch(`${FRAMES_DIR}/manifest.json`)).json();
        const count: number = manifest.count;
        const urls = Array.from(
          { length: count },
          (_, i) => `${FRAMES_DIR}/f${String(i + 1).padStart(4, "0")}.jpg`,
        );
        const blobs = new Array<Blob>(count);
        let done = 0;
        await fetchInPool(urls, 16, async (url, idx) => {
          const res = await fetch(url);
          blobs[idx] = await res.blob();
          done += 1;
          if (!cancelled) setLoadProgress(Math.min(0.99, done / count));
        });
        if (!cancelled) {
          setFrames(blobs);
          setLoadProgress(1);
        }
      } catch {
        if (!cancelled) setLoadProgress(1);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07120c]">
        {frames && (
          <NatureScrubFrames
            frames={frames}
            onFirst={() => setFirstPainted(true)}
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

      <Preloader progress={loadProgress} done={loadProgress >= 1 && firstPainted} />
    </>
  );
}
