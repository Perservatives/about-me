"use client";

import { useEffect, useRef } from "react";
import { nearestLoadedIndex } from "@/lib/frameSequence";
import { useScrollStore } from "@/lib/store";

/**
 * Scroll-scrubbed image sequence drawn to a canvas.
 * Frames load progressively — the nearest ready frame is shown until the target arrives.
 */
export function NatureScrubFrames({
  frames,
  onFirst,
  onNeedFrame,
}: {
  frames: readonly (Blob | null)[];
  onFirst?: () => void;
  onNeedFrame?: (index: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cache = new Map<number, ImageBitmap>();
    const MAX_CACHE = 60;
    let raf = 0;
    let drawnIndex = -1;
    let decoding = false;
    let firstDone = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      drawnIndex = -1;
    };

    const drawCover = (bmp: ImageBitmap) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = bmp.width / bmp.height;
      const cr = cw / ch;
      let dw: number, dh: number, dx: number, dy: number;
      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
        dx = 0;
        dy = (ch - dh) / 2;
      } else {
        dh = ch;
        dw = ch * ir;
        dy = 0;
        dx = (cw - dw) / 2;
      }
      ctx.drawImage(bmp, dx, dy, dw, dh);
    };

    const show = async (index: number) => {
      const blob = frames[index];
      if (!blob) {
        onNeedFrame?.(index);
        const fallback = nearestLoadedIndex(frames, index);
        if (fallback >= 0 && fallback !== drawnIndex) {
          await show(fallback);
        }
        return;
      }

      const cached = cache.get(index);
      if (cached) {
        drawCover(cached);
        drawnIndex = index;
        if (!firstDone) {
          firstDone = true;
          onFirst?.();
        }
        return;
      }
      if (decoding) return;
      decoding = true;
      try {
        const bmp = await createImageBitmap(blob);
        cache.set(index, bmp);
        if (cache.size > MAX_CACHE) {
          const oldest = cache.keys().next().value as number | undefined;
          if (oldest !== undefined && oldest !== index) {
            cache.get(oldest)?.close();
            cache.delete(oldest);
          }
        }
        drawCover(bmp);
        drawnIndex = index;
        if (!firstDone) {
          firstDone = true;
          onFirst?.();
        }
      } catch {
        /* decode failed — skip this frame */
      }
      decoding = false;
    };

    const REEL_END = 0.92;
    const loop = () => {
      const p = useScrollStore.getState().progress;
      const reel = Math.min(1, p / REEL_END);
      const index = Math.min(
        frames.length - 1,
        Math.max(0, Math.round(reel * (frames.length - 1))),
      );
      if (index !== drawnIndex) show(index);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cache.forEach((b) => b.close());
      cache.clear();
    };
  }, [frames, onFirst, onNeedFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
