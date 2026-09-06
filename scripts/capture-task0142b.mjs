import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4178";
const outputDir = resolve("screenshots/task0142b");
const routes = ["/", "/products/mantis-standard", "/applications", "/support/videos"];
const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
];
const expectedMedia = {
  "/": { posterButtons: 0, videos: 1 },
  "/products/mantis-standard": { posterButtons: 4, videos: 0 },
  "/applications": { posterButtons: 3, videos: 0 },
  "/support/videos": { posterButtons: 8, videos: 0 },
};
const mediaAssets = [
  "/assets/videos/standard/sv001/video.mp4",
  "/assets/videos/standard/sv003/video.mp4",
  "/assets/videos/standard/sv007/video.mp4",
  "/assets/videos/standard/sv010/video.mp4",
  "/assets/videos/standard/sv018/video.mp4",
  "/assets/videos/standard/sv035/video.mp4",
  "/assets/videos/standard/sv035/sv035-home-loop.mp4",
  "/assets/videos/standard/sv037/video.mp4",
  "/assets/videos/standard/sv054/video.mp4",
];
const forbiddenTerms = [
  "Mantis Pro", "Mantis Ultra", "P00001", "P00002", "P00003", "P00004", "P00005",
  "Boston Dynamics", "Schneider Electric", "FF8D", "FF16", "NEEDS CONFIRMATION",
  "MEDIA PENDING", "internal review", "内部评审", "西安电子科技大学",
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const context = await browser.newContext();
const results = [];

function bindDiagnostics(page, { expectedFailures = [] } = {}) {
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
    if (!expectedFailures.some((fragment) => request.url().includes(fragment))) {
      requestFailures.push(`${request.failure()?.errorText || "failed"} ${request.url()}`);
    }
  });
  return { consoleErrors, pageErrors, badResponses, requestFailures };
}

async function settlePage(page) {
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = "eager"; });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(350);
}

async function inspectRoute(path, viewport) {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  const diagnostics = bindDiagnostics(page);
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "load" });
  await settlePage(page);
  const audit = await page.evaluate(({ terms, expected }) => {
    const bodyText = document.body.innerText;
    const images = [...document.images];
    const players = [...document.querySelectorAll(".standard-media-player")];
    const viewportWidth = document.documentElement.clientWidth;
    return {
      title: document.title,
      overflow: document.documentElement.scrollWidth - viewportWidth,
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      imagesMissingAlt: images.filter((image) => !image.hasAttribute("alt")).length,
      unnamedButtons: [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label") && !button.getAttribute("aria-labelledby") && !button.getAttribute("title")).length,
      internalStatusCount: document.querySelectorAll(".internal-status").length,
      forbiddenVisible: terms.filter((term) => bodyText.toLowerCase().includes(term.toLowerCase())),
      mediaPlayers: players.length,
      posterButtons: document.querySelectorAll(".standard-media-player--poster").length,
      videos: document.querySelectorAll(".standard-media-player video").length,
      emptyVideoSources: [...document.querySelectorAll(".standard-media-player video")].filter((video) => !video.currentSrc && !video.getAttribute("src")).length,
      mediaOutsideViewport: players.filter((player) => {
        const rect = player.getBoundingClientRect();
        return rect.left < -0.5 || rect.right > viewportWidth + 0.5;
      }).map((player) => ({ left: player.getBoundingClientRect().left, right: player.getBoundingClientRect().right })),
      expectedMediaMatched: document.querySelectorAll(".standard-media-player--poster").length === expected.posterButtons && document.querySelectorAll(".standard-media-player video").length === expected.videos,
    };
  }, { terms: forbiddenTerms, expected: expectedMedia[path] });
  const slug = path === "/" ? "home" : path.split("/").filter(Boolean).join("-");
  await page.screenshot({ path: resolve(outputDir, `${slug}-${viewport.width}.png`), fullPage: true });
  await page.close();
  return { path, ...viewport, httpStatus: response?.status() ?? null, ...audit, ...diagnostics };
}

for (const viewport of viewports) {
  for (const path of routes) results.push(await inspectRoute(path, viewport));
}

const rangeChecks = [];
for (const asset of mediaAssets) {
  const response = await context.request.get(`${baseUrl}${asset}`, {
    headers: { Range: "bytes=0-1023" },
    failOnStatusCode: false,
  });
  rangeChecks.push({
    asset,
    status: response.status(),
    contentType: response.headers()["content-type"] || "",
    acceptRanges: response.headers()["accept-ranges"] || "",
    contentRange: response.headers()["content-range"] || "",
    bytes: (await response.body()).byteLength,
  });
}

const homePage = await context.newPage();
await homePage.setViewportSize({ width: 1440, height: 900 });
const homeDiagnostics = bindDiagnostics(homePage);
await homePage.goto(`${baseUrl}/`, { waitUntil: "load" });
const homeVideo = homePage.locator(".real-world video");
await homeVideo.waitFor({ state: "visible" });
await homePage.waitForFunction(() => {
  const video = document.querySelector(".real-world video");
  return video && video.readyState >= 2 && video.videoWidth === 1920 && video.videoHeight === 1080 && !video.paused && video.currentTime > 0;
});
const homeBefore = await homeVideo.evaluate((video) => ({
  autoPlay: video.autoplay,
  muted: video.muted,
  loop: video.loop,
  controls: video.controls,
  paused: video.paused,
  duration: video.duration,
  currentTime: video.currentTime,
  videoWidth: video.videoWidth,
  videoHeight: video.videoHeight,
  error: video.error?.code || null,
}));
await homePage.waitForTimeout(600);
const homeProgressed = await homeVideo.evaluate((video, start) => !video.paused && video.currentTime > start, homeBefore.currentTime);
await homeVideo.evaluate((video) => {
  video.currentTime = Math.max(0, video.duration - 0.18);
  return video.play();
});
await homePage.waitForTimeout(650);
const homeLooped = await homeVideo.evaluate((video) => video.currentTime < 1.5 && !video.paused);
await homePage.getByRole("button", { name: "暂停" }).click();
const homePaused = await homeVideo.evaluate((video) => video.paused);
await homePage.getByRole("button", { name: "播放" }).click();
const homeResumed = await homeVideo.evaluate((video) => !video.paused);
await homePage.close();

const centerPage = await context.newPage();
await centerPage.setViewportSize({ width: 1440, height: 900 });
const centerDiagnostics = bindDiagnostics(centerPage);
await centerPage.goto(`${baseUrl}/support/videos`, { waitUntil: "load" });
const initialPosterCount = await centerPage.locator(".standard-media-player--poster").count();
while (await centerPage.locator(".standard-media-player--poster").count()) {
  await centerPage.locator(".standard-media-player--poster").first().click();
  await centerPage.waitForTimeout(120);
}
await centerPage.waitForFunction((count) => {
  const videos = [...document.querySelectorAll(".standard-media-player video")];
  return videos.length === count && videos.every((video) => video.readyState >= 1 && video.videoWidth === 1920 && video.videoHeight === 1080);
}, initialPosterCount, { timeout: 30000 });
const activatedVideos = await centerPage.locator(".standard-media-player video").evaluateAll((videos) => videos.map((video) => ({
  source: new URL(video.currentSrc || video.src).pathname,
  readyState: video.readyState,
  paused: video.paused,
  controls: video.controls,
  duration: video.duration,
  videoWidth: video.videoWidth,
  videoHeight: video.videoHeight,
  error: video.error?.code || null,
})));
const firstVideo = centerPage.locator(".standard-media-player video").first();
await centerPage.waitForFunction(() => {
  const video = document.querySelector(".standard-media-player video");
  return video && (!video.paused || video.currentTime > 0);
}, null, { timeout: 10000 });
const clickedVideoPlayed = await firstVideo.evaluate((video) => !video.paused || video.currentTime > 0);
await firstVideo.evaluate((video) => video.pause());
const clickedVideoPaused = await firstVideo.evaluate((video) => video.paused);
await centerPage.close();

const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.setViewportSize({ width: 390, height: 844 });
const reducedDiagnostics = bindDiagnostics(reducedPage);
await reducedPage.goto(`${baseUrl}/`, { waitUntil: "load" });
await reducedPage.locator(".real-world video").waitFor({ state: "visible" });
const reducedMotion = await reducedPage.locator(".real-world video").evaluate((video) => ({
  mediaQueryMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  autoPlay: video.autoplay,
  paused: video.paused,
  controls: video.controls,
  customControlCount: document.querySelectorAll(".real-world .standard-media-player__control").length,
  poster: video.getAttribute("poster"),
}));
await reducedPage.close();
await reducedContext.close();

const fallbackPage = await context.newPage();
await fallbackPage.setViewportSize({ width: 390, height: 844 });
await fallbackPage.route("**/sv035-home-loop.mp4", (route) => route.abort("failed"));
const fallbackDiagnostics = bindDiagnostics(fallbackPage, { expectedFailures: ["sv035-home-loop.mp4"] });
await fallbackPage.goto(`${baseUrl}/`, { waitUntil: "load" });
await fallbackPage.locator(".real-world video").waitFor({ state: "visible" });
await fallbackPage.waitForTimeout(500);
const fallback = await fallbackPage.locator(".real-world video").evaluate((video) => ({
  poster: video.getAttribute("poster"),
  posterConfigured: Boolean(video.getAttribute("poster")),
  visibleHeight: video.getBoundingClientRect().height,
  networkState: video.networkState,
  error: video.error?.code || null,
}));
await fallbackPage.screenshot({ path: resolve(outputDir, "home-video-fallback-390.png"), fullPage: true });
await fallbackPage.close();

const diagnosticsPassed = [homeDiagnostics, centerDiagnostics, reducedDiagnostics, fallbackDiagnostics].every((diagnostics) => (
  diagnostics.pageErrors.length === 0 && diagnostics.badResponses.length === 0 && diagnostics.requestFailures.length === 0
));
const routeChecksPassed = results.every((item) => (
  item.httpStatus === 200
  && item.overflow <= 0
  && item.brokenImages.length === 0
  && item.imagesMissingAlt === 0
  && item.unnamedButtons === 0
  && item.internalStatusCount === 0
  && item.forbiddenVisible.length === 0
  && item.emptyVideoSources === 0
  && item.mediaOutsideViewport.length === 0
  && item.expectedMediaMatched
  && item.consoleErrors.length === 0
  && item.pageErrors.length === 0
  && item.badResponses.length === 0
  && item.requestFailures.length === 0
));
const rangeChecksPassed = rangeChecks.every((item) => (
  [200, 206].includes(item.status) && item.contentType.startsWith("video/mp4") && item.bytes > 0 && item.bytes <= 1024
));
const interactionsPassed = (
  homeBefore.autoPlay && homeBefore.muted && homeBefore.loop && !homeBefore.controls
  && homeBefore.videoWidth === 1920 && homeBefore.videoHeight === 1080 && !homeBefore.error
  && homeProgressed && homeLooped && homePaused && homeResumed
  && initialPosterCount === 8 && activatedVideos.length === 8
  && activatedVideos.every((video) => video.readyState >= 1 && video.videoWidth === 1920 && video.videoHeight === 1080 && video.controls && !video.error)
  && clickedVideoPlayed && clickedVideoPaused
  && reducedMotion.mediaQueryMatches && !reducedMotion.autoPlay && reducedMotion.paused && reducedMotion.controls && reducedMotion.customControlCount === 0
  && fallback.posterConfigured && fallback.visibleHeight > 0 && [2, 3, 4].includes(fallback.error) && fallback.networkState === 3
  && fallbackDiagnostics.consoleErrors.every((message) => message.includes("ERR_FAILED"))
  && [homeDiagnostics, centerDiagnostics, reducedDiagnostics].every((diagnostics) => diagnostics.consoleErrors.length === 0)
  && diagnosticsPassed
);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: "Microsoft Edge via Playwright",
  routeChecksPassed,
  rangeChecksPassed,
  interactionsPassed,
  allPassed: routeChecksPassed && rangeChecksPassed && interactionsPassed,
  results,
  rangeChecks,
  interactionChecks: {
    home: { initial: homeBefore, progressed: homeProgressed, looped: homeLooped, pausedByControl: homePaused, resumedByControl: homeResumed, diagnostics: homeDiagnostics },
    videoCenter: { initialPosterCount, activatedCount: activatedVideos.length, activatedVideos, clickedVideoPlayed, clickedVideoPaused, diagnostics: centerDiagnostics },
    reducedMotion: { ...reducedMotion, diagnostics: reducedDiagnostics },
    fallback: { ...fallback, diagnostics: fallbackDiagnostics },
  },
};

await writeFile(resolve(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await context.close();
await browser.close();

console.log(JSON.stringify({
  routeResultCount: results.length,
  rangeCheckCount: rangeChecks.length,
  routeChecksPassed,
  rangeChecksPassed,
  interactionsPassed,
  allPassed: report.allPassed,
}, null, 2));

if (!report.allPassed) process.exitCode = 1;
