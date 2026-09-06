import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];
const report = { baseUrl, routes: {}, navigation: {}, forms: {}, metadata: {}, performance: {}, accessibility: {}, errors };

await mkdir(out, { recursive: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
}

async function settleImages(page) {
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.scrollIntoView({ block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!image.complete) {
        await Promise.race([
          new Promise((resolve) => image.addEventListener("load", resolve, { once: true })),
          new Promise((resolve) => image.addEventListener("error", resolve, { once: true })),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
      }
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(80);
}

async function inspect(pathname, width, height = 800, screenshot) {
  const key = `${pathname}@${width}`;
  const page = await browser.newPage({ viewport: { width, height } });
  watch(page, key);
  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  await settleImages(page);
  if (screenshot) await page.screenshot({ path: join(out, screenshot), fullPage: true });
  report.routes[key] = await page.evaluate(() => ({
    statusPath: location.pathname,
    title: document.title,
    status: null,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1Count: document.querySelectorAll("h1").length,
    missingAlt: document.querySelectorAll("img:not([alt])").length,
    unnamedButtons: [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label")).length,
    brokenImages: [...document.images].filter(
      (image) => image.getClientRects().length > 0 && (!image.complete || !image.naturalWidth),
    ).length,
    internalStatusCount: document.querySelectorAll(".internal-status").length,
  }));
  report.routes[key].status = response?.status();
  await page.close();
}

const coreRoutes = [
  "/",
  "/products/mantis-standard",
  "/technology",
  "/applications",
  "/about",
  "/news",
  "/contact",
  "/support",
  "/support/documents",
  "/support/videos",
  "/inquiry",
];

const screenshotMap = new Map([
  ["/@1440", "task011-home-1440.png"],
  ["/support@1280", "task011-support-1280.png"],
  ["/products/mantis-standard@1024", "task011-standard-1024.png"],
  ["/inquiry@768", "task011-inquiry-768.png"],
]);

for (const width of [1280, 1024, 768, 390]) {
  for (const pathname of coreRoutes) {
    await inspect(pathname, width, width === 390 ? 844 : 800, screenshotMap.get(`${pathname}@${width}`));
  }
}
await inspect("/", 1440, 900, screenshotMap.get("/@1440"));

const heroPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await heroPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await heroPage.locator(".product-hero").screenshot({ path: join(out, "task011-home-hero-1440.png") });
await heroPage.close();

const navigation = await browser.newPage({ viewport: { width: 1280, height: 800 } });
watch(navigation, "navigation");
await navigation.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
const productTrigger = navigation.locator(".navbar__product-trigger");
const supportTrigger = navigation.locator(".navbar__support-trigger");
await productTrigger.hover();
await navigation.waitForTimeout(80);
const productMenuBox = await navigation.locator(".navbar__product-menu").boundingBox();
await supportTrigger.hover();
await navigation.waitForTimeout(80);
const supportMenuBox = await navigation.locator(".navbar__support-menu").boundingBox();
await navigation.screenshot({ path: join(out, "task011-dropdowns-1280.png") });
await supportTrigger.focus();
await navigation.keyboard.press("Enter");
await navigation.keyboard.press("Escape");
report.navigation.desktop = {
  productMenuBox,
  supportMenuBox,
  supportClosedAfterEscape: await supportTrigger.getAttribute("aria-expanded"),
  focusReturnedAfterEscape: await supportTrigger.evaluate((node) => node === document.activeElement),
};
await navigation.close();

const tablet = await browser.newPage({ viewport: { width: 768, height: 900 } });
await tablet.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
report.navigation.tablet = {
  menuButtonVisible: await tablet.locator(".navbar__menu-button").isVisible(),
  primaryNavigationVisible: await tablet.locator("#primary-navigation").isVisible(),
};
await tablet.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(mobile, "mobile-menu");
await mobile.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
await mobile.getByRole("button", { name: "菜单", exact: true }).click();
await mobile.locator(".navbar__support-trigger").click();
await mobile.screenshot({ path: join(out, "task011-menu-390.png") });
const supportRowHeight = await mobile.locator(".navbar__support-menu a").first().evaluate((node) => getComputedStyle(node).minHeight);
await mobile.locator(".navbar__support-trigger").click();
await mobile.locator(".navbar__product-trigger").click();
const productRowHeight = await mobile.locator(".navbar__product-rail button").first().evaluate((node) => getComputedStyle(node).minHeight);
report.navigation.mobile = { supportRowHeight, productRowHeight, overflow: await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth) };
await mobile.close();

const footer = await browser.newPage({ viewport: { width: 390, height: 844 } });
await footer.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
await footer.locator("footer").scrollIntoViewIfNeeded();
await footer.locator("footer").screenshot({ path: join(out, "task011-footer-390.png") });
report.navigation.footer = {
  columns: await footer.locator(".site-footer__links").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length),
  labels: await footer.locator("footer a").allTextContents(),
};
await footer.close();

const formPage = await browser.newPage({ viewport: { width: 768, height: 900 } });
await formPage.goto(`${baseUrl}/inquiry`, { waitUntil: "networkidle" });
for (const id of ["inquiry-name", "inquiry-company", "inquiry-phone"]) {
  await formPage.locator(`#${id}`).focus();
  await formPage.locator(`#${id}`).blur();
}
await formPage.locator("#inquiry-email").fill("invalid-email");
await formPage.locator("#inquiry-email").blur();
report.forms.inquiry = {
  errors: await formPage.locator(".pending-form__error").allTextContents(),
  phoneType: await formPage.locator("#inquiry-phone").getAttribute("type"),
  emailType: await formPage.locator("#inquiry-email").getAttribute("type"),
  minimumInputHeight: await formPage.locator("#inquiry-name").evaluate((node) => getComputedStyle(node).minHeight),
  submitDisabled: await formPage.locator('.pending-form button[type="submit"]').isDisabled(),
};
await formPage.close();

const metadataPage = await browser.newPage({ viewport: { width: 1200, height: 800 } });
for (const pathname of ["/", "/support", "/inquiry", "/policy/privacy"]) {
  await metadataPage.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  report.metadata[pathname] = await metadataPage.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogDescription: document.querySelector('meta[property="og:description"]')?.content,
    ogType: document.querySelector('meta[property="og:type"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
  }));
}
await metadataPage.close();

const performancePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const requests = [];
performancePage.on("requestfinished", (request) => requests.push(new URL(request.url()).pathname));
await performancePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await settleImages(performancePage);
report.performance.images = await performancePage.locator("img").evaluateAll((images) => images.map((image) => ({
  src: new URL(image.currentSrc || image.src, location.href).pathname,
  loading: image.loading,
  decoding: image.decoding,
  width: image.getAttribute("width"),
  height: image.getAttribute("height"),
  naturalWidth: image.naturalWidth,
  naturalHeight: image.naturalHeight,
})));
report.performance.duplicateRequests = Object.entries(requests.reduce((counts, pathname) => ({ ...counts, [pathname]: (counts[pathname] || 0) + 1 }), {})).filter(([, count]) => count > 1);
report.performance.proExposure = await performancePage.evaluate(() => ({
  text: /Mantis Pro|MANTIS PRO/.test(document.body.innerText),
  assets: [...document.images].some((image) => /p0000|mantis-pro|hero-pro/i.test(image.src)),
}));
await performancePage.close();

const reducedMotion = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
await reducedMotion.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await reducedMotion.locator(".navbar__product-trigger").hover();
report.accessibility.reducedMotion = await reducedMotion.evaluate(() => ({
  heroAnimation: getComputedStyle(document.querySelector(".product-hero__swap")).animationName,
  dropdownTransition: getComputedStyle(document.querySelector(".navbar__product-menu")).transitionDuration,
}));
await reducedMotion.close();

const notFound = await browser.newPage({ viewport: { width: 390, height: 844 } });
await notFound.goto(`${baseUrl}/task-011-not-found`, { waitUntil: "networkidle" });
report.accessibility.notFound = {
  title: await notFound.title(),
  h1: await notFound.locator("h1").textContent(),
  homeLink: await notFound.getByRole("link", { name: "返回首页" }).getAttribute("href"),
  overflow: await notFound.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
};
await notFound.close();

report.summary = {
  routeCount: Object.keys(report.routes).length,
  routesPass: Object.values(report.routes).every((route) => route.status === 200 && !route.overflow && route.h1Count === 1 && route.missingAlt === 0 && route.unnamedButtons === 0 && route.brokenImages === 0),
  noErrors: errors.length === 0,
  noProExposure: !report.performance.proExposure.text && !report.performance.proExposure.assets,
};

await writeFile(join(out, "task011-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report.summary, null, 2));
