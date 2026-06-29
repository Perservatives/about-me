# about-me

Scroll-driven portfolio for [Dustin Du](https://github.com/Perservatives).

Scrub through a nature reel while text panels introduce stack, bio, latest GitHub repos, and contact info.

## Stack

- Next.js (App Router)
- Lenis scroll + velocity playhead
- Canvas image-sequence scrubber (preloaded JPEG frames)
- Tailwind CSS

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run build` — production build
- `npm run test:smoke` — Playwright smoke test (dev server on :3000)
- `npm run validate-assets` — check frame manifest + JPEG sequence

## Assets

Frame JPEGs live in `public/assets/frames/` (~129MB). First visit preloads the sequence; a progress bar covers load time.

## Deploy (Vercel)

1. Import the GitHub repo — framework should auto-detect **Next.js**.
2. In **Project Settings → Build & Development Settings**, clear any overrides:
   - **Output Directory** must be **empty** (not `dist` from the old Vite site).
   - **Build Command** should be `next build` or empty (default).
3. Node **20+** (see `.nvmrc`).

Static assets in `public/assets/frames/` must deploy with the build (~129MB of JPEGs).
