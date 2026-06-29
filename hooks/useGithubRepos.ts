import { useEffect, useSyncExternalStore } from "react";

export type GithubRepo = {
  id: number;
  name: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  pushedAt: string;
};

export type RepoState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; repos: GithubRepo[] };

type ApiRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

type CacheEntry = {
  state: RepoState;
  listeners: Set<() => void>;
  inflight: AbortController | null;
};

const caches = new Map<string, CacheEntry>();

function getEntry(username: string, limit: number): CacheEntry {
  const key = `${username}:${limit}`;
  let entry = caches.get(key);
  if (!entry) {
    entry = { state: { status: "loading" }, listeners: new Set(), inflight: null };
    caches.set(key, entry);
  }
  return entry;
}

function notify(entry: CacheEntry) {
  for (const listener of entry.listeners) listener();
}

function parseRepos(raw: ApiRepo[], limit: number): GithubRepo[] {
  return raw
    .filter((r) => !r.archived && !r.fork)
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      name: r.name,
      htmlUrl: r.html_url,
      description: r.description,
      language: r.language,
      pushedAt: r.pushed_at,
    }));
}

export function prefetchGithubRepos(username: string, limit = 3): void {
  const entry = getEntry(username, limit);
  if (entry.state.status === "ready" || entry.inflight) return;

  const ctrl = new AbortController();
  entry.inflight = ctrl;

  fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { signal: ctrl.signal },
  )
    .then(async (res) => {
      if (!res.ok) {
        const reason = res.status === 403 ? "rate-limited" : `HTTP ${res.status}`;
        throw new Error(reason);
      }
      const raw = (await res.json()) as ApiRepo[];
      entry.state = { status: "ready", repos: parseRepos(raw, limit) };
      notify(entry);
    })
    .catch((err: unknown) => {
      if (ctrl.signal.aborted) return;
      entry.state = {
        status: "error",
        message: err instanceof Error ? err.message : "unknown error",
      };
      notify(entry);
    })
    .finally(() => {
      if (entry.inflight === ctrl) entry.inflight = null;
    });
}

export function useGithubRepos(username: string, limit = 3): RepoState {
  const entry = getEntry(username, limit);

  const state = useSyncExternalStore(
    (onStoreChange) => {
      entry.listeners.add(onStoreChange);
      return () => entry.listeners.delete(onStoreChange);
    },
    () => entry.state,
    () => entry.state,
  );

  useEffect(() => {
    prefetchGithubRepos(username, limit);
  }, [username, limit]);

  return state;
}

export function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const sec = Math.max(0, (Date.now() - then) / 1000);
  if (sec < 45) return "just now";
  const min = sec / 60;
  if (min < 45) return `${Math.round(min)}m ago`;
  const hr = min / 60;
  if (hr < 24) return `${Math.round(hr)}h ago`;
  const day = hr / 24;
  if (day < 14) return `${Math.round(day)}d ago`;
  const wk = day / 7;
  if (wk < 8) return `${Math.round(wk)}w ago`;
  const mo = day / 30;
  if (mo < 18) return `${Math.round(mo)}mo ago`;
  return `${Math.round(day / 365)}y ago`;
}
