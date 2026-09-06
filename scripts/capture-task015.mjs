import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const outputDir = resolve("screenshots/task015");
const viewports = [1728, 1440, 1280, 1024, 768, 390];
const homeReelPath = "/assets/videos/standard/home-real-world/video.mp4";
const expectedApplicationPosters = [
  "/assets/videos/standard/sv035/poster.webp",
  "/assets/videos/standard/sv037/poster.webp",
  "/assets/videos/standard/sv054/poster.webp",
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
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

async function settlePage(page) {
  await page.addStyleTag({
    content: ".skip-link{display:none!important} *{animation-duration:0s!important;animation-delay:0s!important}",
  });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    await document.fonts.ready;
    [...document.images].forEach((image) => { image.loading = "eager"; });
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(200);
}

async function seekVideo(video, time) {
  await video.evaluate((element, targetTime) => new Promise((resolveSeek) => {
    const done = () => {
      element.removeEventListener("seeked", done);
      resolveSeek();
    };
    element.addEventListener("seeked", done, { once: true });
    element.currentTime = targetTime;
    window.setTimeout(done, 1200);
  }), time);
}

async function captureCore(page, width, filename) {
  let height = width === 390 ? 4200 : 3200;
  for (let index = 0; index < 3; index += 1) {
    await page.setViewportSize({ width, height });
    height = await page.evaluate(() => {
      const first = document.querySelector(".real-world").getBoundingClientRect();
      const last = document.querySelector(".home-applications").getBoundingClientRect();
      return Math.ceil(last.bottom - first.top);
    });
  }
  await page.setViewportSize({ width, height });
  const top = await page.evaluate(() => {
    const first = document.querySelector(".real-world").getBoundingClientRect();
    return first.top + window.scrollY;
  });
  await page.evaluate((target) => window.scrollTo(0, target), top);
  await page.waitForTimeout(100);
  await page.screenshot({ path: resolve(outputDir, filename) });
}

async function inspectViewport(width) {
  const height = width === 390 ? 844 : 1000;
  const page = await browser.newPage({ viewport: { width, height } });
  const diagnostics = bindDiagnostics(page);
  const mp4Sources = new Set();
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.endsWith(".mp4")) mp4Sources.add(pathname);
  });

  const response = await page.goto(`${baseUrl}/`, { waitUntil: "load", timeout: 20000 });
  await settlePage(page);
  const video = page.locator(".real-world video");
  await video.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const element = document.querySelector(".real-world video");
    return element && element.readyState >= 2 && element.videoWidth > 0 && element.videoHeight > 0;
  });

  const audit = await page.evaluate(({ reelPath, posters }) => {
    const viewportWidth = document.documentElement.clientWidth;
    const applicationImages = [...document.querySelectorAll(".home-application-story img")];
    const homeVideo = document.querySelector(".real-world video");
    return {
      overflow: document.documentElement.scrollWidth - viewportWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.src),
      imagesMissingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
      unnamedButtons: [...document.querySelectorAll("button")].filter((button) => (
        !button.textContent.trim()
        && !button.getAttribute("aria-label")
        && !button.getAttribute("aria-labelledby")
        && !button.getAttribute("title")
      )).length,
      videoErrors: [...document.querySelectorAll("video")]
        .filter((item) => item.error)
        .map((item) => item.error.code),
      sectionOrder: [".real-world", ".home-technology", ".home-applications"]
        .map((selector) => document.querySelector(selector)?.getBoundingClientRect().top),
      technologyLinks: document.querySelectorAll(".home-technology__platform-link").length,
      applicationPosters: applicationImages.map((image) => new URL(image.src).pathname),
      applicationVideoCount: document.querySelectorAll(".home-applications video").length,
      homeVideoSource: new URL(homeVideo.currentSrc || homeVideo.src).pathname,
      expectedReelPath: reelPath,
      expectedPosters: posters,
    };
  }, { reelPath: homeReelPath, posters: expectedApplicationPosters });

  if (width === 1440 || width === 390) {
    await video.evaluate((element) => element.pause());
    await seekVideo(video, 0.08);
    const suffix = width === 1440 ? "1440" : "390";
    await page.locator(".real-world").screenshot({ path: resolve(outputDir, width === 1440 ? "03-real-world-1440.png" : "07-real-world-390.png") });
    await page.locator(".home-technology").screenshot({ path: resolve(outputDir, width === 1440 ? "04-technology-1440.png" : "08-technology-390.png") });
    await page.locator(".home-applications").screenshot({ path: resolve(outputDir, width === 1440 ? "05-applications-1440.png" : "09-applications-390.png") });
    await captureCore(page, width, width === 1440 ? "02-after-home-core-1440.png" : "06-home-core-390.png");
    audit.captureSuffix = suffix;
  }

  await page.close();
  return {
    width,
    height,
    httpStatus: response?.status() ?? null,
    mp4Sources: [...mp4Sources],
    ...audit,
    ...diagnostics,
  };
}

const viewportResults = [];
for (const width of viewports) viewportResults.push(await inspectViewport(width));

const behaviorPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const behaviorDiagnostics = bindDiagnostics(behaviorPage);
await behaviorPage.goto(`${baseUrl}/`, { waitUntil: "load", timeout: 20000 });
await settlePage(behaviorPage);
const homeVideo = behaviorPage.locator(".real-world video");
await behaviorPage.waitForFunction(() => {
  const video = document.querySelector(".real-world video");
  return video && video.readyState >= 2 && !video.paused && video.currentTime > 0;
});
const homeInitial = await homeVideo.evaluate((video) => ({
  source: new URL(video.currentSrc || video.src).pathname,
  autoPlay: video.autoplay,
  muted: video.muted,
  loop: video.loop,
  playsInline: video.playsInline,
  controls: video.controls,
  paused: video.paused,
  error: video.error?.code || null,
}));
await behaviorPage.getByRole("button", { name: "暂停" }).click();
const pausedByControl = await homeVideo.evaluate((video) => video.paused);
await behaviorPage.getByRole("button", { name: "播放" }).click();
const resumedByControl = await homeVideo.evaluate((video) => !video.paused);
await behaviorPage.close();

const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.setViewportSize({ width: 390, height: 844 });
const reducedDiagnostics = bindDiagnostics(reducedPage);
await reducedPage.goto(`${baseUrl}/`, { waitUntil: "load", timeout: 20000 });
await settlePage(reducedPage);
const reducedVideo = reducedPage.locator(".real-world video");
await reducedVideo.waitFor({ state: "visible" });
const reducedInitial = await reducedVideo.evaluate((video) => ({
  mediaQueryMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  autoPlay: video.autoplay,
  muted: video.muted,
  loop: video.loop,
  controls: video.controls,
  paused: video.paused,
  preload: video.preload,
  poster: video.getAttribute("poster"),
  customControlCount: document.querySelectorAll(".real-world .standard-media-player__control").length,
}));
const reducedCanPlay = await reducedVideo.evaluate(async (video) => {
  await video.play().catch(() => undefined);
  return !video.paused;
});
await reducedVideo.evaluate((video) => video.pause());
await reducedPage.close();
await reducedContext.close();

const viewportChecksPassed = viewportResults.every((item) => (
  item.httpStatus === 200
  && item.overflow <= 0
  && item.brokenImages.length === 0
  && item.imagesMissingAlt === 0
  && item.unnamedButtons === 0
  && item.videoErrors.length === 0
  && item.sectionOrder.every((top, index, values) => index === 0 || top > values[index - 1])
  && item.technologyLinks === 4
  && JSON.stringify(item.applicationPosters) === JSON.stringify(expectedApplicationPosters)
  && item.applicationVideoCount === 0
  && item.homeVideoSource === homeReelPath
  && item.mp4Sources.length === 1
  && item.mp4Sources[0] === homeReelPath
  && item.consoleErrors.length === 0
  && item.pageErrors.length === 0
  && item.badResponses.length === 0
  && item.requestFailures.length === 0
));
const homepageReelPassed = (
  homeInitial.source === homeReelPath
  && homeInitial.autoPlay
  && homeInitial.muted
  && homeInitial.loop
  && homeInitial.playsInline
  && !homeInitial.controls
  && !homeInitial.paused
  && !homeInitial.error
  && pausedByControl
  && resumedByControl
  && behaviorDiagnostics.consoleErrors.length === 0
  && behaviorDiagnostics.pageErrors.length === 0
  && behaviorDiagnostics.badResponses.length === 0
  && behaviorDiagnostics.requestFailures.length === 0
);
const reducedMotionPassed = (
  reducedInitial.mediaQueryMatches
  && !reducedInitial.autoPlay
  && reducedInitial.paused
  && reducedInitial.controls
  && reducedInitial.preload === "none"
  && Boolean(reducedInitial.poster)
  && reducedInitial.customControlCount === 0
  && reducedCanPlay
  && reducedDiagnostics.consoleErrors.length === 0
  && reducedDiagnostics.pageErrors.length === 0
  && reducedDiagnostics.badResponses.length === 0
  && reducedDiagnostics.requestFailures.length === 0
);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: "Microsoft Edge via Playwright",
  viewportChecksPassed,
  homepageReelPassed,
  reducedMotionPassed,
  allPassed: viewportChecksPassed && homepageReelPassed && reducedMotionPassed,
  viewportResults,
  homepageReel: {
    initial: homeInitial,
    pausedByControl,
    resumedByControl,
    diagnostics: behaviorDiagnostics,
  },
  reducedMotion: {
    initial: reducedInitial,
    canPlay: reducedCanPlay,
    diagnostics: reducedDiagnostics,
  },
};

await writeFile(resolve(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();

console.log(JSON.stringify({
  viewportCount: viewportResults.length,
  viewportChecksPassed,
  homepageReelPassed,
  reducedMotionPassed,
  allPassed: report.allPassed,
}, null, 2));

if (!report.allPassed) process.exitCode = 1;
