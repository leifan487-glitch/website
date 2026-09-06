import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/task0131/", import.meta.url));
const internalUrl = process.env.TASK0131_INTERNAL_URL || "http://127.0.0.1:4174";
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];
const pages = {};

await mkdir(out, { recursive: true });
for (const [name, pathname] of [["applications", "/applications"], ["about", "/about"]]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push({ name, type: "console", text: message.text() });
  });
  page.on("pageerror", (error) => errors.push({ name, type: "pageerror", text: error.message }));
  const response = await page.goto(`${internalUrl}${pathname}`, { waitUntil: "networkidle" });
  const text = await page.locator("body").innerText();
  pages[name] = {
    status: response?.status(),
    hasSafeLabel: text.includes("自研灵巧手"),
    hasNeedsConfirmation: text.includes("NEEDS CONFIRMATION"),
    hasBothSourceNames: text.includes("FF8D-Hand") && text.includes("FF16D-Hand"),
    internalStatusCount: await page.locator(".internal-status").count(),
  };
  await page.close();
}

const report = {
  internalUrl,
  pages,
  errors,
  checks: {
    allHttp200: Object.values(pages).every((item) => item.status === 200),
    safeLabelShown: Object.values(pages).every((item) => item.hasSafeLabel),
    conflictShown: Object.values(pages).every((item) => item.hasNeedsConfirmation) && pages.applications.hasBothSourceNames,
    internalStatusOn: Object.values(pages).every((item) => item.internalStatusCount > 0),
    noConsoleErrors: errors.length === 0,
  },
};

await writeFile(`${out}/internal-review-report.json`, `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(report.checks, null, 2));
if (!Object.values(report.checks).every(Boolean)) process.exitCode = 1;
