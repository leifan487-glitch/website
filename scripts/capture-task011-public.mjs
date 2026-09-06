import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];
const report = { baseUrl, routes: {}, navigation: {}, disabledRoutes: {}, errors };

await mkdir(out, { recursive: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
}

const publicRoutes = [
  "/",
  "/products/mantis-standard",
  "/technology",
  "/applications",
  "/about",
  "/news",
  "/contact",
  "/support",
  "/support/documents",
  "/support/service",
  "/inquiry",
  "/policy/privacy",
  "/policy/terms",
];

for (const pathname of publicRoutes) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  watch(page, pathname);
  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  report.routes[pathname] = await page.evaluate(() => ({
    status: document.querySelectorAll(".internal-status").length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    proText: /Mantis Pro|MANTIS PRO/.test(document.body.innerText),
    proAsset: [...document.images].some((image) => /p0000|mantis-pro|hero-pro/i.test(image.src)),
  }));
  report.routes[pathname].httpStatus = response?.status();
  await page.close();
}

const support = await browser.newPage({ viewport: { width: 1280, height: 800 } });
watch(support, "support-navigation");
await support.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
await support.locator(".navbar__support-trigger").hover();
report.navigation = {
  navbarHrefs: await support.locator(".navbar__support-menu a").evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  overviewHrefs: await support.locator(".support-directory nav a").evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  footerHrefs: await support.locator("footer a").evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
};
await support.screenshot({ path: join(out, "task011-public-support-1280.png"), fullPage: true });
await support.close();

for (const pathname of ["/support/downloads", "/support/videos", "/support/knowledge"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  watch(page, pathname);
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  report.disabledRoutes[pathname] = {
    heading: await page.locator(".empty-state h2").textContent(),
    isNotFound: await page.locator(".not-found").count(),
    internalStatusCount: await page.locator(".internal-status").count(),
  };
  await page.close();
}

const hiddenPaths = ["/support/downloads", "/support/videos", "/support/knowledge"];
report.summary = {
  routeCount: publicRoutes.length,
  internalStatusHidden: Object.values(report.routes).every((route) => route.status === 0),
  noOverflow: Object.values(report.routes).every((route) => !route.overflow),
  noProExposure: Object.values(report.routes).every((route) => !route.proText && !route.proAsset),
  hiddenFromNavigation: hiddenPaths.every(
    (path) =>
      !report.navigation.navbarHrefs.includes(path) &&
      !report.navigation.overviewHrefs.includes(path) &&
      !report.navigation.footerHrefs.includes(path),
  ),
  disabledRoutesUseEmptyState: Object.values(report.disabledRoutes).every(
    (route) => route.heading === "该内容暂未开放" && route.isNotFound === 0 && route.internalStatusCount === 0,
  ),
  noErrors: errors.length === 0,
};

await writeFile(join(out, "task011-public-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report.summary, null, 2));
