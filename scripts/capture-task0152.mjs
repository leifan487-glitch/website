import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4175";
const outputDir = resolve("screenshots/task0152-effects");
const viewports = [1440, 1024, 768, 390];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});

const report = [];

for (const width of viewports) {
  const page = await browser.newPage({
    viewport: { width, height: width === 390 ? 844 : 900 },
  });
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".skip-link{display:none!important}" });
  await page.evaluate(async () => { await document.fonts.ready; });

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    railDisplay: getComputedStyle(document.querySelector(".product-section-rail")).display,
    railLinks: document.querySelectorAll(".product-section-rail a").length,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
  }));

  await page.locator("#capabilities").scrollIntoViewIfNeeded();

  if (width === 1440) {
    const row = page.locator(".standard-capability-list > .editorial-spotlight-row").first();
    await row.hover({ position: { x: 640, y: 70 } });
    await page.waitForTimeout(480);
    metrics.capabilityHover = await row.evaluate((element) => ({
      glowOpacity: getComputedStyle(element, "::before").opacity,
      titleTransform: getComputedStyle(element.querySelector("h3")).transform,
      spotlightX: element.style.getPropertyValue("--spotlight-x"),
    }));
    metrics.activeAtCapabilities = await page
      .locator('.product-section-rail a[aria-current="location"] .product-section-rail__label')
      .textContent();
    await page.screenshot({ path: resolve(outputDir, "capabilities-hover-1440.png") });

    await page.locator('.product-section-rail a[href="#specifications"]').click();
    await page.mouse.move(720, 180);
    await page.waitForFunction(() => Math.abs(document.querySelector("#specifications").getBoundingClientRect().top) < 2);
    metrics.anchorAfterClick = await page.evaluate(() => ({
      hash: location.hash,
      top: Math.round(document.querySelector("#specifications").getBoundingClientRect().top),
    }));
    metrics.activeAfterClick = await page
      .locator('.product-section-rail a[aria-current="location"] .product-section-rail__label')
      .textContent();
    await page.screenshot({ path: resolve(outputDir, "section-rail-specifications-1440.png") });

    await page.locator("#development").scrollIntoViewIfNeeded();
    const darkRow = page.locator(".standard-development__flow > .editorial-spotlight-row").nth(1);
    await darkRow.hover({ position: { x: 760, y: 64 } });
    await page.waitForTimeout(480);
    metrics.developmentHover = await darkRow.evaluate((element) => ({
      glowOpacity: getComputedStyle(element, "::before").opacity,
      titleTransform: getComputedStyle(element.querySelector("h3")).transform,
    }));
    await page.screenshot({ path: resolve(outputDir, "development-hover-1440.png") });

    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    metrics.homeRailCount = await page.locator(".product-section-rail").count();
  } else {
    await page.screenshot({ path: resolve(outputDir, `capabilities-${width}.png`) });
  }

  report.push({ width, ...metrics, consoleErrors, pageErrors });
  await page.close();
}

const reduced = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
await reduced.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "networkidle" });
report.push({
  reducedMotion: await reduced.evaluate(() => ({
    spotlightTransition: getComputedStyle(document.querySelector(".editorial-spotlight-row"), "::before").transitionDuration,
    railTransition: getComputedStyle(document.querySelector(".product-section-rail__label")).transitionDuration,
  })),
});
await reduced.close();

await writeFile(resolve(outputDir, "browser-qa.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
