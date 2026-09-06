const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDir = join(__dirname, "..", "screenshots", "task0157-editorial-refinement");
const routes = [
  { path: "/inquiry", slug: "inquiry", widths: [1440, 1024, 768, 390] },
  { path: "/technology", slug: "technology", widths: [1440, 390] },
  { path: "/applications", slug: "applications", widths: [1440, 390] },
  { path: "/support/videos", slug: "video-center", widths: [1440, 1024, 768, 390] },
];
const heights = { 1440: 900, 1024: 768, 768: 900, 390: 844 };

const sectionCaptures = {
  "/inquiry": [".inquiry-brief"],
  "/technology": [".technology-explorer__intro", ".subpage-contact--blue"],
  "/applications": [".application-spectrum", ".subpage-contact"],
  "/support/videos": [".video-library"],
};

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

async function inspectPage(page, route, width) {
  return page.evaluate(({ routePath, viewportWidth }) => ({
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
    headlineMetrics: [...document.querySelectorAll(".inquiry-brief__context h2, .technology-explorer__intro h2, .application-spectrum h2, .subpage-contact h2, .video-library__header h2")].map((node) => {
      const style = getComputedStyle(node);
      return { text: node.textContent.trim(), fontSize: style.fontSize, lineHeight: style.lineHeight, width: node.getBoundingClientRect().width };
    }),
  }), { routePath: route.path, viewportWidth: width });
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
      await page.waitForTimeout(route.path === "/applications" ? 1300 : 600);
      await primeLazyMedia(page);
      await page.screenshot({ path: join(outputDir, `${route.slug}-${width}.png`), fullPage: true });

      if ([1440, 390].includes(width)) {
        for (const selector of sectionCaptures[route.path] || []) {
          const locator = page.locator(selector).first();
          if (await locator.count()) {
            const sectionSlug = selector.replace(/^[.#]/, "").replace(/[^a-z0-9]+/gi, "-");
            await locator.screenshot({ path: join(outputDir, `${route.slug}-${sectionSlug}-${width}.png`) });
          }
        }
      }

      const result = await inspectPage(page, route, width);
      result.errors = pageErrors;
      report.captures.push(result);

      if (route.path === "/support/videos" && width === 1440) {
        const taskFilter = page.getByRole("button", { name: /任务操作/ });
        await taskFilter.click();
        report.interactions.videoFilter = {
          pressed: await taskFilter.getAttribute("aria-pressed"),
          visibleCards: await page.locator(".video-library__grid .video-card").count(),
        };
        await page.locator(".video-library").screenshot({ path: join(outputDir, "video-center-filter-tasks-1440.png") });
      }

      if (route.path === "/inquiry" && width === 1440) {
        await page.getByRole("button", { name: "提交项目需求" }).click();
        report.interactions.inquiryValidation = {
          invalidFields: await page.locator(".inquiry-form [aria-invalid='true']").count(),
          focusedField: await page.evaluate(() => document.activeElement?.id || ""),
          status: await page.locator(".inquiry-form__status").textContent(),
        };
        await page.locator(".inquiry-form").screenshot({ path: join(outputDir, "inquiry-validation-1440.png") });
      }

      await context.close();
    }
  }

  report.errors = report.captures.flatMap((capture) => capture.errors.map((error) => `${capture.route}@${capture.width}: ${error}`));
  report.allPassed = report.captures.every((capture) => (
    !capture.overflow && capture.brokenImages.length === 0 && capture.errors.length === 0
  )) && report.interactions.videoFilter?.pressed === "true"
    && report.interactions.videoFilter?.visibleCards === 3
    && report.interactions.inquiryValidation?.invalidFields === 5
    && report.interactions.inquiryValidation?.focusedField === "inquiry-name";

  await browser.close();
  await writeFile(join(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    outputDir,
    captures: report.captures.length,
    allPassed: report.allPassed,
    errors: report.errors.length,
    overflow: report.captures.filter((capture) => capture.overflow).map((capture) => `${capture.route}@${capture.width}`),
    brokenImages: report.captures.reduce((count, capture) => count + capture.brokenImages.length, 0),
    interactions: report.interactions,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
