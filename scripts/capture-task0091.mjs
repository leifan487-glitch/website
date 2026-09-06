import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const mode = process.env.CAPTURE_MODE || "normal";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

async function capture(width, height, filename) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${filename}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${filename}: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: join(out, filename) });

  const metrics = await page.evaluate(() => {
    const copy = document.querySelector(".product-hero__copy")?.getBoundingClientRect();
    const cta = document.querySelector(".product-hero__cta")?.getBoundingClientRect();
    const media = document.querySelector(".product-hero__media")?.getBoundingClientRect();
    const image = document.querySelector(".product-hero__media img");
    const imageRect = image?.getBoundingClientRect();
    const imageStyle = image ? getComputedStyle(image) : null;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      internalStatusCount: document.querySelectorAll(".internal-status").length,
      brokenImages: [...document.images]
        .filter((item) => item.complete && !item.naturalWidth)
        .map((item) => item.src),
      currentSource: image?.currentSrc,
      copy: copy && { top: Math.round(copy.top), bottom: Math.round(copy.bottom) },
      cta: cta && { top: Math.round(cta.top), bottom: Math.round(cta.bottom) },
      media: media && { top: Math.round(media.top), bottom: Math.round(media.bottom) },
      image: imageRect && imageStyle && {
        top: Math.round(imageRect.top),
        bottom: Math.round(imageRect.bottom),
        width: Math.round(imageRect.width),
        height: Math.round(imageRect.height),
        fit: imageStyle.objectFit,
        position: imageStyle.objectPosition,
        transform: imageStyle.transform,
      },
    };
  });

  await page.close();
  return metrics;
}

const captures = mode === "status-off"
  ? [
      [390, 844, "task0091-status-off-390.png"],
    ]
  : [
      [390, 844, "task0091-after-390.png"],
      [430, 932, "task0091-after-430.png"],
      [1440, 900, "task0091-desktop-1440.png"],
      [1728, 900, "task0091-desktop-1728.png"],
    ];

const results = {};
for (const [width, height, filename] of captures) {
  results[filename] = await capture(width, height, filename);
}

const report = {
  baseUrl,
  mode,
  results,
  errors,
  summary: {
    noErrors: errors.length === 0,
    noOverflow: Object.values(results).every((item) => item.scrollWidth === item.clientWidth),
    noBrokenImages: Object.values(results).every((item) => item.brokenImages.length === 0),
  },
};

const reportName = mode === "status-off"
  ? "task0091-status-off-report.json"
  : "task0091-report.json";
await writeFile(join(out, reportName), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
