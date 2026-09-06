import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
}

async function ready(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".product-hero__media img").evaluate((image) => image.decode());
  for (const section of await page.locator("main > section").all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(750);
}

async function pageMetrics(page) {
  return page.evaluate(() => {
    const heroImage = document.querySelector(".product-hero__media img");
    const nav = document.querySelector(".navbar");
    const identity = document.querySelector(".product-hero__identity");
    const style = heroImage && getComputedStyle(heroImage);
    const navStyle = nav && getComputedStyle(nav);
    const identityRect = identity?.getBoundingClientRect();
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      currentHeroAsset: heroImage?.currentSrc,
      heroNaturalSize: heroImage && [heroImage.naturalWidth, heroImage.naturalHeight],
      heroFit: style?.objectFit,
      heroPosition: style?.objectPosition,
      heroTransform: style?.transform,
      navBackground: navStyle?.backgroundImage,
      navBackdrop: navStyle?.backdropFilter || navStyle?.webkitBackdropFilter,
      identityRect: identityRect && {
        width: identityRect.width,
        height: identityRect.height,
      },
      brokenImages: [...document.images]
        .filter((image) => !image.complete || !image.naturalWidth)
        .map((image) => image.currentSrc || image.src),
    };
  });
}

async function captureHome(viewport, filename) {
  const page = await browser.newPage({ viewport });
  watch(page, filename);
  await ready(page);
  await page.screenshot({ path: join(out, filename) });
  const metrics = await pageMetrics(page);
  await page.close();
  return metrics;
}

const report = {
  baseUrl,
  screenshots: {},
  dropdown: {},
  mobile: {},
  errors,
};

report.screenshots.desktop1440 = await captureHome(
  { width: 1440, height: 900 },
  "task0093-home-1440.png",
);
report.screenshots.desktop1728 = await captureHome(
  { width: 1728, height: 900 },
  "task0093-home-1728.png",
);
report.screenshots.mobile390 = await captureHome(
  { width: 390, height: 844 },
  "task0093-home-390.png",
);

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(desktop, "desktop-dropdown");
await ready(desktop);
await desktop.locator(".navbar__product-trigger").hover();
await desktop.locator(".navbar__product-card img").evaluate((image) => image.decode());
await desktop.waitForTimeout(250);
await desktop.screenshot({ path: join(out, "task0093-dropdown-standard-1440.png") });
report.dropdown.standard = {
  expanded: await desktop.locator(".navbar__product-trigger").getAttribute("aria-expanded"),
  standardSelected: await desktop.getByRole("tab", { name: "Standard" }).getAttribute("aria-selected"),
  cardVisible: await desktop.locator(".navbar__product-card").isVisible(),
};
await desktop.getByRole("tab", { name: "敬请期待" }).hover();
await desktop.waitForTimeout(200);
await desktop.screenshot({ path: join(out, "task0093-dropdown-upcoming-1440.png") });
report.dropdown.upcoming = {
  selected: await desktop.getByRole("tab", { name: "敬请期待" }).getAttribute("aria-selected"),
  panelVisible: await desktop.locator(".navbar__upcoming-panel").isVisible(),
};
await desktop.keyboard.press("Escape");
await desktop.waitForTimeout(50);
report.dropdown.escapeClosed = await desktop.locator(".navbar__product-trigger").getAttribute("aria-expanded");
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(mobile, "mobile-menu");
await ready(mobile);
await mobile.getByRole("button", { name: "菜单", exact: true }).click();
await mobile.locator(".navbar__product-trigger").click();
await mobile.screenshot({ path: join(out, "task0093-mobile-product-standard-390.png") });
await mobile.getByRole("tab", { name: "敬请期待" }).click();
await mobile.screenshot({ path: join(out, "task0093-mobile-product-upcoming-390.png") });
report.mobile = {
  overflow: await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
  upcomingSelected: await mobile.getByRole("tab", { name: "敬请期待" }).getAttribute("aria-selected"),
  brokenImages: await mobile.evaluate(() => [...document.images].filter((image) => !image.complete || !image.naturalWidth).length),
};
await mobile.close();

report.summary = {
  noErrors: errors.length === 0,
  noOverflow: Object.values(report.screenshots).every((item) => item.scrollWidth === item.clientWidth)
    && !report.mobile.overflow,
  noBrokenImages: Object.values(report.screenshots).every((item) => item.brokenImages.length === 0)
    && report.mobile.brokenImages === 0,
};

await writeFile(join(out, "task0093-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
