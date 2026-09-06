import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = resolve("screenshots/task015-motion");
const browserPath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const sectionSteps = [
  { key: "mantis", trigger: ".home-mantis-intro", sample: ".home-mantis-intro__copy h2", capture: ".home-mantis-intro", mid: true },
  { key: "real-world-header", trigger: ".real-world", sample: ".real-world__header h2" },
  { key: "real-world-media", trigger: ".real-world__stage", sample: ".real-world__frame", capture: ".real-world", mid: true },
  { key: "technology-header", trigger: ".home-technology__header", sample: ".home-technology__header h2" },
  { key: "technology-body", trigger: ".home-technology__body", sample: ".home-technology__diagram li", capture: ".home-technology", mid: true },
  { key: "applications-header", trigger: ".home-applications__header", sample: ".home-applications__header h2" },
  { key: "applications-grid", trigger: ".home-applications__grid", sample: ".home-application-story", capture: ".home-applications", mid: true, wait: 1850 },
  { key: "progress-header", trigger: ".home-latest .section-title", sample: ".home-latest .section-title h2" },
  { key: "progress-list", trigger: ".latest-list", sample: ".latest-list article", capture: ".home-latest" },
  { key: "about", trigger: ".home-about", sample: ".home-about__copy h2", capture: ".home-about" },
  { key: "final-cta", trigger: ".final-cta", sample: ".final-cta h2", capture: ".final-cta" },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: browserPath });

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
    if (response.status() >= 400) badResponses.push(
      String(response.status()) + " " + response.url(),
    );
  });
  page.on("requestfailed", (request) => requestFailures.push(
    (request.failure()?.errorText || "failed") + " " + request.url(),
  ));
  return { consoleErrors, pageErrors, badResponses, requestFailures };
}

async function waitForAssets(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    [...document.images].forEach((image) => { image.loading = "eager"; });
    await document.fonts.ready;
    await Promise.race([
      Promise.all([...document.images].map((image) => image.decode().catch(() => undefined))),
      new Promise((resolveWait) => window.setTimeout(resolveWait, 4000)),
    ]);
  });
}

async function visualState(page, selector) {
  return page.locator(selector).first().evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      opacity: Number(style.opacity),
      visibility: style.visibility,
      transform: style.transform,
      clipPath: style.clipPath,
      willChange: style.willChange,
      mediaY: style.getPropertyValue("--motion-media-y").trim(),
      mediaScale: style.getPropertyValue("--motion-media-scale").trim(),
      rect: {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
    };
  });
}

async function scrollTriggerTo(page, selector, viewportRatio) {
  await page.evaluate(({ target, ratio }) => {
    const element = document.querySelector(target);
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * ratio));
  }, { target: selector, ratio: viewportRatio });
}

function stateSettled(state) {
  const clipSettled = state.clipPath === "none"
    || state.clipPath === "inset(0px)"
    || state.clipPath === "inset(0px 0px 0px)"
    || state.clipPath === "inset(0px 0px 0px 0px)";
  return state.opacity >= 0.99 && state.visibility !== "hidden" && clipSettled;
}

async function captureOpening(width, height, suffix) {
  const page = await browser.newPage({ viewport: { width, height } });
  const diagnostics = bindDiagnostics(page);
  await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded", timeout: 30000 });

  const moments = [
    { key: "0080ms", wait: 80 },
    { key: "0400ms", wait: 320 },
    { key: "0900ms", wait: 500 },
    { key: "1600ms", wait: 700 },
  ];
  const states = [];
  for (const moment of moments) {
    await page.waitForTimeout(moment.wait);
    states.push({
      key: moment.key,
      name: await visualState(page, ".product-hero__name"),
      variant: await visualState(page, ".product-hero__variant"),
      media: await visualState(page, ".product-hero__media"),
      cta: await visualState(page, ".product-hero__cta"),
    });
    await page.screenshot({ path: resolve(outputDir, "opening-" + suffix + "-" + moment.key + ".png") });
  }

  await waitForAssets(page);
  const audit = await page.evaluate(() => ({
    premiumMotionClass: document.documentElement.classList.contains("has-premium-motion"),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
    scrollTriggerMarkers: document.querySelectorAll(".gsap-marker-start, .gsap-marker-end").length,
  }));
  await page.close();
  return { width, height, states, audit, diagnostics };
}

async function captureSections(width, height, suffix) {
  const page = await browser.newPage({ viewport: { width, height } });
  const diagnostics = bindDiagnostics(page);
  await page.goto(baseUrl + "/", { waitUntil: "load", timeout: 30000 });
  await waitForAssets(page);
  await page.waitForTimeout(1700);

  const results = [];
  for (const step of sectionSteps) {
    await scrollTriggerTo(page, step.trigger, 0.93);
    await page.waitForTimeout(80);
    const before = await visualState(page, step.sample);

    await scrollTriggerTo(page, step.trigger, 0.62);
    await page.waitForTimeout(180);
    const mid = await visualState(page, step.sample);
    if (step.mid) {
      await page.screenshot({ path: resolve(outputDir, "section-" + suffix + "-" + step.key + "-mid.png") });
    }

    await page.waitForTimeout((step.wait || 1450) - 180);
    const final = await visualState(page, step.sample);
    if (step.capture) {
      await page.locator(step.capture).screenshot({
        path: resolve(outputDir, "section-" + suffix + "-" + step.key + "-final.png"),
      });
    }
    results.push({
      key: step.key,
      before,
      mid,
      final,
      changedDuringMotion: JSON.stringify(before) !== JSON.stringify(mid),
      settled: stateSettled(final),
    });
  }

  const parallax = await page.evaluate(() => [...document.querySelectorAll(
    ".home-mantis-intro__visual img, .real-world__frame video, .home-application-story__media img",
  )].map((element) => ({
    selector: element.tagName.toLowerCase(),
    y: getComputedStyle(element).getPropertyValue("--motion-media-y").trim(),
    transform: getComputedStyle(element).transform,
  })));
  const audit = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
    hiddenAnimatedTargets: [...document.querySelectorAll(
      ".product-hero__name, .product-hero__variant, .home-mantis-intro h2, .real-world h2, .home-technology h2, .home-applications h2, .home-latest h2, .home-about h2, .final-cta h2",
    )].filter((element) => {
      const style = getComputedStyle(element);
      return Number(style.opacity) < 0.99 || style.visibility === "hidden";
    }).length,
    internalStatusCount: document.querySelectorAll(".internal-status").length,
  }));
  await page.close();
  return { width, height, results, parallax, audit, diagnostics };
}

async function captureReducedMotion() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const diagnostics = bindDiagnostics(page);
  await page.goto(baseUrl + "/", { waitUntil: "load", timeout: 30000 });
  await waitForAssets(page);
  await page.waitForTimeout(500);

  for (const step of sectionSteps) {
    await scrollTriggerTo(page, step.trigger, 0.62);
    await page.waitForTimeout(30);
  }
  const states = {};
  for (const step of sectionSteps) states[step.key] = await visualState(page, step.sample);
  await page.screenshot({ path: resolve(outputDir, "reduced-motion-390-full.png"), fullPage: true });

  const audit = await page.evaluate(() => {
    const video = document.querySelector(".real-world video");
    return {
      reduceMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      premiumMotionClass: document.documentElement.classList.contains("has-premium-motion"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      videoPaused: video?.paused ?? null,
      videoAutoplay: video?.autoplay ?? null,
      videoControls: video?.controls ?? null,
      mediaVariables: [...document.querySelectorAll(
        ".home-mantis-intro__visual img, .real-world__frame video, .home-application-story__media img",
      )].map((element) => ({
        y: getComputedStyle(element).getPropertyValue("--motion-media-y").trim(),
        scale: getComputedStyle(element).getPropertyValue("--motion-media-scale").trim(),
      })),
    };
  });
  await page.close();
  await context.close();
  return { states, audit, diagnostics };
}

const openingDesktop = await captureOpening(1440, 900, "1440");
const openingMobile = await captureOpening(390, 844, "390");
const sectionsDesktop = await captureSections(1440, 900, "1440");
const sectionsMobile = await captureSections(390, 844, "390");
const reducedMotion = await captureReducedMotion();

const diagnosticsClean = [
  openingDesktop,
  openingMobile,
  sectionsDesktop,
  sectionsMobile,
  reducedMotion,
].every((item) => Object.values(item.diagnostics).every((list) => list.length === 0));
const allSectionsSettle = [sectionsDesktop, sectionsMobile]
  .every((set) => set.results.every((result) => result.settled));
const allSectionsAnimate = [sectionsDesktop, sectionsMobile]
  .every((set) => set.results.every((result) => result.changedDuringMotion));
const reducedMotionPassed = (
  reducedMotion.audit.reduceMatches
  && !reducedMotion.audit.premiumMotionClass
  && reducedMotion.audit.overflow <= 0
  && reducedMotion.audit.videoPaused
  && !reducedMotion.audit.videoAutoplay
  && reducedMotion.audit.videoControls
  && Object.values(reducedMotion.states).every(stateSettled)
  && reducedMotion.audit.mediaVariables.every((item) => item.y === "0%" && item.scale === "1")
);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: "Microsoft Edge via Playwright",
  openingDesktop,
  openingMobile,
  sectionsDesktop,
  sectionsMobile,
  reducedMotion,
  checks: {
    diagnosticsClean,
    allSectionsAnimate,
    allSectionsSettle,
    reducedMotionPassed,
    noDesktopOverflow: sectionsDesktop.audit.overflow <= 0,
    noMobileOverflow: sectionsMobile.audit.overflow <= 0,
    noBrokenImages: sectionsDesktop.audit.brokenImages === 0 && sectionsMobile.audit.brokenImages === 0,
    noHiddenTargets: sectionsDesktop.audit.hiddenAnimatedTargets === 0 && sectionsMobile.audit.hiddenAnimatedTargets === 0,
  },
};
report.allPassed = Object.values(report.checks).every(Boolean);

await writeFile(
  resolve(outputDir, "browser-qa.json"),
  JSON.stringify(report, null, 2) + "\n",
  "utf8",
);
await browser.close();

console.log(JSON.stringify({
  outputDir,
  allPassed: report.allPassed,
  checks: report.checks,
}, null, 2));

if (!report.allPassed) process.exitCode = 1;
