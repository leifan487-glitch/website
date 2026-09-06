import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173/";
const browserPath =
  process.env.BROWSER_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDirectory = fileURLToPath(new URL("../screenshots/", import.meta.url));

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];

async function openState(viewport, productId) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`${viewport.width}/${productId} console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`${viewport.width}/${productId} pageerror: ${error.message}`);
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  if (productId === "pro") {
    await page.getByRole("button", { name: "PRO", exact: true }).click();
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await page.locator(".product-hero__media img").waitFor({ state: "visible" });
  await page.evaluate(async () => {
    const image = document.querySelector(".product-hero__media img");
    if (image && !image.complete) {
      await new Promise((resolve) => image.addEventListener("load", resolve, { once: true }));
    }
  });
  await page.evaluate(() => window.scrollTo(0, 0));

  return page;
}

async function captureProduct(productId, label, viewport) {
  const page = await openState(viewport, productId);
  await page.screenshot({
    path: join(outputDirectory, `hero-${productId}-${label}.png`),
  });

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector(".product-hero");
    const selected = document.querySelector(
      '.product-hero__selector button[aria-pressed="true"]',
    );
    const navbar = document.querySelector(".navbar");
    const picture = document.querySelector(".product-hero__media");
    const image = picture?.querySelector("img");
    const heroRect = hero?.getBoundingClientRect();
    const navbarRect = navbar?.getBoundingClientRect();
    const pictureRect = picture?.getBoundingClientRect();
    const imageRect = image?.getBoundingClientRect();

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      heroHeight: heroRect?.height,
      navBottom: navbarRect?.bottom,
      mediaTop: pictureRect?.top,
      mediaTopSafeGap:
        pictureRect && navbarRect ? pictureRect.top - navbarRect.bottom : null,
      mediaHeight: pictureRect?.height,
      imageHeight: imageRect?.height,
      activeProduct: hero?.dataset.product,
      mediaMode: hero?.dataset.mediaMode,
      heading: document.querySelector("h1")?.getAttribute("aria-label"),
      selectedLabel: selected?.textContent?.trim(),
      cta: document.querySelector(".product-hero .text-link")?.textContent?.trim(),
      assetNote: document.querySelector(".product-hero__asset-note")?.innerText?.trim(),
      imageSource: image?.currentSrc,
      selectorCount: document.querySelectorAll(".product-hero__selector button").length,
    };
  });

  await page.close();
  return metrics;
}

async function captureFullPage(label, viewport) {
  const page = await openState(viewport, "standard");
  await page.screenshot({
    path: join(outputDirectory, `home-three-screens-${label}.png`),
    fullPage: true,
  });
  await page.close();
}

const viewports = {
  1440: { width: 1440, height: 1000 },
  "1440x800": { width: 1440, height: 800 },
  "1728x900": { width: 1728, height: 900 },
  "1920x1080": { width: 1920, height: 1080 },
  390: { width: 390, height: 844 },
};

const report = {
  baseUrl,
  states: {},
  menu: null,
  errors,
};

for (const [label, viewport] of Object.entries(viewports)) {
  report.states[`standard-${label}`] = await captureProduct(
    "standard",
    label,
    viewport,
  );
  report.states[`pro-${label}`] = await captureProduct("pro", label, viewport);
  await captureFullPage(label, viewport);
}

const mobileMenuPage = await openState(viewports[390], "standard");
await mobileMenuPage.locator(".navbar__menu-button").click();
report.menu = await mobileMenuPage.evaluate(() => ({
  expanded: document
    .querySelector(".navbar__menu-button")
    ?.getAttribute("aria-expanded"),
  display: getComputedStyle(document.querySelector(".navbar__links")).display,
}));
await mobileMenuPage.close();

await writeFile(
  join(outputDirectory, "capture-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

await browser.close();
console.log(JSON.stringify(report, null, 2));
