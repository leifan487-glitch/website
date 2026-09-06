import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const mode = process.env.CAPTURE_MODE || "normal";
const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/", import.meta.url));
const errors = [];
const exposurePattern = /Mantis Pro|MANTIS PRO|P0000[1-5]|了解 Pro/i;

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
}

async function ready(page, pathname = "/") {
  console.log(`open ${pathname}`);
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
  for (const section of await page.locator("main > section").all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(30);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);
  console.log(`ready ${pathname}`);
}

async function metrics(page) {
  return page.evaluate(() => {
    const nav = document.querySelector(".navbar")?.getBoundingClientRect();
    const brand = document.querySelector(".navbar__brand")?.getBoundingClientRect();
    const copy = document.querySelector(".product-hero__copy")?.getBoundingClientRect();
    const media = document.querySelector(".product-hero__media")?.getBoundingClientRect();
    const image = document.querySelector(".product-hero__media img");
    const imageStyle = image ? getComputedStyle(image) : null;
    const imageRect = image?.getBoundingClientRect();
    return {
      pathname: location.pathname,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      proExposure: /Mantis Pro|MANTIS PRO|P0000[1-5]|了解 Pro/i.test(document.body.innerText)
        || [...document.images].some((item) => /pro-|p0000/i.test(item.currentSrc || item.src)),
      internalStatusCount: document.querySelectorAll(".internal-status").length,
      brokenImages: [...document.images]
        .filter((item) => !item.complete || !item.naturalWidth)
        .map((item) => item.src),
      footerLinks: [...document.querySelectorAll(".site-footer a")].map((item) => item.getAttribute("href")),
      nav: nav && { top: nav.top, bottom: nav.bottom, height: nav.height },
      alignment: brand && copy && {
        brandLeft: Math.round(brand.left),
        copyLeft: Math.round(copy.left),
        delta: Math.round(copy.left - brand.left),
      },
      heroMedia: media && imageStyle && imageRect && {
        top: Math.round(media.top),
        width: Math.round(media.width),
        height: Math.round(media.height),
        imageTop: Math.round(imageRect.top),
        imageBottom: Math.round(imageRect.bottom),
        fit: imageStyle.objectFit,
        position: imageStyle.objectPosition,
        transform: imageStyle.transform,
        animationDuration: imageStyle.animationDuration,
      },
    };
  });
}

async function screenshotHome(viewport, filename) {
  const page = await browser.newPage({ viewport });
  watch(page, filename);
  await ready(page);
  await page.screenshot({ path: join(out, filename) });
  const result = await metrics(page);
  await page.close();
  return result;
}

const report = { baseUrl, mode, screenshots: {}, interactions: {}, routes: {}, errors };

if (mode === "status-off") {
  report.screenshots.desktop = await screenshotHome(
    { width: 1440, height: 900 },
    "task009-status-off-1440.png",
  );
  report.screenshots.mobile = await screenshotHome(
    { width: 390, height: 844 },
    "task009-status-off-390.png",
  );
} else {
  report.screenshots.hero1440 = await screenshotHome(
    { width: 1440, height: 900 },
    "task009-hero-1440.png",
  );
  report.screenshots.hero1728 = await screenshotHome(
    { width: 1728, height: 900 },
    "task009-hero-1728.png",
  );
  report.screenshots.hero390 = await screenshotHome(
    { width: 390, height: 844 },
    "task009-hero-390.png",
  );

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(desktop, "desktop-dropdown");
  await ready(desktop);
  const trigger = desktop.locator(".navbar__product-trigger");
  const productLink = desktop.locator(".navbar__product-menu").getByRole("link", { name: "Mantis Standard", exact: true });
  await trigger.hover();
  await productLink.hover();
  report.interactions.hoverSafeArea = {
    visible: await productLink.isVisible(),
    expanded: await trigger.getAttribute("aria-expanded"),
  };
  await desktop.screenshot({ path: join(out, "task009-dropdown-1440.png") });
  await desktop.mouse.click(700, 500);
  report.interactions.outsideClickClosed = await trigger.getAttribute("aria-expanded");
  await trigger.click();
  report.interactions.clickOpened = await trigger.getAttribute("aria-expanded");
  await trigger.click();
  report.interactions.clickToggledClosed = await trigger.getAttribute("aria-expanded");
  await desktop.locator(".navbar__brand").focus();
  await trigger.focus();
  report.interactions.focusOpened = await trigger.getAttribute("aria-expanded");
  await desktop.keyboard.press("Escape");
  report.interactions.escape = {
    expanded: await trigger.getAttribute("aria-expanded"),
    focusReturned: await trigger.evaluate((node) => document.activeElement === node),
  };
  await desktop.keyboard.press("Enter");
  report.interactions.enterOpened = await trigger.getAttribute("aria-expanded");
  await desktop.keyboard.press("Escape");
  await desktop.keyboard.press("Space");
  report.interactions.spaceOpened = await trigger.getAttribute("aria-expanded");
  await productLink.click();
  await desktop.waitForURL("**/products/mantis-standard");
  report.interactions.routeChange = {
    pathname: new URL(desktop.url()).pathname,
    expanded: await desktop.locator(".navbar__product-trigger").getAttribute("aria-expanded"),
    productActive: await desktop.locator(".navbar__product-trigger").evaluate((node) => node.classList.contains("is-active")),
  };
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(mobile, "mobile-accordion");
  await ready(mobile);
  await mobile.getByRole("button", { name: "菜单", exact: true }).click();
  const mobileTrigger = mobile.locator(".navbar__product-trigger");
  await mobileTrigger.click();
  report.interactions.mobileAccordionOpened = {
    expanded: await mobileTrigger.getAttribute("aria-expanded"),
    standardVisible: await mobile.locator(".navbar__product-menu").getByRole("link", { name: "Mantis Standard", exact: true }).isVisible(),
    waitingVisible: await mobile.getByText("敬请期待", { exact: true }).isVisible(),
  };
  await mobile.screenshot({ path: join(out, "task009-accordion-390.png") });
  await mobileTrigger.click();
  report.interactions.mobileAccordionClosed = await mobileTrigger.getAttribute("aria-expanded");
  await mobileTrigger.click();
  await mobile.locator(".navbar__product-menu").getByRole("link", { name: "Mantis Standard", exact: true }).click();
  await mobile.waitForURL("**/products/mantis-standard");
  report.interactions.mobileRouteChange = {
    pathname: new URL(mobile.url()).pathname,
    menuExpanded: await mobile.getByRole("button", { name: "菜单", exact: true }).getAttribute("aria-expanded"),
    productExpanded: await mobile.locator(".navbar__product-trigger").getAttribute("aria-expanded"),
  };
  await mobile.close();

  for (const pathname of [
    "/products",
    "/products/mantis-pro",
    "/technology",
    "/applications",
    "/about",
    "/contact",
  ]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    watch(page, pathname);
    await ready(page, pathname);
    const bodyText = await page.locator("body").innerText();
    report.routes[pathname] = {
      finalPath: new URL(page.url()).pathname,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      brokenImages: await page.evaluate(() => [...document.images].filter((item) => !item.complete || !item.naturalWidth).length),
      proExposure: exposurePattern.test(bodyText),
      activeLinks: await page.locator(".navbar__links > a.is-active").allTextContents(),
      productActive: await page.locator(".navbar__product-trigger").evaluate((node) => node.classList.contains("is-active")),
    };
    await page.close();
  }

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await ready(reduced);
  report.interactions.reducedMotion = await reduced.evaluate(() => ({
    heroIdentity: getComputedStyle(document.querySelector(".product-hero__identity")).animationName,
    heroMedia: getComputedStyle(document.querySelector(".product-hero__media")).animationName,
    dropdownTransition: getComputedStyle(document.querySelector(".navbar__product-menu")).transitionDuration,
  }));
  await reduced.close();

  const motion = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  await motion.goto(baseUrl, { waitUntil: "domcontentloaded" });
  report.interactions.motion = await motion.evaluate(() => ({
    heroIdentityDuration: getComputedStyle(document.querySelector(".product-hero__identity")).animationDuration,
    heroMediaDuration: getComputedStyle(document.querySelector(".product-hero__media")).animationDuration,
    dropdownDuration: getComputedStyle(document.querySelector(".navbar__product-menu")).transitionDuration,
  }));
  await motion.close();
}

report.summary = {
  noErrors: errors.length === 0,
  noProExposure: mode === "status-off"
    ? Object.values(report.screenshots).every((item) => !item.proExposure)
    : [...Object.values(report.screenshots), ...Object.values(report.routes)].every((item) => !item.proExposure),
  noOverflow: mode === "status-off"
    ? Object.values(report.screenshots).every((item) => item.scrollWidth === item.clientWidth)
    : Object.values(report.screenshots).every((item) => item.scrollWidth === item.clientWidth)
      && Object.values(report.routes).every((item) => !item.overflow),
  noBrokenImages: mode === "status-off"
    ? Object.values(report.screenshots).every((item) => item.brokenImages.length === 0)
    : Object.values(report.screenshots).every((item) => item.brokenImages.length === 0)
      && Object.values(report.routes).every((item) => item.brokenImages === 0),
};

const reportName = mode === "status-off"
  ? "task009-status-off-report.json"
  : "task009-report.json";
await writeFile(join(out, reportName), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report, null, 2));
