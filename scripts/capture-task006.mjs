import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browserPath =
  process.env.BROWSER_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const mode = process.env.CAPTURE_MODE || "after";
const outputDirectory = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });

function recordErrors(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label} pageerror: ${error.message}`));
}

async function waitForImages(page) {
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }
        await image.decode?.().catch(() => {});
      }),
    );
  });
}

async function warmPage(page) {
  const sections = await page.locator("main > section").all();
  for (const section of sections) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
  }
  await waitForImages(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
}

async function openPage(pathname, viewport, label) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  recordErrors(page, label);
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  await warmPage(page);
  return page;
}

async function sha256(path) {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

async function captureHero(page, name) {
  const path = join(outputDirectory, name);
  await page.locator(".product-hero").screenshot({ path });
  return { path, sha256: await sha256(path) };
}

async function metrics(page) {
  return page.evaluate(() => {
    const bounds = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        x: Math.round(box.x),
        y: Math.round(box.y + window.scrollY),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    };

    return {
      pathname: window.location.pathname,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      sections: [...document.querySelectorAll("main > section")].map((section) => ({
        className: section.className,
        id: section.id,
      })),
      bounds: {
        hero: bounds(".product-hero"),
        homeIntro: bounds(".home-mantis-intro"),
        realWorld: bounds(".real-world"),
        productHeader: bounds(".product-page-header"),
        fullIntro: bounds(".mantis-intro"),
        productDetail: bounds(".product-detail"),
      },
      imageFailures: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    };
  });
}

const viewports = {
  desktop: { width: 1440, height: 900 },
  wide: { width: 1728, height: 900 },
  mobile: { width: 390, height: 844 },
};

const report = { mode, baseUrl, errors, captures: {}, pages: {}, interactions: {} };

if (mode === "before") {
  for (const [label, viewport] of Object.entries({ desktop: viewports.desktop, mobile: viewports.mobile })) {
    const page = await openPage("/", viewport, `before-${label}`);
    const fullPath = join(outputDirectory, `task006-before-home-${label}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    report.captures[`home-${label}`] = fullPath;
    report.captures[`hero-${label}`] = await captureHero(
      page,
      `task006-before-hero-standard-${label}.png`,
    );
    report.pages[label] = await metrics(page);
    await page.close();
  }
} else {
  for (const [label, viewport] of Object.entries(viewports)) {
    const page = await openPage("/", viewport, `home-${label}`);
    const fullPath = join(outputDirectory, `task006-home-${label}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    report.captures[`home-${label}`] = fullPath;
    report.pages[`home-${label}`] = await metrics(page);

    if (label !== "wide") {
      report.captures[`hero-${label}`] = await captureHero(
        page,
        `task006-after-hero-standard-${label}.png`,
      );
    }
    await page.close();
  }

  const storyPage = await openPage("/", viewports.desktop, "home-story");
  const storyPath = join(outputDirectory, "task006-home-hero-intro-real-world-1440.png");
  await storyPage.locator("main").screenshot({ path: storyPath });
  report.captures.homeStory = storyPath;
  await storyPage.getByRole("link", { name: "了解 Mantis Standard" }).click();
  await storyPage.waitForLoadState("networkidle");
  report.interactions.homeIntroCtaPath = new URL(storyPage.url()).pathname;
  await storyPage.close();

  for (const [label, viewport] of Object.entries({ desktop: viewports.desktop, mobile: viewports.mobile })) {
    const page = await openPage(
      "/products/mantis-standard",
      viewport,
      `product-${label}`,
    );
    const firstMetrics = await metrics(page);
    await page.reload({ waitUntil: "networkidle" });
    await warmPage(page);
    const refreshedMetrics = await metrics(page);
    const fullPath = join(outputDirectory, `task006-standard-product-${label}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    report.captures[`product-${label}`] = fullPath;
    report.pages[`product-${label}`] = { firstMetrics, refreshedMetrics };

    if (label === "desktop") {
      await page.getByRole("button", { name: /侧后视图/ }).click();
      await page.waitForTimeout(340);
      report.interactions.productDetail = await page.evaluate(() => ({
        pressed: document
          .querySelector('.product-detail__selector button[aria-pressed="true"]')
          ?.innerText.trim(),
        assetNote: document.querySelector(".product-detail .asset-note")?.innerText.trim(),
      }));
      await page.getByRole("link", { name: "返回首页" }).click();
      await page.waitForLoadState("networkidle");
      report.interactions.productBackPath = new URL(page.url()).pathname;
    }
    await page.close();
  }

  for (const [label, viewport] of Object.entries({
    "pro-1440x1000": { width: 1440, height: 1000 },
    "pro-390": viewports.mobile,
  })) {
    const proPage = await openPage("/", viewport, `hero-${label}-regression`);
    await proPage.getByRole("button", { name: "PRO", exact: true }).click();
    await proPage.waitForTimeout(380);
    report.captures[label] = await captureHero(
      proPage,
      `task006-after-hero-${label}.png`,
    );
    report.interactions.proStillSelectable =
      (await proPage.locator(".product-hero").getAttribute("data-product")) === "pro";
    await proPage.close();
  }

  const mobileMenu = await openPage("/", viewports.mobile, "mobile-menu");
  await mobileMenu.locator(".navbar__menu-button").click();
  await mobileMenu.getByRole("link", { name: "产品", exact: true }).click();
  await mobileMenu.waitForLoadState("networkidle");
  report.interactions.mobileProductNavPath = new URL(mobileMenu.url()).pathname;
  await mobileMenu.close();
}

await writeFile(
  join(outputDirectory, `task006-${mode}-report.json`),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

await browser.close();
console.log(JSON.stringify(report, null, 2));
