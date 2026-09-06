import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/task012-before/", import.meta.url));
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const report = {};
for (const viewport of [
  { width: 1440, height: 900, name: "standard-1440" },
  { width: 390, height: 844, name: "standard-390" },
]) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(out, `${viewport.name}.png`), fullPage: true });
  report[viewport.name] = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    sections: [...document.querySelectorAll("main > section")].map((section) => section.id || section.className),
  }));
  await page.close();
}
await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
