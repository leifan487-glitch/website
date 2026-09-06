import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = fileURLToPath(new URL("../screenshots/task013/", import.meta.url));
const internalUrl = process.env.TASK013_INTERNAL_URL || "http://127.0.0.1:4174";
const publicUrl = process.env.TASK013_PUBLIC_URL || "http://127.0.0.1:4173";
const routes = [
  ["technology", "/technology"],
  ["applications", "/applications"],
  ["about", "/about"],
  ["progress", "/news"],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];

async function inspect(baseUrl, routeName, pathname, viewport, screenshot, fullPage = false) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push({ routeName, mode: baseUrl === publicUrl ? "public" : "internal", type: "console", text: message.text() });
  });
  page.on("pageerror", (error) => errors.push({ routeName, mode: baseUrl === publicUrl ? "public" : "internal", type: "pageerror", text: error.message }));
  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    for (let y = 0; y < document.body.scrollHeight; y += Math.max(480, window.innerHeight * .8)) {
      window.scrollTo(0, y);
      await delay(35);
    }
    const visibleImages = [...document.images].filter((image) => image.offsetWidth > 0 && image.offsetHeight > 0);
    await Promise.race([
      Promise.all(visibleImages.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }))),
      delay(3000),
    ]);
    window.scrollTo(0, 0);
  });
  const metrics = await page.evaluate(() => {
    const text = document.body.innerText;
    const images = [...document.images];
    const unnamedButtons = [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label"));
    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyHeight: document.body.scrollHeight,
      internalStatuses: document.querySelectorAll(".internal-status").length,
      brokenImages: images.filter((image) => image.offsetWidth > 0 && image.offsetHeight > 0 && (!image.complete || image.naturalWidth === 0)).map((image) => image.src),
      missingAlt: images.filter((image) => !image.hasAttribute("alt")).map((image) => image.src),
      unnamedButtons: unnamedButtons.length,
      hasMission: text.includes("创造一个人机共融新世界"),
      hasLeadership: text.includes("丛尧"),
      hasUniversityCustomer: text.includes("西安电子科技大学") || text.includes("西安交通大学"),
      hasUnapprovedCompetition: text.includes("XBOTMAN") || text.includes("西安国际创业大赛") || text.includes("世界人形机器人运动会"),
      hasProhibitedProduct: /Mantis Pro|Mantis Ultra/i.test(text),
      hasProhibitedClaim: /Boston Dynamics RAI VS Blue Worm|波士顿动力\s*follow|全国亚军|世界排名10%|世界排名|奖金|央视认证|央视背书|22项授权专利/i.test(text),
      diagramTextEquivalent: Boolean(document.querySelector(".technology-system figcaption")),
    };
  });
  if (screenshot) {
    // Chromium can stitch the off-canvas skip link into long screenshots; hide it only in capture evidence.
    await page.addStyleTag({ content: ".skip-link{display:none!important}" });
    await page.screenshot({ path: join(out, screenshot), fullPage });
  }
  await page.close();
  return { status: response?.status(), viewport, ...metrics };
}

const report = { internalUrl, publicUrl, screenshots: {}, regression: {}, public: {}, errors };

for (const [name, pathname] of routes) {
  report.screenshots[`${name}1440`] = await inspect(internalUrl, name, pathname, { width: 1440, height: 900 }, `${name}-internal-1440-long.png`, true);
  report.screenshots[`${name}390`] = await inspect(internalUrl, name, pathname, { width: 390, height: 844 }, `${name}-internal-390-long.png`, true);
}

for (const width of [1280, 1024, 768]) {
  for (const [name, pathname] of routes) {
    report.regression[`${name}@${width}`] = await inspect(internalUrl, name, pathname, { width, height: 800 }, null, false);
  }
}

for (const [name, pathname] of routes) {
  const screenshot = name === "technology" ? "technology-public-1440-long.png" : null;
  report.public[name] = await inspect(publicUrl, name, pathname, { width: 1440, height: 900 }, screenshot, true);
}

report.checks = {
  allHttp200: [...Object.values(report.screenshots), ...Object.values(report.regression), ...Object.values(report.public)].every((item) => item.status === 200),
  noOverflow: [...Object.values(report.screenshots), ...Object.values(report.regression), ...Object.values(report.public)].every((item) => item.clientWidth === item.scrollWidth),
  noBrokenImages: [...Object.values(report.screenshots), ...Object.values(report.regression), ...Object.values(report.public)].every((item) => item.brokenImages.length === 0),
  noConsoleErrors: errors.length === 0,
  internalStatusOn: Object.values(report.screenshots).every((item) => item.internalStatuses > 0),
  internalStatusOff: Object.values(report.public).every((item) => item.internalStatuses === 0),
  publicCustomersHidden: Object.values(report.public).every((item) => !item.hasUniversityCustomer),
  publicMissionHidden: !report.public.about.hasMission,
  publicLeadershipHidden: !report.public.about.hasLeadership,
  publicAwardsHidden: Object.values(report.public).every((item) => !item.hasUnapprovedCompetition),
  noProhibitedProduct: [...Object.values(report.screenshots), ...Object.values(report.public)].every((item) => !item.hasProhibitedProduct),
  noProhibitedClaim: [...Object.values(report.screenshots), ...Object.values(report.public)].every((item) => !item.hasProhibitedClaim),
  technologyDiagramAccessible: report.screenshots.technology1440.diagramTextEquivalent,
};

await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(report.checks, null, 2));

if (!Object.values(report.checks).every(Boolean)) process.exitCode = 1;
