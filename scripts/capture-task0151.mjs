import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4174";
const outputDir = resolve("screenshots/task0151/public");
const viewports = [1728, 1440, 1280, 1024, 768, 390];
const homeReelPath = "/assets/videos/standard/home-real-world/video.mp4";
const expectedApplicationPosters = [
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
  "审批",
  "治理",
];
const reelMoments = [
  { id: "sv010", time: 1.5, sourceTime: 4, task: "Dual-arm operation" },
  { id: "sv018", time: 5, sourceTime: 8, task: "Object manipulation" },
  { id: "sv054", time: 9, sourceTime: 10, task: "Industrial equipment operation" },
  { id: "sv007", time: 12.5, sourceTime: 3.5, task: "Product system transition" },
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

async function waitForHomeVideo(page) {
  const video = page.locator(".real-world video");
  await video.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const element = document.querySelector(".real-world video");
    return element && element.readyState >= 2 && element.videoWidth > 0 && element.videoHeight > 0;
  });
  return video;
}

async function seekVideo(video, time) {
  await video.evaluate((element, targetTime) => new Promise((resolveSeek) => {
    const done = () => {
      element.removeEventListener("seeked", done);
      resolveSeek();
    };
    element.addEventListener("seeked", done, { once: true });
    element.currentTime = targetTime;
    window.setTimeout(done, 1500);
  }), time);
}

async function captureCore(page, width, filename) {
  let height = width === 390 ? 4000 : 3100;
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

async function capturePublicSections(page, width, video) {
  await video.evaluate((element) => element.pause());
  await seekVideo(video, 1.5);
  const suffix = String(width);
  const number = width === 1440 ? ["01", "02", "03", "04"] : ["05", "06", "07", "08"];
  await page.locator(".real-world").screenshot({ path: resolve(outputDir, `${number[0]}-real-world-${suffix}.png`) });
  await page.locator(".home-technology").screenshot({ path: resolve(outputDir, `${number[1]}-technology-${suffix}.png`) });
  await page.locator(".home-applications").screenshot({ path: resolve(outputDir, `${number[2]}-applications-${suffix}.png`) });
  await captureCore(page, width, `${number[3]}-core-${suffix}.png`);
}

async function captureMobileReelMoments(page, video) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".real-world__frame").scrollIntoViewIfNeeded();
  for (let index = 0; index < reelMoments.length; index += 1) {
    const moment = reelMoments[index];
    await seekVideo(video, moment.time);
    await page.waitForTimeout(80);
    await page.locator(".real-world__frame").screenshot({
      path: resolve(outputDir, `${String(index + 9).padStart(2, "0")}-reel-${moment.id}-390.png`),
    });
  }
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
  const video = await waitForHomeVideo(page);

  const audit = await page.evaluate(({ reelPath, posters, forbiddenTerms }) => {
    const viewportWidth = document.documentElement.clientWidth;
    const applicationImages = [...document.querySelectorAll(".home-application-story img")];
    const homeVideo = document.querySelector(".real-world video");
    const frame = document.querySelector(".real-world__frame").getBoundingClientRect();
    const technologyLinks = [...document.querySelectorAll(".home-technology__platform-link")];
    const bodyText = document.body.textContent || "";
    const sectionHeights = Object.fromEntries(
      ["real-world", "home-technology", "home-applications"].map((className) => [
        className,
        Math.round(document.querySelector(`.${className}`).getBoundingClientRect().height),
      ]),
    );
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
      sectionHeights,
      technologyLinks: technologyLinks.length,
      technologyLinksKeyboardReachable: technologyLinks.every((link) => link.tabIndex >= 0),
      applicationPosters: applicationImages.map((image) => new URL(image.src).pathname),
      applicationVideoCount: document.querySelectorAll(".home-applications video").length,
      homeVideoSource: new URL(homeVideo.currentSrc || homeVideo.src).pathname,
      expectedReelPath: reelPath,
      expectedPosters: posters,
      reelAspectRatio: Number((frame.width / frame.height).toFixed(3)),
      forbiddenPublicTerms: forbiddenTerms.filter((term) => bodyText.includes(term)),
      internalStatusCount: document.querySelectorAll(".internal-status").length,
    };
  }, { reelPath: homeReelPath, posters: expectedApplicationPosters, forbiddenTerms: forbiddenPublicTerms });

  if (width === 1440 || width === 390) {
    await capturePublicSections(page, width, video);
    if (width === 390) await captureMobileReelMoments(page, video);
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
const homeVideo = await waitForHomeVideo(behaviorPage);
await behaviorPage.waitForFunction(() => {
  const video = document.querySelector(".real-world video");
  return video && !video.paused && video.currentTime > 0;
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

const viewportChecksPassed = viewportResults.every((item) => {
  const expectedAspectRatio = item.width === 390 ? 0.8 : 1.778;
  return (
    item.httpStatus === 200
    && item.overflow <= 0
    && item.brokenImages.length === 0
    && item.imagesMissingAlt === 0
    && item.unnamedButtons === 0
    && item.videoErrors.length === 0
    && item.sectionOrder.every((top, index, values) => index === 0 || top > values[index - 1])
    && item.technologyLinks === 4
    && item.technologyLinksKeyboardReachable
    && JSON.stringify(item.applicationPosters) === JSON.stringify(expectedApplicationPosters)
    && item.applicationVideoCount === 0
    && item.homeVideoSource === homeReelPath
    && item.mp4Sources.length === 1
    && item.mp4Sources[0] === homeReelPath
    && Math.abs(item.reelAspectRatio - expectedAspectRatio) <= 0.02
    && item.forbiddenPublicTerms.length === 0
    && item.internalStatusCount === 0
    && item.consoleErrors.length === 0
    && item.pageErrors.length === 0
    && item.badResponses.length === 0
    && item.requestFailures.length === 0
  );
});
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
  productionPublic: true,
  viewportChecksPassed,
  homepageReelPassed,
  reducedMotionPassed,
  allPassed: viewportChecksPassed && homepageReelPassed && reducedMotionPassed,
  reelMoments,
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
