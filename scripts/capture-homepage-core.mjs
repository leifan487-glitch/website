import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173/";
const browserPath =
  process.env.BROWSER_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDirectory = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });

function recordErrors(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`${label} console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`${label} pageerror: ${error.message}`);
  });
}

async function waitForImages(page, selector = "img") {
  await page.evaluate(async (imageSelector) => {
    const images = [...document.querySelectorAll(imageSelector)];
    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }
        if (image.decode) {
          await image.decode().catch(() => {});
        }
      }),
    );
  }, selector);
}

async function warmBelowFold(page) {
  for (const selector of [".mantis-intro", ".product-detail", ".real-world"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    await waitForImages(page, `${selector} img`);
  }
}

async function openPage(viewport, label, productId = "standard", options = {}) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: options.reducedMotion,
  });
  recordErrors(page, label);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  if (productId === "pro") {
    await page.getByRole("button", { name: "PRO", exact: true }).click();
    await page.waitForTimeout(380);
  }
  await waitForImages(page, ".product-hero__media img");
  return page;
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box
        ? {
            x: Math.round(box.x),
            y: Math.round(box.y + window.scrollY),
            width: Math.round(box.width),
            height: Math.round(box.height),
          }
        : null;
    };
    const hero = document.querySelector(".product-hero");
    const navbar = document.querySelector(".navbar")?.getBoundingClientRect();
    const heroMedia = document.querySelector(".product-hero__media")?.getBoundingClientRect();

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      heroProduct: hero?.dataset.product,
      heroMediaMode: hero?.dataset.mediaMode,
      heroMediaSafeGap:
        navbar && heroMedia ? Math.round(heroMedia.top - navbar.bottom) : null,
      sections: {
        hero: rect(".product-hero"),
        productIdea: rect(".mantis-intro"),
        productDetail: rect(".product-detail"),
        realWorld: rect(".real-world"),
      },
      images: [...document.images].map((image) => ({
        src: image.currentSrc,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })),
    };
  });
}

const viewports = {
  "1440x1000": { width: 1440, height: 1000 },
  "1440x800": { width: 1440, height: 800 },
  "1728x900": { width: 1728, height: 900 },
  "1920x1080": { width: 1920, height: 1080 },
  "390": { width: 390, height: 844 },
};

const report = {
  baseUrl,
  viewports: {},
  heroRegression: {},
  interactions: {},
  reducedMotion: {},
  errors,
};

for (const [label, viewport] of Object.entries(viewports)) {
  const page = await openPage(viewport, `full-${label}`);
  await warmBelowFold(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  await page.screenshot({
    path: join(outputDirectory, `homepage-core-${label}.png`),
    fullPage: true,
  });
  report.viewports[label] = await collectMetrics(page);

  if (label === "1440x1000") {
    for (const selector of [".mantis-intro", ".product-detail", ".real-world"]) {
      const slug = selector.slice(1);
      await page.locator(selector).screenshot({
        path: join(outputDirectory, `qa-current-${slug}-1440.png`),
      });
    }

    const realWorldTop = await page.locator(".real-world").evaluate((element) =>
      Math.round(element.getBoundingClientRect().top + window.scrollY),
    );
    await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 230)), realWorldTop);
    await page.waitForTimeout(80);
    await page.screenshot({
      path: join(outputDirectory, "homepage-core-white-dark-transition-1440.png"),
    });

    await page.getByRole("button", { name: /侧后视图/ }).click();
    await page.waitForTimeout(340);
    report.interactions.productDetail = await page.evaluate(() => ({
      pressed: document
        .querySelector('.product-detail__selector button[aria-pressed="true"]')
        ?.innerText.trim(),
      assetNote: document.querySelector(".product-detail .asset-note")?.innerText.trim(),
      imageSource: document.querySelector(".product-detail__media img")?.currentSrc,
    }));
    await page.locator(".product-detail").screenshot({
      path: join(outputDirectory, "qa-current-product-detail-a01792-1440.png"),
      style: ".skip-link { display: none !important; }",
    });
    await page.getByRole("button", { name: /侧前视图/ }).click();
  }

  await page.close();
}

for (const [label, viewport] of Object.entries({
  "standard-1440": viewports["1440x1000"],
  "pro-1440": viewports["1440x1000"],
  "standard-390": viewports["390"],
  "pro-390": viewports["390"],
})) {
  const productId = label.startsWith("pro") ? "pro" : "standard";
  const page = await openPage(viewport, `hero-${label}`, productId);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: join(outputDirectory, `task005-hero-${label}.png`),
  });
  report.heroRegression[label] = await collectMetrics(page);
  await page.close();
}

const reducedMotionPage = await openPage(
  viewports["1440x1000"],
  "reduced-motion",
  "standard",
  { reducedMotion: "reduce" },
);
await reducedMotionPage.locator(".product-detail").scrollIntoViewIfNeeded();
await reducedMotionPage.getByRole("button", { name: /侧后视图/ }).click();
report.reducedMotion = await reducedMotionPage.evaluate(() => {
  const media = document.querySelector(".product-detail__media");
  const heroSwap = document.querySelector(".product-hero__swap");
  return {
    mediaAnimationName: media ? getComputedStyle(media).animationName : null,
    selectorTransition: getComputedStyle(
      document.querySelector(".product-detail__selector button"),
    ).transitionDuration,
    heroAnimationName: heroSwap ? getComputedStyle(heroSwap).animationName : null,
  };
});
await reducedMotionPage.close();

const mobileMenuPage = await openPage(viewports["390"], "mobile-menu");
await mobileMenuPage.locator(".navbar__menu-button").click();
const menuOpen = await mobileMenuPage.evaluate(() => ({
  expanded: document.querySelector(".navbar__menu-button")?.getAttribute("aria-expanded"),
  display: getComputedStyle(document.querySelector(".navbar__links")).display,
}));
await mobileMenuPage.getByRole("link", { name: "产品", exact: true }).click();
await mobileMenuPage.waitForTimeout(120);
report.interactions.mobileMenu = {
  ...menuOpen,
  closedAfterNavigation:
    (await mobileMenuPage.locator(".navbar__menu-button").getAttribute("aria-expanded")) ===
    "false",
  hash: await mobileMenuPage.evaluate(() => window.location.hash),
};
await mobileMenuPage.close();

await writeFile(
  join(outputDirectory, "homepage-core-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

await browser.close();
console.log(JSON.stringify(report, null, 2));
