import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

await mkdir(out, { recursive: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
}

async function inspectRoute(pathname, title, viewport = { width: 1440, height: 900 }, screenshot) {
  const page = await browser.newPage({ viewport });
  watch(page, pathname);
  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(150);
  if (screenshot) await page.screenshot({ path: join(out, screenshot), fullPage: true });
  const result = await page.evaluate(() => ({
    title: document.title,
    notFound: Boolean(document.querySelector(".not-found")),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).length,
    main: Boolean(document.querySelector("#main-content")),
    emptyState: Boolean(document.querySelector(".resource-empty")),
  }));
  result.status = response?.status();
  result.expectedTitle = title;
  await page.close();
  return result;
}

const routes = {
  "/support": "Support | Blue Worm",
  "/support/documents": "Documents | Blue Worm",
  "/support/downloads": "Downloads | Blue Worm",
  "/support/videos": "Videos | Blue Worm",
  "/support/service": "After-sales | Blue Worm",
  "/support/knowledge": "Knowledge Base | Blue Worm",
  "/inquiry": "Inquiry | Blue Worm",
  "/policy/privacy": "Privacy | Blue Worm",
  "/policy/terms": "Terms | Blue Worm",
};

const report = { baseUrl, routes: {}, navigation: {}, forms: {}, errors };
const screenshots = {
  "/support": "task010-support-1440.png",
  "/support/documents": "task010-documents-1440.png",
  "/support/videos": "task010-videos-1440.png",
  "/inquiry": "task010-inquiry-1440.png",
};

for (const [pathname, title] of Object.entries(routes)) {
  report.routes[pathname] = await inspectRoute(pathname, title, { width: 1440, height: 900 }, screenshots[pathname]);
}

report.routes["/support@390"] = await inspectRoute("/support", routes["/support"], { width: 390, height: 844 }, "task010-support-390.png");
report.routes["/inquiry@390"] = await inspectRoute("/inquiry", routes["/inquiry"], { width: 390, height: 844 }, "task010-inquiry-390.png");

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(desktop, "desktop-navigation");
await desktop.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
const supportTrigger = desktop.locator(".navbar__support-trigger");
await supportTrigger.hover();
await desktop.waitForTimeout(100);
const triggerBox = await supportTrigger.boundingBox();
const menu = desktop.locator(".navbar__support-menu");
const menuBox = await menu.boundingBox();
await desktop.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
await desktop.mouse.move(menuBox.x + menuBox.width / 2, menuBox.y + 24, { steps: 10 });
await desktop.waitForTimeout(260);
await desktop.screenshot({ path: join(out, "task010-support-dropdown-1440.png") });
report.navigation.desktopSupport = {
  expanded: await supportTrigger.getAttribute("aria-expanded"),
  visible: await menu.isVisible(),
  linkCount: await menu.locator("a").count(),
};
await desktop.keyboard.press("Escape");
report.navigation.desktopEscapeClosed = await supportTrigger.getAttribute("aria-expanded");
await desktop.locator("footer").scrollIntoViewIfNeeded();
await desktop.locator("footer").screenshot({ path: join(out, "task010-footer-1440.png") });
report.navigation.footerLinks = await desktop.locator("footer a").count();
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(mobile, "mobile-navigation");
await mobile.goto(`${baseUrl}/support`, { waitUntil: "networkidle" });
await mobile.getByRole("button", { name: "菜单", exact: true }).click();
await mobile.locator(".navbar__support-trigger").click();
await mobile.screenshot({ path: join(out, "task010-support-accordion-390.png") });
report.navigation.mobileSupport = {
  expanded: await mobile.locator(".navbar__support-trigger").getAttribute("aria-expanded"),
  visible: await mobile.locator(".navbar__support-menu").isVisible(),
};
await mobile.locator(".navbar__support-menu").getByRole("link", { name: "文档中心", exact: true }).click();
await mobile.waitForLoadState("networkidle");
report.navigation.mobileChildNavigation = {
  pathname: new URL(mobile.url()).pathname,
  menuExpanded: await mobile.getByRole("button", { name: "菜单", exact: true }).getAttribute("aria-expanded"),
};
await mobile.close();

const inquiry = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(inquiry, "inquiry-validation");
await inquiry.goto(`${baseUrl}/inquiry`, { waitUntil: "networkidle" });
for (const id of ["inquiry-name", "inquiry-company", "inquiry-phone"]) {
  await inquiry.locator(`#${id}`).focus();
  await inquiry.locator(`#${id}`).blur();
}
await inquiry.locator("#inquiry-email").fill("invalid-email");
await inquiry.locator("#inquiry-email").blur();
report.forms.inquiry = {
  errors: await inquiry.locator(".pending-form__error").allTextContents(),
  submitDisabled: await inquiry.locator('.pending-form button[type="submit"]').isDisabled(),
  product: await inquiry.locator("#inquiry-product").inputValue(),
  productReadOnly: await inquiry.locator("#inquiry-product").getAttribute("readonly"),
};
await inquiry.close();

const knownLinks = new Set();
for (const pathname of ["/support", "/support/documents", "/inquiry", "/policy/privacy"]) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  for (const href of await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) knownLinks.add(href);
  await page.close();
}
report.navigation.deadLinks = [];
for (const href of knownLinks) {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto(`${baseUrl}${href}`, { waitUntil: "networkidle" });
  if (await page.locator(".not-found").count()) report.navigation.deadLinks.push(href);
  await page.close();
}

const notFound = await browser.newPage({ viewport: { width: 1200, height: 800 } });
await notFound.goto(`${baseUrl}/task-010-unknown-route`, { waitUntil: "networkidle" });
report.notFound = {
  rendered: Boolean(await notFound.locator(".not-found").count()),
  title: await notFound.title(),
};
await notFound.close();

report.summary = {
  routesPass: Object.values(report.routes).every((route) => route.status === 200 && route.title === route.expectedTitle && !route.notFound && !route.overflow && route.brokenImages === 0 && route.main),
  noDeadLinks: report.navigation.deadLinks.length === 0,
  noErrors: errors.length === 0,
  emptyCenters: ["/support/documents", "/support/downloads", "/support/videos", "/support/knowledge"].every((route) => report.routes[route].emptyState),
};

await writeFile(join(out, "task010-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
