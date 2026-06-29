export const FRAMES_DIR = "/assets/frames";

export function frameUrl(index: number, dir = FRAMES_DIR) {
  return `${dir}/f${String(index + 1).padStart(4, "0")}.jpg`;
}

export async function fetchInPool<T>(
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

/** Indices ordered by distance from a hot frame — used for scroll-aware prefetch. */
export function indicesByDistance(hot: number, count: number): number[] {
  const out: number[] = [];
  for (let d = 0; d < count; d++) {
    if (hot + d < count) out.push(hot + d);
    if (d > 0 && hot - d >= 0) out.push(hot - d);
  }
  return out;
}

export function reelFrameIndex(
  progress: number,
  frameCount: number,
  reelEnd = 0.92,
) {
  const reel = Math.min(1, progress / reelEnd);
  return Math.min(
    frameCount - 1,
    Math.max(0, Math.round(reel * (frameCount - 1))),
  );
}

export function isRangeLoaded(
  frames: readonly (Blob | null)[],
  endExclusive: number,
) {
  for (let i = 0; i < endExclusive; i++) {
    if (!frames[i]) return false;
  }
  return true;
}

/** Nearest loaded frame at or before index, else after. */
export function nearestLoadedIndex(
  frames: readonly (Blob | null)[],
  index: number,
) {
  if (frames[index]) return index;
  for (let d = 1; d < frames.length; d++) {
    const before = index - d;
    if (before >= 0 && frames[before]) return before;
    const after = index + d;
    if (after < frames.length && frames[after]) return after;
  }
  return -1;
}
