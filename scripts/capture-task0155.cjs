const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDir = join(__dirname, "..", "screenshots", "task0155-subpage-redesign");
const routes = [
  { path: "/", slug: "home", widths: [1440, 390] },
  { path: "/technology", slug: "technology", widths: [1440, 1024, 768, 390] },
  { path: "/applications", slug: "applications", widths: [1440, 1024, 768, 390] },
  { path: "/about", slug: "about", widths: [1440, 1024, 768, 390] },
  { path: "/support/videos", slug: "video-center", widths: [1440, 390] },
];
const heights = { 1440: 900, 1024: 768, 768: 900, 390: 844 };

async function inspectPage(page, route, width) {
  return page.evaluate(({ routePath, viewportWidth }) => {
    const images = [...document.images];
    const videos = [...document.querySelectorAll("video")];
    const hero = document.querySelector(".product-hero:not([data-theme='dark'])");
    const heroImage = hero?.querySelector(".product-hero__media img");
    const heroStyle = hero ? getComputedStyle(hero) : null;
    const heroImageStyle = heroImage ? getComputedStyle(heroImage) : null;
    return {
      route: routePath,
      width: viewportWidth,
      title: document.title,
      documentHeight: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      headings: [...document.querySelectorAll("h1, h2")].map((node) => node.textContent.trim().replace(/\s+/g, " ")),
      navbarLinks: [...document.querySelectorAll(".navbar__links a")].map((node) => ({
        text: node.textContent.trim().replace(/\s+/g, " "),
        href: node.getAttribute("href"),
      })),
      sections: document.querySelectorAll("main section").length,
      brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      videos: videos.map((video) => ({ readyState: video.readyState, paused: video.paused, src: video.currentSrc || video.src })),
      homeHero: heroStyle ? {
        backgroundColor: heroStyle.backgroundColor,
        backgroundImage: heroStyle.backgroundImage,
        backgroundSize: heroStyle.backgroundSize,
        imageFilter: heroImageStyle?.filter,
        imageBlend: heroImageStyle?.mixBlendMode,
      } : null,
    };
  }, { routePath: route.path, viewportWidth: width });
}

async function primeLazyMedia(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.78));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo(0, top);
      await new Promise((resolve) => window.setTimeout(resolve, 45));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(450);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  const report = { baseUrl, captures: [], interactions: {}, errors: [] };

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
      await page.waitForTimeout(route.path === "/applications" ? 1800 : 700);
      await primeLazyMedia(page);
      const file = `${route.slug}-${width}.png`;
      await page.screenshot({ path: join(outputDir, file), fullPage: true });
      const result = await inspectPage(page, route, width);
      result.file = file;
      result.errors = pageErrors;
      report.captures.push(result);

      if (route.path === "/technology" && width === 1440) {
        const active = page.locator(".technology-explorer__controls [role='tab'][aria-selected='true']");
        await active.focus();
        const before = await active.textContent();
        await page.keyboard.press("ArrowDown");
        const after = await page.locator(".technology-explorer__controls [role='tab'][aria-selected='true']").textContent();
        const panelLabel = await page.locator("#technology-platform-panel h3").textContent();
        report.interactions.technologyKeyboardTabs = {
          before: before.trim(),
          after: after.trim(),
          panelLabel: panelLabel.trim(),
          passed: before.trim() !== after.trim() && after.includes(panelLabel.trim()),
        };
      }

      await context.close();
    }
  }

  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(`${baseUrl}/technology`, { waitUntil: "load" });
  await motionPage.waitForTimeout(1700);
  report.interactions.motion = await motionPage.evaluate(() => ({
    hiddenHeadings: [...document.querySelectorAll("h1, h2")].filter((node) => {
      const style = getComputedStyle(node);
      return style.visibility === "hidden" || Number(style.opacity) === 0;
    }).length,
    beamAnimation: getComputedStyle(document.querySelector(".technology-hero__beam")).animationName,
  }));
  await motionContext.close();

  report.errors = report.captures.flatMap((capture) => capture.errors.map((error) => `${capture.route}@${capture.width}: ${error}`));
  report.allPassed = report.captures.every((capture) => (
    !capture.overflow && capture.brokenImages.length === 0 && capture.errors.length === 0
  )) && report.interactions.technologyKeyboardTabs?.passed === true;

  await browser.close();
  await writeFile(join(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    outputDir,
    captures: report.captures.length,
    allPassed: report.allPassed,
    errors: report.errors.length,
    overflow: report.captures.filter((capture) => capture.overflow).map((capture) => `${capture.route}@${capture.width}`),
    brokenImages: report.captures.reduce((count, capture) => count + capture.brokenImages.length, 0),
    technologyKeyboardTabs: report.interactions.technologyKeyboardTabs,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
