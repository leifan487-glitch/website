import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.SHARE_BASE_URL || "http://127.0.0.1:4174";
const shareDate = process.env.SHARE_DATE || "2026-09-05";
const outputDir = resolve(`screenshots/share-${shareDate}`);

const routes = [
  { path: "/", slug: "01-home", label: "\u9996\u9875" },
  { path: "/products/mantis-standard", slug: "02-mantis-standard", label: "Mantis Standard" },
  { path: "/technology", slug: "03-technology", label: "\u6280\u672f\u4f53\u7cfb" },
  { path: "/applications", slug: "04-applications", label: "\u5e94\u7528\u65b9\u5411" },
  { path: "/about", slug: "05-about", label: "\u5173\u4e8e\u84dd\u866b\u5177\u8eab" },
  { path: "/news", slug: "06-progress", label: "\u516c\u53f8\u8fdb\u5c55" },
  { path: "/contact", slug: "07-contact", label: "\u8054\u7cfb\u6211\u4eec" },
  { path: "/inquiry", slug: "08-business-inquiry", label: "\u5546\u52a1\u8be2\u76d8" },
  { path: "/support", slug: "09-support", label: "\u652f\u6301\u4e2d\u5fc3" },
  { path: "/support/videos", slug: "10-video-center", label: "\u89c6\u9891\u4e2d\u5fc3" },
  { path: "/policy/privacy", slug: "11-privacy", label: "\u9690\u79c1\u653f\u7b56" },
  { path: "/policy/terms", slug: "12-terms", label: "\u7f51\u7ad9\u6761\u6b3e" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
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

async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(480, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolveScroll) => window.setTimeout(resolveScroll, 70));
    }
    window.scrollTo(0, 0);
  });
}

async function settlePage(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    [...document.images].forEach((image) => { image.loading = "eager"; });
    await document.fonts.ready;
  });
  await scrollThroughPage(page);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
  });

  const homeVideo = page.locator(".real-world video");
  if (await homeVideo.count()) {
    await homeVideo.evaluate((video) => {
      video.pause();
      video.currentTime = 1.5;
    }).catch(() => undefined);
    await page.waitForTimeout(250);
  }

  await page.addStyleTag({
    content: `
      .skip-link { display: none !important; }
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
  await page.waitForTimeout(150);
}

async function gotoWithRetry(page, url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) await page.waitForTimeout(500 * attempt);
    }
  }
  throw lastError;
}

async function captureRoute(route, viewport) {
  const page = await browser.newPage({ viewport });
  const diagnostics = bindDiagnostics(page);
  const response = await gotoWithRetry(page, `${baseUrl}${route.path}`);

  await settlePage(page);
  if (route.path === "/products/mantis-standard") {
    const collapsedQuestions = page.locator('.standard-qa__list button[aria-expanded="false"]');
    const questionCount = await collapsedQuestions.count();
    for (let index = 0; index < questionCount; index += 1) {
      await collapsedQuestions.nth(0).click();
    }
    await scrollThroughPage(page);
    await page.waitForTimeout(100);
  }

  const audit = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim() || "",
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    brokenImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    internalStatusCount: document.querySelectorAll(".internal-status").length,
  }));

  const filename = `${route.slug}-${viewport.name}-full.png`;
  await page.screenshot({ path: resolve(outputDir, filename), fullPage: true });
  await page.close();

  return {
    ...route,
    viewport: viewport.name,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    filename,
    httpStatus: response?.status() ?? null,
    finalPath: new URL(response?.url() || `${baseUrl}${route.path}`).pathname,
    overflow: audit.scrollWidth - audit.width,
    ...audit,
    ...diagnostics,
  };
}

const results = [];
for (const viewport of viewports) {
  for (const route of routes) {
    results.push(await captureRoute(route, viewport));
  }
}

const allPassed = results.every((result) => (
  result.httpStatus === 200
  && result.finalPath === result.path
  && result.overflow <= 0
  && result.brokenImages.length === 0
  && result.internalStatusCount === 0
  && result.consoleErrors.length === 0
  && result.pageErrors.length === 0
  && result.badResponses.length === 0
  && result.requestFailures.length === 0
));

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  shareDate,
  productionPublic: true,
  browser: "Microsoft Edge via Playwright",
  routeCount: routes.length,
  screenshotCount: results.length,
  allPassed,
  routes,
  results,
};

await writeFile(
  resolve(outputDir, "capture-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

await browser.close();

console.log(JSON.stringify({
  outputDir,
  routeCount: routes.length,
  screenshotCount: results.length,
  allPassed,
}, null, 2));

if (!allPassed) process.exitCode = 1;
