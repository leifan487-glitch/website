const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDir = join(__dirname, "..", "screenshots", "task0157-r2");
const routes = [
  { path: "/support/videos", slug: "video-center", widths: [1440, 1024, 768, 390] },
  { path: "/about", slug: "about", widths: [1440, 1024, 768, 390] },
];
const heights = { 1440: 900, 1024: 768, 768: 900, 390: 844 };

async function primeLazyMedia(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.82));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo(0, top);
      await new Promise((resolve) => window.setTimeout(resolve, 35));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(350);
}

function boxesOverlap(a, b) {
  if (!a || !b) return null;
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

async function inspect(page, route, width, errors) {
  const result = await page.evaluate(({ routePath, viewportWidth }) => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        pageTop: box.top + window.scrollY,
        pageBottom: box.bottom + window.scrollY,
      };
    };
    return {
      route: routePath,
      width: viewportWidth,
      title: document.title,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      headings: [...document.querySelectorAll("h1, h2")].map((node) => node.textContent.trim().replace(/\s+/g, " ")),
      hero: routePath === "/support/videos" ? {
        section: rect(".page-hero--video"),
        heading: rect(".page-hero--video h1"),
        eyebrow: rect(".page-hero--video .eyebrow"),
        intro: rect(".page-hero--video .page-hero__intro"),
      } : null,
      aboutBelief: routePath === "/about" ? {
        section: rect(".about-belief"),
        copy: rect(".about-belief__copy"),
        heading: rect(".about-belief h2"),
        lead: rect(".about-belief__lead"),
        media: rect(".about-belief__media"),
        image: rect(".about-belief__media img"),
      } : null,
    };
  }, { routePath: route.path, viewportWidth: width });

  if (result.aboutBelief) {
    result.aboutBelief.headingOverlapsImage = boxesOverlap(result.aboutBelief.heading, result.aboutBelief.image);
    result.aboutBelief.copyOverlapsMedia = boxesOverlap(result.aboutBelief.copy, result.aboutBelief.media);
  }
  result.errors = errors;
  return result;
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  const report = { browser: "Microsoft Edge via Playwright", baseUrl, captures: [], interactions: {}, errors: [] };

  for (const route of routes) {
    for (const width of route.widths) {
      const context = await browser.newContext({
        viewport: { width, height: heights[width] },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") pageErrors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => pageErrors.push(`page: ${error.message}`));

      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(650);
      await primeLazyMedia(page);
      await page.screenshot({ path: join(outputDir, `${route.slug}-${width}.png`), fullPage: true });

      if ([1440, 390].includes(width)) {
        const selector = route.path === "/support/videos" ? ".page-hero--video" : ".about-belief";
        await page.locator(selector).first().screenshot({ path: join(outputDir, `${route.slug}-focus-${width}.png`) });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(80);
      }

      report.captures.push(await inspect(page, route, width, pageErrors));
      report.errors.push(...pageErrors.map((message) => `${route.path} ${width}: ${message}`));
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/support/videos`, { waitUntil: "load", timeout: 30000 });
  await page.getByRole("button", { name: /^任务操作/ }).click();
  report.interactions.videoFilter = {
    pressed: await page.getByRole("button", { name: /^任务操作/ }).getAttribute("aria-pressed"),
    visibleCards: await page.locator(".video-library__grid .video-card").count(),
  };
  await context.close();
  await browser.close();

  report.allPassed = report.errors.length === 0
    && report.captures.every((item) => !item.overflow && item.brokenImages.length === 0)
    && report.captures.filter((item) => item.aboutBelief).every((item) => item.aboutBelief.headingOverlapsImage === false && item.aboutBelief.copyOverlapsMedia === false)
    && report.interactions.videoFilter.pressed === "true"
    && report.interactions.videoFilter.visibleCards === 3;

  await writeFile(join(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    outputDir,
    captures: report.captures.length,
    allPassed: report.allPassed,
    errors: report.errors.length,
    overflow: report.captures.filter((item) => item.overflow).map((item) => `${item.route}@${item.width}`),
    overlaps: report.captures.filter((item) => item.aboutBelief && (item.aboutBelief.headingOverlapsImage || item.aboutBelief.copyOverlapsMedia)).map((item) => item.width),
    brokenImages: report.captures.reduce((total, item) => total + item.brokenImages.length, 0),
    interactions: report.interactions,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
