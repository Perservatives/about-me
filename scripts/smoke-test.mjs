/**
 * Smoke test — scroll-scrubbed nature frame sequence (canvas)
 */
import { chromium } from "playwright";

const URL = process.env.TEST_URL ?? "http://localhost:3000";
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(`PAGE: ${err.message}`));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });

// Wait for the canvas to exist and to have painted a first frame.
await page
  .waitForFunction(
    () => {
      const c = document.querySelector("canvas");
      if (!c || c.width < 2) return false;
      const ctx = c.getContext("2d");
      const px = ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data;
      return px[3] > 0 && px[0] + px[1] + px[2] > 0;
    },
    { timeout: 60000 },
  )
  .catch(() => {});

const sample = () =>
  page.evaluate(() => {
    const c = document.querySelector("canvas");
    const ctx = c && c.getContext("2d");
    const px = ctx
      ? ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data
      : [0, 0, 0, 0];
    return {
      scrollRoot: !!document.getElementById("scroll-root"),
      bodyHeight: document.body.scrollHeight,
      progress: window.__SCROLL_PROGRESS__ ?? 0,
      hasCanvas: !!c,
      canvasW: c ? c.width : 0,
      pixel: [px[0], px[1], px[2], px[3]],
    };
  });

const before = await sample();

await page.mouse.wheel(0, 6000);
await page.waitForTimeout(2200);

const after = await sample();

await browser.close();

const pixelChanged =
  before.pixel.join(",") !== after.pixel.join(",");

console.log(JSON.stringify({ before, after, pixelChanged, errors }, null, 2));

if (!before.scrollRoot || before.bodyHeight < 2000) {
  console.error("FAIL: scroll track missing");
  process.exit(1);
}
if (!before.hasCanvas || before.canvasW < 2) {
  console.error("FAIL: scrub canvas not mounted/painted");
  process.exit(1);
}
if ((after.progress ?? 0) < 0.05) {
  console.error("FAIL: scroll progress not advancing");
  process.exit(1);
}
if (!pixelChanged) {
  console.error("FAIL: canvas frame not changing with scroll");
  process.exit(1);
}
if (errors.some((e) => e.includes("GLTF") || e.includes("THREE"))) {
  console.error("FAIL: stray 3D errors");
  process.exit(1);
}

console.log("PASS");
