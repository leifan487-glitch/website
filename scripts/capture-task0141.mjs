import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const runtimeRequire = createRequire("C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = runtimeRequire("playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4174";
const outputDir = resolve("screenshots/task0141");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});

const browserErrors = [];
const badResponses = [];
const results = [];
const forbiddenTerms = [
  "Mantis Pro", "Mantis Ultra", "P00001", "P00002", "P00003", "P00004", "P00005",
  "FF8D", "FF16", "Boston Dynamics", "Evidence Queue", "HIGH RISK", "NEEDS CONFIRMATION",
  "MEDIA PENDING", "BACKEND PENDING", "source page", "internal review",
  "胚胎体", "成熟体", "完全体", "究极体", "孩子王", "DIY王", "导览王", "科研王", "王中王",
  "西安电子科技大学",
];

async function inspectPage(path, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const localErrors = [];
  const localResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") localErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => localErrors.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) localResponses.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = "eager"; });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });
  const audit = await page.evaluate((terms) => {
    const bodyText = document.body.innerText;
    const images = [...document.images];
    const sections = [...document.querySelectorAll("main section")];
    return {
      title: document.title,
      statusBadges: document.querySelectorAll(".internal-status").length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      unnamedButtons: [...document.querySelectorAll("button")].filter((button) => {
        const imageAlt = button.querySelector("img[alt]")?.getAttribute("alt")?.trim();
        return !button.textContent.trim()
          && !button.getAttribute("aria-label")
          && !button.getAttribute("aria-labelledby")
          && !button.getAttribute("title")
          && !imageAlt;
      }).length,
      imagesMissingAlt: images.filter((image) => !image.hasAttribute("alt")).length,
      forbiddenVisible: terms.filter((term) => bodyText.toLowerCase().includes(term.toLowerCase())),
      emptyMediaContainers: document.querySelectorAll(".home-technology__media, .media-story, .real-world__media:empty, .about-identity figure:empty, video:not([src])").length,
      placeholderVisible: ["MEDIA PENDING", "资料准备中", "内容待整理", "审批中", "待授权", "提交功能待接入", "内部界面与验证测试"].filter((term) => bodyText.includes(term)),
      blankFixedHeightSections: sections.filter((section) => {
        const rect = section.getBoundingClientRect();
        const meaningfulText = section.innerText.replace(/\s+/g, " ").trim();
        const media = section.querySelector("img, video, canvas, svg");
        const interactive = section.querySelector("a[href], button");
        return rect.height >= 500 && meaningfulText.length < 24 && !media && !interactive;
      }).map((section) => section.className || section.id || section.tagName),
    };
  }, forbiddenTerms);
  const item = {
    path, width, height, httpStatus: response?.status() ?? null,
    ...audit, consoleErrors: localErrors, badResponses: localResponses,
  };
  results.push(item);
  browserErrors.push(...localErrors.map((message) => `${path}@${width}: ${message}`));
  badResponses.push(...localResponses.map((message) => `${path}@${width}: ${message}`));
  return page;
}

async function capture(path, width, height, fileName, locator = null) {
  const page = await inspectPage(path, width, height);
  const target = locator ? page.locator(locator) : page;
  if (locator) await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.activeElement?.blur());
  if (locator) await page.locator(".skip-link").evaluate((element) => { element.hidden = true; }).catch(() => undefined);
  await target.screenshot({ path: resolve(outputDir, fileName), ...(locator ? {} : { fullPage: true }) });
  await page.close();
}

await capture("/", 1440, 900, "home-1440-long.png");
await capture("/", 390, 844, "home-390-long.png");
await capture("/", 1440, 900, "home-technology-1440.png", ".home-technology");
await capture("/", 1440, 900, "home-applications-1440.png", ".home-applications");
await capture("/products/mantis-standard", 1440, 900, "standard-1440-long.png");
await capture("/products/mantis-standard", 1440, 900, "standard-specifications-1440.png", ".standard-specifications");
await capture("/products/mantis-standard", 390, 844, "standard-specifications-390.png", ".standard-specifications");
await capture("/applications", 1440, 900, "applications-1440-long.png");
await capture("/applications", 1440, 900, "applications-projects-1440.png", ".public-projects");
await capture("/applications", 390, 844, "applications-390-long.png");
await capture("/about", 1440, 900, "about-1440-long.png");
await capture("/about", 390, 844, "about-390-long.png");
await capture("/news", 1440, 900, "progress-1440-long.png");
await capture("/inquiry", 1440, 900, "inquiry-1440.png");
await capture("/inquiry", 390, 844, "inquiry-390.png");

const routes = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/news", "/inquiry"];
for (const width of [1728, 1440, 1280, 1024, 768, 390]) {
  for (const path of routes) {
    const page = await inspectPage(path, width, width === 390 ? 844 : 900);
    await page.close();
  }
}

const homePage = await inspectPage("/", 1440, 900);
const homeText = await homePage.locator("body").innerText();
const positiveHome = ["机器人 + 效率工具", "一脑多形，真模块化", "Silkworm", "Quantum", "Wormhole", "Honeycomb", "咖啡服务项目", "Blue Worm"]
  .filter((term) => homeText.includes(term));
await homePage.close();

const standardPage = await inspectPage("/products/mantis-standard", 1440, 900);
await standardPage.locator(".standard-qa__list button").first().press("Enter");
await standardPage.locator(".standard-qa__list button").first().press("Space");
const qaKeyboardWorks = await standardPage.locator(".standard-qa__list button").first().getAttribute("aria-expanded") !== null;
await standardPage.close();

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: "Microsoft Edge via Playwright",
  resultCount: results.length,
  consoleErrors: browserErrors,
  badResponses,
  positiveHome,
  qaKeyboardWorks,
  allHttp200: results.every((item) => item.httpStatus === 200),
  allNoOverflow: results.every((item) => item.overflow <= 0),
  allNoBrokenImages: results.every((item) => item.brokenImages.length === 0),
  allButtonsNamed: results.every((item) => item.unnamedButtons === 0),
  allNoInternalStatus: results.every((item) => item.statusBadges === 0),
  allNoForbiddenVisible: results.every((item) => item.forbiddenVisible.length === 0),
  allNoEmptyMediaContainers: results.every((item) => item.emptyMediaContainers === 0),
  allNoBlankFixedHeightSections: results.every((item) => item.blankFixedHeightSections.length === 0),
  allNoPlaceholderVisible: results.every((item) => item.placeholderVisible.length === 0),
  results,
};

await writeFile(resolve(outputDir, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();

if (browserErrors.length || badResponses.length || !report.allHttp200 || !report.allNoOverflow || !report.allNoBrokenImages || !report.allButtonsNamed || !report.allNoInternalStatus || !report.allNoForbiddenVisible || !report.allNoEmptyMediaContainers || !report.allNoBlankFixedHeightSections || !report.allNoPlaceholderVisible || !qaKeyboardWorks) {
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    resultCount: report.resultCount,
    positiveHome,
    qaKeyboardWorks,
    allHttp200: report.allHttp200,
    allNoOverflow: report.allNoOverflow,
    allNoBrokenImages: report.allNoBrokenImages,
    allButtonsNamed: report.allButtonsNamed,
    allNoInternalStatus: report.allNoInternalStatus,
    allNoForbiddenVisible: report.allNoForbiddenVisible,
    allNoEmptyMediaContainers: report.allNoEmptyMediaContainers,
    allNoBlankFixedHeightSections: report.allNoBlankFixedHeightSections,
    allNoPlaceholderVisible: report.allNoPlaceholderVisible,
  }, null, 2));
}
