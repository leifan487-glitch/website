const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDirectory = join(__dirname, "..", "screenshots", "task017");
const coreRoutes = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/inquiry"];
const additionalRoutes = ["/news", "/support", "/support/videos", "/policy/privacy", "/policy/terms"];
const viewports = [1728, 1440, 1280, 1024, 768, 390].map((width) => ({ width, height: width <= 768 ? 844 : 1000 }));
const forbiddenText = [
  /\bTODO\b/i,
  /\bSOURCE\b/i,
  /\bPRIVATE\b/i,
  /\bINTERNAL\b/i,
  /NEEDS CONFIRMATION/i,
  /HIGH RISK/i,
  /Backend Pending/i,
  /测试邮箱/,
  /假电话/,
  /[A-Z]:\\/,
  /localhost|127\.0\.0\.1/i,
];

async function scrollPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(500, Math.floor(innerHeight * 0.8));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      scrollTo(0, top);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    scrollTo(0, 0);
  });
}

async function auditRoute(browser, route, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "unknown" }));
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
  await scrollPage(page);
  const result = await page.evaluate((patterns) => {
    const bodyText = document.body.innerText;
    return {
      title: document.title,
      h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() || null,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      forbidden: patterns.filter((pattern) => new RegExp(pattern.source, pattern.flags).test(bodyText)).map((pattern) => pattern.source),
      badHrefs: [...document.querySelectorAll("a")].map((anchor) => anchor.getAttribute("href")).filter((href) => !href || href === "#" || /localhost|127\.0\.0\.1/i.test(href)),
    };
  }, forbiddenText.map((pattern) => ({ source: pattern.source, flags: pattern.flags })));
  await context.close();
  return { route, viewport, status: response?.status() || null, consoleErrors, pageErrors, failedRequests, ...result };
}

async function auditInteractions(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const mp4Requests = [];
  page.on("request", (request) => { if (/\.mp4(?:\?|$)/.test(request.url())) mp4Requests.push(request.url()); });
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(250);
  const initialMp4Requests = mp4Requests.length;
  await page.locator(".real-world").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const reel = await page.locator(".real-world video").evaluate((video) => ({ src: video.currentSrc, paused: video.paused, muted: video.muted, loop: video.loop, playsInline: video.playsInline }));
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(250);
  const reelPausedOffscreen = await page.locator(".real-world video").evaluate((video) => video.paused);

  await page.getByRole("button", { name: "产品" }).click();
  const productMenuOpen = await page.getByRole("button", { name: "产品" }).getAttribute("aria-expanded");
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/inquiry`, { waitUntil: "load" });
  const inquiry = {
    disabled: await mobilePage.getByRole("button", { name: "暂未开放" }).isDisabled(),
    status: await mobilePage.locator(".inquiry-form__status").innerText(),
  };
  await mobilePage.getByRole("button", { name: "菜单" }).click();
  const mobileMenuOpen = await mobilePage.getByRole("button", { name: "关闭" }).getAttribute("aria-expanded");
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "load" });
  const reducedMotion = await mobilePage.evaluate(() => ({
    media: matchMedia("(prefers-reduced-motion: reduce)").matches,
    htmlBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  await mobileContext.close();

  return { initialMp4Requests, loadedMp4Requests: mp4Requests.length, reel, reelPausedOffscreen, productMenuOpen, inquiry, mobileMenuOpen, reducedMotion };
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  const matrix = [];
  for (const viewport of viewports) {
    for (const route of coreRoutes) matrix.push(await auditRoute(browser, route, viewport));
  }
  for (const route of additionalRoutes) matrix.push(await auditRoute(browser, route, { width: 1440, height: 1000 }));
  const interactions = await auditInteractions(browser);
  await browser.close();

  const failures = matrix.filter((item) => item.status !== 200 || item.overflow || item.brokenImages.length || item.consoleErrors.length || item.pageErrors.length || item.failedRequests.length || item.forbidden.length || item.badHrefs.length);
  const allPassed = failures.length === 0
    && interactions.initialMp4Requests === 0
    && interactions.loadedMp4Requests > 0
    && interactions.reel.src.endsWith(".mp4")
    && interactions.reel.muted
    && interactions.reel.loop
    && interactions.reel.playsInline
    && interactions.reelPausedOffscreen
    && interactions.productMenuOpen === "true"
    && interactions.inquiry.disabled
    && interactions.mobileMenuOpen === "true"
    && interactions.reducedMotion.media;
  const report = { generatedAt: new Date().toISOString(), baseUrl, environment: "LOCAL PRODUCTION PREVIEW", allPassed, matrix, interactions, failures };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ allPassed, runs: matrix.length, failures, interactions }, null, 2));
  if (!allPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
