import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4175";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/task012/", import.meta.url));
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];
const report = { mode: "public", baseUrl, viewports: {}, errors };

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
  { width: 1440, height: 900, file: "standard-public-1440-long.png" },
  { width: 1024, height: 800, file: null },
  { width: 768, height: 900, file: null },
  { width: 390, height: 844, file: "standard-public-390.png" },
]) {
  const page = await browser.newPage({ viewport });
  const label = `${viewport.width}x${viewport.height}`;
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
  const response = await page.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".skip-link { display: none !important; }" });
  await settleImages(page);
  if (viewport.file) await page.screenshot({ path: join(out, viewport.file), fullPage: true });
  report.viewports[label] = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const resources = document.querySelector("#product-resources")?.innerText || "";
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      internalStatusCount: document.querySelectorAll(".internal-status").length,
      specificationTables: document.querySelectorAll("#specifications table").length,
      specificationsSafeEmpty: /参数信息待确认/.test(document.querySelector("#specifications")?.innerText || ""),
      unapprovedValuesVisible: /633 × 552 × 1300|3\s*m\/s|5\s*m\/s|22\s*DoF|7\s*kg|10\s*ms/.test(bodyText),
      internalConfigurationNamesVisible: /丐版|幼年|胚胎体|究极体|孩子王|DIY王|导览王|科研王|王中王/.test(bodyText),
      priceWarrantyVisible: /9800|15800|99800|质保/.test(bodyText),
      proVisible: /Mantis Pro|MANTIS PRO/.test(bodyText),
      realTasksEmpty: /真实任务资料准备中/.test(document.querySelector("#real-tasks")?.innerText || ""),
      documentsEmpty: /文档资料准备中/.test(resources),
      videosHiddenBySupport: !document.querySelector('#product-resources a[href="/support/videos"]'),
      inquiryHref: document.querySelector("#product-inquiry a")?.getAttribute("href"),
    };
  });
  report.viewports[label].httpStatus = response?.status();
  await page.close();
}

report.summary = {
  noOverflow: Object.values(report.viewports).every((item) => item.httpStatus === 200 && !item.overflow),
  internalStatusOff: Object.values(report.viewports).every((item) => item.internalStatusCount === 0),
  unapprovedSpecsHidden: Object.values(report.viewports).every((item) => item.specificationTables === 0 && item.specificationsSafeEmpty && !item.unapprovedValuesVisible),
  internalConfigHidden: Object.values(report.viewports).every((item) => !item.internalConfigurationNamesVisible && !item.priceWarrantyVisible),
  realTasksEmpty: Object.values(report.viewports).every((item) => item.realTasksEmpty),
  documentsEmpty: Object.values(report.viewports).every((item) => item.documentsEmpty),
  videosFollowSupportVisibility: Object.values(report.viewports).every((item) => item.videosHiddenBySupport),
  noProExposure: Object.values(report.viewports).every((item) => !item.proVisible),
  inquiryWired: Object.values(report.viewports).every((item) => item.inquiryHref === "/inquiry"),
  noErrors: errors.length === 0,
};

await writeFile(join(out, "public-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report.summary, null, 2));
