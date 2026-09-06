import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const routes = ["/", "/products", "/products/mantis-standard", "/products/mantis-pro", "/technology", "/applications", "/about", "/news", "/contact"];
const names = {"/":"home","/products":"products","/products/mantis-standard":"standard","/products/mantis-pro":"pro","/technology":"technology","/applications":"applications","/about":"about","/news":"news","/contact":"contact"};
const errors = [];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

async function inspect(pathname, viewport, label, capture = false) {
  const page = await browser.newPage({ viewport });
  page.on("console", message => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  for (const section of await page.locator("main > section").all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(30);
  }
  await page.evaluate(async () => Promise.all([...document.images].map(image => image.decode?.().catch(() => {}))));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(50);
  let screenshot = null;
  if (capture) {
    screenshot = join(out, `task007-${label}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
  }
  const metrics = await page.evaluate(() => ({
    path: location.pathname,
    title: document.title,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    h1: document.querySelector("h1")?.textContent.trim(),
    navActive: document.querySelector(".navbar__links .is-active")?.textContent.trim() ?? null,
    imageFailures: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
    unlabeledImages: [...document.images].filter(image => !image.alt).length,
    linksWithoutHref: [...document.querySelectorAll("a")].filter(link => !link.getAttribute("href")).length,
    buttonsWithoutName: [...document.querySelectorAll("button")].filter(button => !button.textContent.trim() && !button.getAttribute("aria-label")).length,
  }));
  await page.reload({ waitUntil: "networkidle" });
  metrics.refreshPath = new URL(page.url()).pathname;
  await page.close();
  return { screenshot, metrics };
}

const report = { baseUrl, routes: {}, mobile: {}, errors, interactions: {}, accessibility: {} };
for (const route of routes) report.routes[route] = await inspect(route, { width: 1440, height: 900 }, `${names[route]}-1440`, true);
report.mobile["/"] = await inspect("/", { width: 390, height: 844 }, "home-390", true);
for (const route of routes.slice(1)) report.mobile[route] = await inspect(route, { width: 390, height: 844 }, `${names[route]}-390`, false);

const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } });
await interaction.goto(baseUrl, { waitUntil: "networkidle" });
await interaction.getByRole("button", { name: "菜单" }).click();
await interaction.getByRole("link", { name: "产品", exact: true }).click();
await interaction.waitForLoadState("networkidle");
report.interactions.mobileNav = { path: new URL(interaction.url()).pathname, expanded: await interaction.locator(".navbar__menu-button").getAttribute("aria-expanded") };
await interaction.goto(baseUrl, { waitUntil: "networkidle" });
await interaction.getByRole("button", { name: "PRO", exact: true }).click();
await interaction.getByRole("link", { name: "了解 Pro" }).click();
await interaction.waitForLoadState("networkidle");
report.interactions.proHeroCta = new URL(interaction.url()).pathname;
await interaction.goto(`${baseUrl}/missing-page`, { waitUntil: "networkidle" });
report.interactions.notFound = { path: new URL(interaction.url()).pathname, h1: await interaction.locator("h1").textContent() };
await interaction.close();

const linkPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const routeLinks = {};
for (const route of routes) {
  await linkPage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  routeLinks[route] = await linkPage.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map(link => new URL(link.href).pathname))]);
}
await linkPage.goto(baseUrl, { waitUntil: "networkidle" });
await linkPage.locator(".site-footer").getByRole("link", { name: "News" }).click();
await linkPage.waitForLoadState("networkidle");
report.interactions.footerNews = new URL(linkPage.url()).pathname;
report.interactions.routeLinks = routeLinks;
report.interactions.allLinkTargetsKnown = Object.values(routeLinks).flat().every(path => routes.includes(path));
await linkPage.close();

report.accessibility = {
  noOverflowDesktop: Object.values(report.routes).every(x => x.metrics.scrollWidth === x.metrics.clientWidth),
  noOverflowMobile: Object.values(report.mobile).every(x => x.metrics.scrollWidth === x.metrics.clientWidth),
  noBrokenImages: [...Object.values(report.routes), ...Object.values(report.mobile)].every(x => x.metrics.imageFailures.length === 0),
  allImagesLabeled: [...Object.values(report.routes), ...Object.values(report.mobile)].every(x => x.metrics.unlabeledImages === 0),
  noUnnamedButtons: [...Object.values(report.routes), ...Object.values(report.mobile)].every(x => x.metrics.buttonsWithoutName === 0),
};

await writeFile(join(out, "task007-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
