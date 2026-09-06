import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const publicRoutes = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/news", "/contact"];
const names = {"/":"home","/products/mantis-standard":"standard","/technology":"technology","/applications":"applications","/about":"about","/news":"news","/contact":"contact"};
const errors = [];
const exposurePattern = /Mantis Pro|MANTIS PRO|P0000[1-5]|了解 Pro/i;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

async function inspect(pathname, viewport, label, capture = false) {
  const page = await browser.newPage({ viewport });
  page.on("console", message => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  for (const section of await page.locator("main > section").all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(25);
  }
  await page.evaluate(async () => Promise.all([...document.images].map(image => image.decode?.().catch(() => {}))));
  await page.evaluate(() => window.scrollTo(0, 0));
  let screenshot = null;
  if (capture) {
    screenshot = join(out, `task008-${label}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
  }
  const metrics = await page.evaluate(() => ({
    path: location.pathname,
    title: document.title,
    bodyText: document.body.innerText,
    imageSources: [...document.images].map(image => image.currentSrc || image.src),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    imageFailures: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
    unlabeledImages: [...document.images].filter(image => !image.alt).length,
    selectorCount: document.querySelectorAll(".product-hero__selector").length,
    heroMedia: (() => {
      const media = document.querySelector(".product-hero__media");
      const image = media?.querySelector("img");
      if (!media || !image) return null;
      const nav = document.querySelector(".navbar")?.getBoundingClientRect();
      const box = media.getBoundingClientRect();
      const style = getComputedStyle(image);
      return { top: Math.round(box.top), navBottom: Math.round(nav?.bottom ?? 0), safeGap: Math.round(box.top - (nav?.bottom ?? 0)), fit: style.objectFit, position: style.objectPosition, transform: style.transform };
    })(),
  }));
  metrics.proExposure = exposurePattern.test(metrics.bodyText) || metrics.imageSources.some(src => /pro-|p0000/i.test(src));
  delete metrics.bodyText;
  await page.reload({ waitUntil: "networkidle" });
  metrics.refreshPath = new URL(page.url()).pathname;
  await page.close();
  return { screenshot, metrics };
}

const report = { baseUrl, routes: {}, mobile: {}, wide: {}, redirects: {}, interactions: {}, errors };
for (const route of publicRoutes) report.routes[route] = await inspect(route, { width: 1440, height: 900 }, `${names[route]}-1440`, true);
report.mobile["/"] = await inspect("/", { width: 390, height: 844 }, "home-390", true);
for (const route of publicRoutes.slice(1)) report.mobile[route] = await inspect(route, { width: 390, height: 844 }, `${names[route]}-390`);
report.wide["/"] = await inspect("/", { width: 1728, height: 900 }, "home-1728");

for (const route of ["/products", "/products/mantis-pro"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  report.redirects[route] = new URL(page.url()).pathname;
  await page.close();
}

const navPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await navPage.goto(baseUrl, { waitUntil: "networkidle" });
await navPage.getByRole("button", { name: "菜单" }).click();
await navPage.getByRole("link", { name: "产品", exact: true }).click();
await navPage.waitForLoadState("networkidle");
report.interactions.mobileProductNav = { path: new URL(navPage.url()).pathname, expanded: await navPage.locator(".navbar__menu-button").getAttribute("aria-expanded") };
await navPage.goto(baseUrl, { waitUntil: "networkidle" });
await navPage.locator(".site-footer").getByRole("link", { name: "Products" }).click();
await navPage.waitForLoadState("networkidle");
report.interactions.footerProducts = new URL(navPage.url()).pathname;
await navPage.goto(`${baseUrl}/missing-page`, { waitUntil: "networkidle" });
report.interactions.notFound = { path: new URL(navPage.url()).pathname, h1: await navPage.locator("h1").textContent() };
await navPage.close();

report.summary = {
  noProExposure: [...Object.values(report.routes), ...Object.values(report.mobile), ...Object.values(report.wide)].every(item => !item.metrics.proExposure),
  noSelector: [...Object.values(report.routes), ...Object.values(report.mobile), ...Object.values(report.wide)].every(item => item.metrics.selectorCount === 0),
  noOverflow: [...Object.values(report.routes), ...Object.values(report.mobile), ...Object.values(report.wide)].every(item => item.metrics.scrollWidth === item.metrics.clientWidth),
  noBrokenImages: [...Object.values(report.routes), ...Object.values(report.mobile), ...Object.values(report.wide)].every(item => item.metrics.imageFailures.length === 0),
  allImagesLabeled: [...Object.values(report.routes), ...Object.values(report.mobile), ...Object.values(report.wide)].every(item => item.metrics.unlabeledImages === 0),
  consoleAndPageErrors: errors.length,
};

await writeFile(join(out, "task008-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
