import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4174";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/task012/", import.meta.url));
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];
const report = { mode: "internal", baseUrl, viewports: {}, errors };
const expectedSections = ["product-top", "mantis", "standard", "modular", "capabilities", "development", "real-tasks", "product-applications", "specifications", "product-resources", "product-inquiry"];

async function settleImages(page) {
  await page.evaluate(async () => {
    const step = Math.max(500, Math.floor(innerHeight * .8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }
    for (const image of document.images) {
      if (!image.complete) await Promise.race([
        image.decode?.().catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    }
    document.activeElement?.blur?.();
    scrollTo(0, 0);
  });
  await page.waitForTimeout(100);
}

for (const viewport of [
  { width: 1440, height: 900, file: "standard-internal-1440-long.png" },
  { width: 1280, height: 800, file: "standard-internal-1280.png" },
  { width: 1024, height: 800, file: "standard-internal-1024.png" },
  { width: 768, height: 900, file: "standard-internal-768.png" },
  { width: 390, height: 844, file: "standard-internal-390-long.png" },
]) {
  const page = await browser.newPage({ viewport });
  const label = `${viewport.width}x${viewport.height}`;
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
  const response = await page.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".skip-link { display: none !important; }" });
  await settleImages(page);
  await page.screenshot({ path: join(out, viewport.file), fullPage: true });
  report.viewports[label] = await page.evaluate((expected) => ({
    httpPath: location.pathname,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    sections: [...document.querySelectorAll("main > section")].map((section) => section.id || section.className),
    expectedSectionsPresent: expected.every((id) => [...document.querySelectorAll("main > section")].some((section) => section.id === id || section.classList.contains(id))),
    h1Count: document.querySelectorAll("h1").length,
    h2Count: document.querySelectorAll("h2").length,
    internalStatusCount: document.querySelectorAll(".internal-status").length,
    tables: document.querySelectorAll("#specifications table").length,
    realTasksEmpty: /真实任务资料准备中/.test(document.querySelector("#real-tasks")?.innerText || ""),
    resourcesEmpty: /文档资料准备中/.test(document.querySelector("#product-resources")?.innerText || "") && /视频资料准备中/.test(document.querySelector("#product-resources")?.innerText || ""),
    inquiryHref: document.querySelector("#product-inquiry a")?.getAttribute("href"),
    internalConfigurationNamesVisible: /丐版|幼年|胚胎体|究极体|孩子王|DIY王|导览王|科研王|王中王/.test(document.body.innerText),
    proVisible: /Mantis Pro|MANTIS PRO/.test(document.body.innerText),
    brokenImages: [...document.images].filter((image) => image.getClientRects().length && (!image.complete || !image.naturalWidth)).length,
    brokenImageSources: [...document.images].filter((image) => image.getClientRects().length && (!image.complete || !image.naturalWidth)).map((image) => image.currentSrc || image.src),
  }), expectedSections);
  report.viewports[label].httpStatus = response?.status();
  await page.close();
}

for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } });
  await page.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".skip-link { display: none !important; }" });
  await settleImages(page);
  for (const id of ["modular", "capabilities", "development", "real-tasks", "product-applications", "specifications", "product-resources", "product-inquiry"]) {
    await page.locator(`#${id}`).screenshot({ path: join(out, `section-${id}-${width}.png`) });
  }
  await page.close();
}

report.summary = {
  viewportsPass: Object.values(report.viewports).every((item) => item.httpStatus === 200 && !item.overflow && item.expectedSectionsPresent && item.h1Count === 1 && item.brokenImages === 0),
  internalStatusOn: Object.values(report.viewports).every((item) => item.internalStatusCount > 0),
  specsVisibleInternally: Object.values(report.viewports).every((item) => item.tables > 0),
  realTasksEmpty: Object.values(report.viewports).every((item) => item.realTasksEmpty),
  resourcesEmpty: Object.values(report.viewports).every((item) => item.resourcesEmpty),
  internalNamesNotRendered: Object.values(report.viewports).every((item) => !item.internalConfigurationNamesVisible),
  noProExposure: Object.values(report.viewports).every((item) => !item.proVisible),
  noErrors: errors.length === 0,
};

await writeFile(join(out, "internal-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report.summary, null, 2));
