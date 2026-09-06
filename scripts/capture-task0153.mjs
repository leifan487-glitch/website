import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4177";
const outputDir = resolve("screenshots/task0153-home-refinement");
const browserPath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const viewports = [1440, 1024, 768, 390];
const applicationPosters = [
  "/assets/videos/standard/sv035/poster.webp",
  "/assets/videos/standard/sv037/poster.webp",
  "/assets/videos/standard/sv054/poster.webp",
];
const forbiddenPublicTerms = [
  "SOURCE",
  "TODO",
  "VERIFIED",
  "NEEDS CONFIRMATION",
  "HIGH RISK",
  "Internal Review",
  "\u5ba1\u6279",
  "\u6cbb\u7406",
];
const sectionSelectors = [
  ".home-mantis-intro",
  ".real-world",
  ".home-technology",
  ".home-applications",
  ".home-latest",
  ".home-about",
  ".final-cta",
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: browserPath,
});

function bindDiagnostics(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const badResponses = [];
  const requestFailures = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    requestFailures.push(`${request.failure()?.errorText || "failed"} ${request.url()}`);
  });
  return { consoleErrors, pageErrors, badResponses, requestFailures };
}

async function waitForPage(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    await document.fonts.ready;
  });
  await page.waitForTimeout(1700);
}

async function settleHomepage(page) {
  for (const selector of sectionSelectors) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1250);
  }
}

async function inspectSkipLink(page) {
  const initial = await page.locator(".skip-link").evaluate((element) => ({
    focused: document.activeElement === element,
    transform: getComputedStyle(element).transform,
    top: Math.round(element.getBoundingClientRect().top),
  }));
  await page.keyboard.press("Tab");
  const focused = await page.locator(".skip-link").evaluate((element) => ({
    focused: document.activeElement === element,
    transform: getComputedStyle(element).transform,
    top: Math.round(element.getBoundingClientRect().top),
  }));
  await page.locator("#main-content").evaluate((element) => {
    element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
  });
  await page.addStyleTag({ content: ".skip-link{display:none!important}" });
  return { initial, focused };
}

async function inspectInteractions(page, width) {
  const technologyButtons = page.locator(".home-technology__diagram button");
  await technologyButtons.nth(1).click();
  await page.waitForTimeout(760);
  await technologyButtons.nth(1).press("ArrowDown");
  await page.waitForTimeout(760);
  const technology = await page.evaluate(() => ({
    activeTitle: document.querySelector(".home-technology__active-content h3")?.textContent,
    activeIndex: [...document.querySelectorAll(".home-technology__diagram button")]
      .findIndex((button) => button.getAttribute("aria-pressed") === "true"),
    animationName: getComputedStyle(document.querySelector(".home-technology__active-content")).animationName,
  }));

  const latestButtons = page.locator(".home-latest__index button");
  await latestButtons.nth(0).click();
  await latestButtons.nth(0).press("ArrowDown");
  await page.waitForTimeout(120);
  const latest = await page.evaluate(() => ({
    activeIndex: [...document.querySelectorAll(".home-latest__index button")]
      .findIndex((button) => button.getAttribute("aria-pressed") === "true"),
    activeTitle: document.querySelector(".home-latest__active h3")?.textContent,
  }));

  const galleryButtons = page.locator(".home-application-gallery button");
  await galleryButtons.nth(1).click();
  await page.waitForTimeout(width > 900 ? 1000 : 100);
  await galleryButtons.nth(1).press(width > 900 ? "ArrowRight" : "ArrowDown");
  await page.waitForTimeout(width > 900 ? 1000 : 100);
  const gallery = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".home-application-gallery > li")];
    return {
      activeIndex: items.findIndex((item) => item.classList.contains("is-active")),
      widths: items.map((item) => Math.round(item.getBoundingClientRect().width)),
      collapsedTitles: items
        .filter((item) => !item.classList.contains("is-active"))
        .map((item) => {
          const title = item.querySelector("strong");
          const titleRect = title.getBoundingClientRect();
          const buttonRect = item.querySelector("button").getBoundingClientRect();
          return {
            text: title.textContent,
            writingMode: getComputedStyle(title).writingMode,
            fits: titleRect.top >= buttonRect.top && titleRect.bottom <= buttonRect.bottom,
          };
        }),
      descriptions: items.map((item) => Number(getComputedStyle(
        item.querySelector(".home-application-gallery__description"),
      ).opacity)),
    };
  });

  return { technology, latest, gallery };
}

async function inspectViewport(width) {
  const height = width === 390 ? 844 : 1000;
  const page = await browser.newPage({ viewport: { width, height } });
  const diagnostics = bindDiagnostics(page);
  const mp4Requests = new Set();
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.endsWith(".mp4")) mp4Requests.add(pathname);
  });

  const response = await page.goto(`${baseUrl}/`, { waitUntil: "load", timeout: 30000 });
  await waitForPage(page);
  const skipLink = await inspectSkipLink(page);
  await settleHomepage(page);
  const interactions = await inspectInteractions(page, width);

  const audit = await page.evaluate(({ posters, forbiddenTerms }) => {
    const bodyText = document.body.textContent || "";
    const applicationImages = [...document.querySelectorAll(".home-application-gallery img")];
    const sections = Object.fromEntries([
      ["mantis", ".home-mantis-intro"],
      ["realWorld", ".real-world"],
      ["technology", ".home-technology"],
      ["applications", ".home-applications"],
      ["latest", ".home-latest"],
      ["about", ".home-about"],
      ["finalCta", ".final-cta"],
    ].map(([key, selector]) => [key, Math.round(document.querySelector(selector).getBoundingClientRect().height)]));
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageHeight: document.documentElement.scrollHeight,
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.src),
      imagesMissingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
      unnamedButtons: [...document.querySelectorAll("button")].filter((button) => (
        !button.textContent.trim()
        && !button.getAttribute("aria-label")
        && !button.getAttribute("aria-labelledby")
        && !button.getAttribute("title")
      )).length,
      internalStatusCount: document.querySelectorAll(".internal-status").length,
      forbiddenTerms: forbiddenTerms.filter((term) => bodyText.includes(term)),
      hasXianTag: bodyText.includes("Xi'an, China"),
      applicationImageCount: applicationImages.length,
      applicationVideoCount: document.querySelectorAll(".home-applications video").length,
      applicationPosters: applicationImages.map((image) => new URL(image.src).pathname),
      expectedApplicationPosters: posters,
      sections,
    };
  }, { posters: applicationPosters, forbiddenTerms: forbiddenPublicTerms });

  await page.locator("#main-content").evaluate((element) => element.focus({ preventScroll: true }));
  await page.screenshot({ path: resolve(outputDir, `home-${width}-full.png`), fullPage: true });
  if (width === 1440 || width === 390) {
    for (const [selector, name] of [
      [".home-mantis-intro", "mantis"],
      [".home-technology", "technology"],
      [".home-applications", "applications"],
      [".home-latest", "latest"],
      [".home-about", "about"],
      [".final-cta", "final-cta"],
    ]) {
      await page.locator(selector).screenshot({ path: resolve(outputDir, `${name}-${width}.png`) });
    }
  }

  await page.close();
  return {
    width,
    height,
    httpStatus: response?.status() || null,
    skipLink,
    interactions,
    audit,
    mp4Requests: [...mp4Requests],
    diagnostics,
  };
}

async function inspectReducedMotion(width) {
  const page = await browser.newPage({
    viewport: { width, height: width === 390 ? 844 : 1000 },
    reducedMotion: "reduce",
  });
  const diagnostics = bindDiagnostics(page);
  await page.goto(`${baseUrl}/`, { waitUntil: "load", timeout: 30000 });
  await waitForPage(page);
  await page.addStyleTag({ content: ".skip-link{display:none!important}" });
  await settleHomepage(page);

  const before = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".home-application-gallery > li")];
    return {
      widths: items.map((item) => Math.round(item.getBoundingClientRect().width)),
      activeIndex: items.findIndex((item) => item.classList.contains("is-active")),
    };
  });
  await page.locator(".home-application-gallery button").nth(1).click();
  await page.waitForTimeout(80);
  const audit = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".home-application-gallery > li")];
    const video = document.querySelector(".real-world video");
    return {
      reduceMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      premiumMotionClass: document.documentElement.classList.contains("has-premium-motion"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      technologyAnimation: getComputedStyle(document.querySelector(".home-technology__active-content")).animationName,
      galleryWidths: items.map((item) => Math.round(item.getBoundingClientRect().width)),
      galleryActiveIndex: items.findIndex((item) => item.classList.contains("is-active")),
      videoPaused: video?.paused ?? null,
      hiddenHeadings: [...document.querySelectorAll(
        ".home-mantis-intro h2, .real-world h2, .home-technology h2, .home-applications h2, .home-latest h2, .home-about h2, .final-cta h2",
      )].filter((heading) => {
        const style = getComputedStyle(heading);
        return Number(style.opacity) < 0.99 || style.visibility === "hidden";
      }).length,
    };
  });
  await page.screenshot({ path: resolve(outputDir, `reduced-motion-${width}-full.png`), fullPage: true });
  await page.close();
  return { width, before, audit, diagnostics };
}

const viewportResults = [];
for (const width of viewports) viewportResults.push(await inspectViewport(width));
const reducedMotion = [await inspectReducedMotion(1440), await inspectReducedMotion(390)];

const allPassed = viewportResults.every((result) => {
  const { audit, diagnostics, interactions, skipLink } = result;
  const desktopGallery = result.width > 900;
  const activeWidth = interactions.gallery.widths[interactions.gallery.activeIndex];
  const inactiveWidths = interactions.gallery.widths.filter((_, index) => index !== interactions.gallery.activeIndex);
  return result.httpStatus === 200
    && audit.overflow === 0
    && audit.brokenImages.length === 0
    && audit.imagesMissingAlt === 0
    && audit.unnamedButtons === 0
    && audit.internalStatusCount === 0
    && audit.forbiddenTerms.length === 0
    && audit.hasXianTag === false
    && audit.applicationImageCount === 3
    && audit.applicationVideoCount === 0
    && JSON.stringify(audit.applicationPosters) === JSON.stringify(applicationPosters)
    && result.mp4Requests.length === 1
    && result.mp4Requests[0] === "/assets/videos/standard/home-real-world/video.mp4"
    && interactions.technology.activeIndex === 2
    && interactions.latest.activeIndex === 1
    && interactions.gallery.activeIndex === 2
    && (desktopGallery
      ? activeWidth > Math.max(...inactiveWidths) * 4
        && interactions.gallery.collapsedTitles.every((title) => title.writingMode === "vertical-rl" && title.fits)
      : interactions.gallery.descriptions.every((opacity) => opacity >= 0.7))
    && skipLink.initial.focused === false
    && skipLink.initial.top < 0
    && skipLink.focused.focused === true
    && skipLink.focused.top >= 0
    && Object.values(diagnostics).every((items) => items.length === 0);
}) && reducedMotion.every((result) => {
  const activeWidth = result.audit.galleryWidths[result.audit.galleryActiveIndex];
  const inactiveWidths = result.audit.galleryWidths.filter((_, index) => index !== result.audit.galleryActiveIndex);
  return result.audit.reduceMatches
    && result.audit.premiumMotionClass === false
    && result.audit.overflow === 0
    && result.audit.technologyAnimation === "none"
    && result.audit.videoPaused === true
    && result.audit.hiddenHeadings === 0
    && result.audit.galleryActiveIndex === 1
    && (result.width <= 900 || activeWidth > Math.max(...inactiveWidths) * 4)
    && Object.values(result.diagnostics).every((items) => items.length === 0);
});

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  allPassed,
  viewportResults,
  reducedMotion,
};

await writeFile(resolve(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

console.log(JSON.stringify({
  allPassed,
  viewports: viewportResults.map((result) => ({
    width: result.width,
    overflow: result.audit.overflow,
    brokenImages: result.audit.brokenImages.length,
    mp4Requests: result.mp4Requests,
    galleryWidths: result.interactions.gallery.widths,
  })),
  reducedMotion: reducedMotion.map((result) => ({
    width: result.width,
    galleryWidths: result.audit.galleryWidths,
    hiddenHeadings: result.audit.hiddenHeadings,
  })),
}, null, 2));
