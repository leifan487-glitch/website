import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/task011-before/", import.meta.url));
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];
const report = { baseUrl, captures: {}, errors };

await mkdir(out, { recursive: true });

async function capture(name, pathname, viewport, setup) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${name}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${name}: ${error.message}`));
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  if (setup) await setup(page);
  await page.waitForTimeout(120);
  const path = join(out, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  report.captures[name] = await page.evaluate(() => ({
    pathname: location.pathname,
    title: document.title,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).length,
    h1: [...document.querySelectorAll("h1")].map((node) => node.textContent.trim()),
  }));
  await page.close();
}

await capture("01-home-1440", "/", { width: 1440, height: 900 });
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.locator(".product-hero").screenshot({ path: join(out, "01-home-hero-1440.png") });
  await page.close();
}
await capture("02-support-1280", "/support", { width: 1280, height: 800 });
await capture("03-standard-1024", "/products/mantis-standard", { width: 1024, height: 768 });
await capture("04-inquiry-768", "/inquiry", { width: 768, height: 900 });
await capture("05-menu-390", "/support", { width: 390, height: 844 }, async (page) => {
  await page.getByRole("button", { name: "菜单", exact: true }).click();
  await page.locator(".navbar__support-trigger").click();
});
await capture("06-footer-390", "/support", { width: 390, height: 844 }, async (page) => {
  await page.locator("footer").scrollIntoViewIfNeeded();
});

await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
