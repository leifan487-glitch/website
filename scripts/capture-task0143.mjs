import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4179";
const outputDir = resolve("screenshots/task0143");
const homeReelPath = "/assets/videos/standard/home-real-world/video.mp4";
const routeCases = [
  { path: "/", slug: "home", width: 1728, height: 1000, posterButtons: 0, videos: 1 },
  { path: "/", slug: "home", width: 1440, height: 900, posterButtons: 0, videos: 1 },
  { path: "/", slug: "home", width: 1024, height: 900, posterButtons: 0, videos: 1 },
  { path: "/", slug: "home", width: 768, height: 900, posterButtons: 0, videos: 1 },
  { path: "/", slug: "home", width: 390, height: 844, posterButtons: 0, videos: 1 },
  { path: "/products/mantis-standard", slug: "standard", width: 1440, height: 900, posterButtons: 4, videos: 0 },
  { path: "/products/mantis-standard", slug: "standard", width: 390, height: 844, posterButtons: 4, videos: 0 },
  { path: "/applications", slug: "applications", width: 1440, height: 900, posterButtons: 3, videos: 0 },
  { path: "/applications", slug: "applications", width: 390, height: 844, posterButtons: 3, videos: 0 },
  { path: "/support/videos", slug: "video-center", width: 1440, height: 900, posterButtons: 8, videos: 0 },
  { path: "/support/videos", slug: "video-center", width: 390, height: 844, posterButtons: 8, videos: 0 },
  { path: "/inquiry", slug: "inquiry", width: 1440, height: 900, posterButtons: 0, videos: 0 },
  { path: "/inquiry", slug: "inquiry", width: 390, height: 844, posterButtons: 0, videos: 0 },
];
const mediaAssets = [
  "/assets/videos/standard/sv001/video.mp4",
  "/assets/videos/standard/sv003/video.mp4",
  "/assets/videos/standard/sv007/video.mp4",
  "/assets/videos/standard/sv010/video.mp4",
  "/assets/videos/standard/sv018/video.mp4",
  "/assets/videos/standard/sv035/video.mp4",
  "/assets/videos/standard/sv037/video.mp4",
  "/assets/videos/standard/sv054/video.mp4",
  homeReelPath,
];
const forbiddenTerms = [
  "Mantis Pro", "Mantis Ultra", "P00001", "P00002", "P00003", "P00004", "P00005",
  "Boston Dynamics", "Schneider Electric", "西安电子科技大学", "西安交通大学", "丛尧",
  "FF8D-Hand", "FF16D-Hand", "世界排名", "奖金", "22项授权专利", "NEEDS CONFIRMATION",
  "MEDIA PENDING", "internal review", "内部评审",
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const context = await browser.newContext();

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
  await page.waitForTimeout(300);
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

async function sampleVideoFrame(video) {
  return video.evaluate((element) => {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 54;
    const drawing = canvas.getContext("2d", { willReadFrequently: true });
    drawing.drawImage(element, 0, 0, canvas.width, canvas.height);
    const pixels = drawing.getImageData(0, 0, canvas.width, canvas.height).data;
    let luminanceTotal = 0;
    let blackPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const luminance = (pixels[index] * 0.2126) + (pixels[index + 1] * 0.7152) + (pixels[index + 2] * 0.0722);
      luminanceTotal += luminance;
      if (luminance < 8) blackPixels += 1;
    }
    const pixelCount = pixels.length / 4;
    return {
      averageLuminance: Number((luminanceTotal / pixelCount).toFixed(2)),
      blackPixelRatio: Number((blackPixels / pixelCount).toFixed(4)),
    };
  });
}

async function inspectRoute(routeCase) {
  const page = await context.newPage();
  await page.setViewportSize({ width: routeCase.width, height: routeCase.height });
  const diagnostics = bindDiagnostics(page);
  const mp4Sources = new Set();
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.endsWith(".mp4")) mp4Sources.add(pathname);
  });

  const response = await page.goto(`${baseUrl}${routeCase.path}`, { waitUntil: "load" });
  if (routeCase.path === "/") {
    const video = page.locator(".real-world video");
    await video.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const element = document.querySelector(".real-world video");
      return element && element.readyState >= 2 && element.videoWidth === 1920 && element.videoHeight === 1080;
    });
    await seekVideo(video, 6.5);
  }
  await settlePage(page);

  const audit = await page.evaluate(({ expected, terms }) => {
    const bodyText = document.body.innerText;
    const images = [...document.images];
    const players = [...document.querySelectorAll(".standard-media-player")];
    const viewportWidth = document.documentElement.clientWidth;
    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      overflow: document.documentElement.scrollWidth - viewportWidth,
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      imagesMissingAlt: images.filter((image) => !image.hasAttribute("alt")).length,
      unnamedButtons: [...document.querySelectorAll("button")].filter((button) => (
        !button.textContent.trim()
        && !button.getAttribute("aria-label")
        && !button.getAttribute("aria-labelledby")
        && !button.getAttribute("title")
      )).length,
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
      expectedMediaMatched: (
        document.querySelectorAll(".standard-media-player--poster").length === expected.posterButtons
        && document.querySelectorAll(".standard-media-player video").length === expected.videos
      ),
      inquiryHeadingMatched: expected.path !== "/inquiry" || document.querySelector("h1")?.textContent.trim() === "商务询盘",
    };
  }, { expected: routeCase, terms: forbiddenTerms });

  await page.screenshot({ path: resolve(outputDir, `${routeCase.slug}-${routeCase.width}.png`), fullPage: true });
  if (routeCase.path === "/" && [1440, 390].includes(routeCase.width)) {
    await page.locator(".real-world").screenshot({ path: resolve(outputDir, `home-real-world-${routeCase.width}.png`) });
  }
  await page.close();
  return { ...routeCase, httpStatus: response?.status() ?? null, mp4Sources: [...mp4Sources], ...audit, ...diagnostics };
}

const routeResults = [];
for (const routeCase of routeCases) routeResults.push(await inspectRoute(routeCase));

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
const homeMp4Sources = new Set();
homePage.on("request", (request) => {
  const pathname = new URL(request.url()).pathname;
  if (pathname.endsWith(".mp4")) homeMp4Sources.add(pathname);
});
await homePage.goto(`${baseUrl}/`, { waitUntil: "load" });
const homeVideo = homePage.locator(".real-world video");
await homeVideo.waitFor({ state: "visible" });
await homePage.waitForFunction(() => {
  const video = document.querySelector(".real-world video");
  return video && video.readyState >= 2 && video.videoWidth === 1920 && video.videoHeight === 1080 && !video.paused && video.currentTime > 0;
});
const homeInitial = await homeVideo.evaluate((video) => ({
  source: new URL(video.currentSrc || video.src).pathname,
  autoPlay: video.autoplay,
  muted: video.muted,
  loop: video.loop,
  playsInline: video.playsInline,
  controls: video.controls,
  paused: video.paused,
  duration: video.duration,
  videoWidth: video.videoWidth,
  videoHeight: video.videoHeight,
  error: video.error?.code || null,
}));
await homeVideo.evaluate((video) => video.pause());
await seekVideo(homeVideo, 0.08);
const firstFrame = await sampleVideoFrame(homeVideo);
await seekVideo(homeVideo, Math.max(0, homeInitial.duration - 0.08));
const lastFrame = await sampleVideoFrame(homeVideo);
await homeVideo.evaluate((video) => {
  video.currentTime = Math.max(0, video.duration - 0.18);
  return video.play();
});
await homePage.waitForTimeout(750);
const looped = await homeVideo.evaluate((video) => video.currentTime < 1.5 && !video.paused);
await homePage.getByRole("button", { name: "暂停" }).click();
const pausedByControl = await homeVideo.evaluate((video) => video.paused);
await homePage.getByRole("button", { name: "播放" }).click();
const resumedByControl = await homeVideo.evaluate((video) => !video.paused);
await homePage.close();

const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.setViewportSize({ width: 390, height: 844 });
const reducedDiagnostics = bindDiagnostics(reducedPage);
await reducedPage.goto(`${baseUrl}/`, { waitUntil: "load" });
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
await reducedPage.locator(".real-world").screenshot({ path: resolve(outputDir, "home-real-world-reduced-motion-390.png") });
await reducedPage.close();
await reducedContext.close();

const fallbackPage = await context.newPage();
await fallbackPage.setViewportSize({ width: 390, height: 844 });
await fallbackPage.route(`**${homeReelPath}`, (route) => route.abort("failed"));
const fallbackDiagnostics = bindDiagnostics(fallbackPage, { expectedFailures: [homeReelPath] });
await fallbackPage.goto(`${baseUrl}/`, { waitUntil: "load" });
const fallbackVideo = fallbackPage.locator(".real-world video");
await fallbackVideo.waitFor({ state: "visible" });
await fallbackPage.waitForTimeout(500);
const fallback = await fallbackVideo.evaluate((video) => ({
  poster: video.getAttribute("poster"),
  posterConfigured: Boolean(video.getAttribute("poster")),
  visibleHeight: video.getBoundingClientRect().height,
  networkState: video.networkState,
  error: video.error?.code || null,
}));
await fallbackPage.locator(".real-world").screenshot({ path: resolve(outputDir, "home-real-world-fallback-390.png") });
await fallbackPage.close();

const contactPage = await context.newPage();
await contactPage.setViewportSize({ width: 1440, height: 900 });
const contactDiagnostics = bindDiagnostics(contactPage);
await contactPage.goto(`${baseUrl}/contact`, { waitUntil: "load" });
const contactTrigger = contactPage.getByRole("button", { name: "联系我们", exact: true });
const contactMenu = contactPage.locator("#contact-navigation");
await contactTrigger.hover();
await contactMenu.waitFor({ state: "visible" });
const hoverOpened = await contactTrigger.getAttribute("aria-expanded");
const triggerBox = await contactTrigger.boundingBox();
const menuBox = await contactMenu.boundingBox();
if (triggerBox && menuBox) {
  await contactPage.mouse.move(triggerBox.x + (triggerBox.width / 2), triggerBox.y + triggerBox.height - 1);
  await contactPage.mouse.move(menuBox.x + (menuBox.width / 2), menuBox.y + 2, { steps: 8 });
}
await contactPage.waitForTimeout(100);
const safeAreaOpen = await contactTrigger.getAttribute("aria-expanded");
const contactItems = await contactMenu.getByRole("link").evaluateAll((links) => links.map((link) => ({
  label: link.textContent.trim().replace("→", "").trim(),
  href: link.getAttribute("href"),
})));
await contactPage.screenshot({ path: resolve(outputDir, "contact-dropdown-1440.png") });
await contactPage.keyboard.press("Escape");
const escapeClosed = await contactTrigger.getAttribute("aria-expanded");
const escapeFocusReturned = await contactTrigger.evaluate((element) => element === document.activeElement);

await contactPage.mouse.move(10, 500);
await contactPage.waitForTimeout(300);
await contactTrigger.click();
const clickOpened = await contactTrigger.getAttribute("aria-expanded");
await contactTrigger.click();
const clickClosed = await contactTrigger.getAttribute("aria-expanded");

await contactPage.mouse.move(10, 500);
await contactPage.waitForTimeout(300);
await contactTrigger.focus();
await contactPage.keyboard.press("Enter");
const enterOpened = await contactTrigger.getAttribute("aria-expanded");
await contactPage.keyboard.press("Escape");
await contactPage.keyboard.press("Space");
const spaceOpened = await contactTrigger.getAttribute("aria-expanded");
await contactPage.mouse.click(20, 500);
const outsideClosed = await contactTrigger.getAttribute("aria-expanded");

await contactTrigger.focus();
await contactPage.keyboard.press("Enter");
await contactMenu.getByRole("link", { name: "商务询盘", exact: true }).click();
await contactPage.waitForURL("**/inquiry");
const desktopRouteClosed = await contactTrigger.getAttribute("aria-expanded");
await contactPage.close();

const mobilePage = await context.newPage();
await mobilePage.setViewportSize({ width: 390, height: 844 });
const mobileDiagnostics = bindDiagnostics(mobilePage);
await mobilePage.goto(`${baseUrl}/contact`, { waitUntil: "load" });
await mobilePage.getByRole("button", { name: "菜单", exact: true }).click();
const mobileContactTrigger = mobilePage.getByRole("button", { name: "联系我们", exact: true });
await mobileContactTrigger.click();
const mobileContactMenu = mobilePage.locator("#contact-navigation");
await mobileContactMenu.waitFor({ state: "visible" });
const mobileOpened = await mobileContactTrigger.getAttribute("aria-expanded");
const mobileRowHeights = await mobileContactMenu.getByRole("link").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
await mobilePage.screenshot({ path: resolve(outputDir, "contact-accordion-390.png") });
await mobileContactMenu.getByRole("link", { name: "商务询盘", exact: true }).click();
await mobilePage.waitForURL("**/inquiry");
const mobileRouteClosed = await mobilePage.locator('button[aria-controls="contact-navigation"]').getAttribute("aria-expanded");
const mobileMenuClosed = await mobilePage.locator(".navbar").getAttribute("data-open");
await mobilePage.close();

const routeChecksPassed = routeResults.every((item) => (
  item.httpStatus === 200
  && item.h1Count === 1
  && item.overflow <= 0
  && item.brokenImages.length === 0
  && item.imagesMissingAlt === 0
  && item.unnamedButtons === 0
  && item.internalStatusCount === 0
  && item.forbiddenVisible.length === 0
  && item.emptyVideoSources === 0
  && item.mediaOutsideViewport.length === 0
  && item.expectedMediaMatched
  && item.inquiryHeadingMatched
  && item.consoleErrors.length === 0
  && item.pageErrors.length === 0
  && item.badResponses.length === 0
  && item.requestFailures.length === 0
  && (item.path !== "/" || (item.mp4Sources.length === 1 && item.mp4Sources[0] === homeReelPath))
));
const rangeChecksPassed = rangeChecks.every((item) => (
  item.status === 206
  && item.contentType.startsWith("video/mp4")
  && item.acceptRanges.toLowerCase() === "bytes"
  && item.contentRange.startsWith("bytes 0-1023/")
  && item.bytes === 1024
));
const homeBehaviorPassed = (
  homeInitial.source === homeReelPath
  && homeInitial.autoPlay
  && homeInitial.muted
  && homeInitial.loop
  && homeInitial.playsInline
  && !homeInitial.controls
  && homeInitial.duration >= 14
  && homeInitial.duration <= 18
  && homeInitial.videoWidth === 1920
  && homeInitial.videoHeight === 1080
  && !homeInitial.error
  && homeMp4Sources.size === 1
  && homeMp4Sources.has(homeReelPath)
  && firstFrame.averageLuminance > 12
  && lastFrame.averageLuminance > 12
  && firstFrame.blackPixelRatio < 0.75
  && lastFrame.blackPixelRatio < 0.75
  && looped
  && pausedByControl
  && resumedByControl
  && homeDiagnostics.consoleErrors.length === 0
  && homeDiagnostics.pageErrors.length === 0
  && homeDiagnostics.badResponses.length === 0
  && homeDiagnostics.requestFailures.length === 0
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
const fallbackPassed = (
  fallback.posterConfigured
  && fallback.visibleHeight > 0
  && [2, 3, 4].includes(fallback.error)
  && fallback.networkState === 3
  && fallbackDiagnostics.pageErrors.length === 0
  && fallbackDiagnostics.badResponses.length === 0
  && fallbackDiagnostics.requestFailures.length === 0
  && fallbackDiagnostics.consoleErrors.every((message) => message.includes("ERR_FAILED"))
);
const contactNavigationPassed = (
  hoverOpened === "true"
  && safeAreaOpen === "true"
  && JSON.stringify(contactItems) === JSON.stringify([
    { label: "联系我们", href: "/contact" },
    { label: "商务询盘", href: "/inquiry" },
  ])
  && escapeClosed === "false"
  && escapeFocusReturned
  && clickOpened === "true"
  && clickClosed === "false"
  && enterOpened === "true"
  && spaceOpened === "true"
  && outsideClosed === "false"
  && desktopRouteClosed === "false"
  && mobileOpened === "true"
  && mobileRowHeights.every((height) => height >= 44)
  && mobileRouteClosed === "false"
  && mobileMenuClosed === "false"
  && [contactDiagnostics, mobileDiagnostics].every((diagnostics) => (
    diagnostics.consoleErrors.length === 0
    && diagnostics.pageErrors.length === 0
    && diagnostics.badResponses.length === 0
    && diagnostics.requestFailures.length === 0
  ))
);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: "Microsoft Edge via Playwright",
  routeChecksPassed,
  rangeChecksPassed,
  homeBehaviorPassed,
  reducedMotionPassed,
  fallbackPassed,
  contactNavigationPassed,
  allPassed: routeChecksPassed && rangeChecksPassed && homeBehaviorPassed && reducedMotionPassed && fallbackPassed && contactNavigationPassed,
  routeResults,
  rangeChecks,
  homepage: {
    initial: homeInitial,
    uniqueMp4Sources: [...homeMp4Sources],
    firstFrame,
    lastFrame,
    looped,
    pausedByControl,
    resumedByControl,
    diagnostics: homeDiagnostics,
  },
  reducedMotion: { initial: reducedInitial, canPlay: reducedCanPlay, diagnostics: reducedDiagnostics },
  fallback: { ...fallback, diagnostics: fallbackDiagnostics },
  contactNavigation: {
    desktop: {
      hoverOpened,
      safeAreaOpen,
      contactItems,
      escapeClosed,
      escapeFocusReturned,
      clickOpened,
      clickClosed,
      enterOpened,
      spaceOpened,
      outsideClosed,
      routeClosed: desktopRouteClosed,
      diagnostics: contactDiagnostics,
    },
    mobile: {
      opened: mobileOpened,
      rowHeights: mobileRowHeights,
      routeClosed: mobileRouteClosed,
      menuClosed: mobileMenuClosed,
      diagnostics: mobileDiagnostics,
    },
  },
};

await writeFile(resolve(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await context.close();
await browser.close();

console.log(JSON.stringify({
  routeResultCount: routeResults.length,
  rangeCheckCount: rangeChecks.length,
  routeChecksPassed,
  rangeChecksPassed,
  homeBehaviorPassed,
  reducedMotionPassed,
  fallbackPassed,
  contactNavigationPassed,
  allPassed: report.allPassed,
}, null, 2));

if (!report.allPassed) process.exitCode = 1;
