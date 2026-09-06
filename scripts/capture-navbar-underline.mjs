import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];
const states = [
  ["product", "/products/mantis-standard", ".navbar__product-trigger"],
  ["technology", "/technology", '.navbar__links > a[href="/technology"]'],
  ["applications", "/applications", '.navbar__links > a[href="/applications"]'],
  ["about", "/about", '.navbar__links > a[href="/about"]'],
  ["contact", "/contact", '.navbar__links > a[href="/contact"]'],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
const results = {};
for (const [name, route, selector] of states) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(220);
  const target = page.locator(selector);
  results[name] = await target.evaluate((node) => {
    const label = node.querySelector(".navbar__label");
    const labelRect = label.getBoundingClientRect();
    const line = getComputedStyle(label, "::after");
    return {
      labelLeft: Math.round(labelRect.left * 10) / 10,
      labelWidth: Math.round(labelRect.width * 10) / 10,
      lineLeft: Math.round((labelRect.left + Number.parseFloat(line.left)) * 10) / 10,
      lineWidth: Number.parseFloat(line.width),
      lineBottomOffset: line.bottom,
      lineTransform: line.transform,
    };
  });
  await page.screenshot({
    path: join(out, `task0092-nav-${name}.png`),
    clip: { x: 965, y: 20, width: 435, height: 55 },
  });
}

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(220);
await page.screenshot({ path: join(out, "task0092-home-1440.png") });
const productTrigger = page.locator(".navbar__product-trigger");
await productTrigger.hover();
await page.waitForTimeout(220);
await page.screenshot({ path: join(out, "task0092-product-hover-1440.png") });
const hoverExpanded = await productTrigger.getAttribute("aria-expanded");

const report = {
  baseUrl,
  viewport: { width: 1440, height: 900 },
  results,
  interactions: { hoverExpanded },
  errors,
  allLinesAligned: Object.values(results).every(
    (item) => Math.abs(item.labelLeft - item.lineLeft) < 0.1
      && Math.abs(item.labelWidth - item.lineWidth) < 0.1,
  ),
};

await writeFile(
  join(out, "task0092-navbar-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);
await browser.close();
console.log(JSON.stringify(report, null, 2));
