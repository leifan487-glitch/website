import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/99770/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browserPath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputName = process.env.TASK0131_OUTPUT || "task0131";
const out = fileURLToPath(new URL(`../screenshots/${outputName}/`, import.meta.url));
const publicUrl = process.env.TASK0131_PUBLIC_URL || "http://127.0.0.1:4173";
const enforce = process.env.TASK0131_ENFORCE !== "false";
const routes = [
  ["technology", "/technology"],
  ["applications", "/applications"],
  ["about", "/about"],
  ["progress", "/news"],
];

const governancePattern = /SOURCE|HIGH RISK|NEEDS CONFIRMATION|Evidence Queue|Evidence is not a claim|Evidence before claims|Records first|Cases after approval|Cooperation is not attribution|Directions, not deployment claims|A case needs more than a picture|Need a verified record|Leadership record|approval|publicApproved|claim risk|source page|internal review|内容治理|资料待确认|待确认|待核验|待审批|审核话术/i;
const unapprovedPattern = /西安电子科技大学|西安交通大学|丛尧|创造一个人机共融新世界|FF8D-Hand|FF16D-Hand|IROS|XBOTMAN|西安国际创业大赛|珠海国际灵巧操作挑战赛|世界人形机器人运动会|全国亚军|世界排名|奖金|CCTV-4|人民网|新华网|22项授权专利/i;
const prohibitedProductPattern = /Mantis Pro|Mantis Ultra|Boston Dynamics|波士顿动力/i;

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const errors = [];

async function capture(routeName, pathname, viewport, screenshot) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push({ routeName, viewport, type: "console", text: message.text() });
  });
  page.on("pageerror", (error) => errors.push({ routeName, viewport, type: "pageerror", text: error.message }));

  const response = await page.goto(`${publicUrl}${pathname}`, { waitUntil: "networkidle" });
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

  const metrics = await page.evaluate(({ governanceSource, unapprovedSource, prohibitedProductSource }) => {
    const text = document.body.innerText;
    const images = [...document.images].filter((image) => image.offsetWidth > 0 && image.offsetHeight > 0);
    return {
      text,
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyHeight: document.body.scrollHeight,
      internalStatuses: document.querySelectorAll(".internal-status").length,
      internalOnlySections: document.querySelectorAll(".technology-system, .technology-platforms-v1, .research-engineering, .project-ledger, .research-record, .future-case, .about-mission-v1, .leadership-record, .about-evidence, .progress-intro, .evidence-ledger, .progress-record").length,
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      missingAlt: images.filter((image) => !image.hasAttribute("alt")).map((image) => image.src),
      governanceMatches: text.match(new RegExp(governanceSource, "gi")) ?? [],
      unapprovedMatches: text.match(new RegExp(unapprovedSource, "gi")) ?? [],
      prohibitedProductMatches: text.match(new RegExp(prohibitedProductSource, "gi")) ?? [],
    };
  }, {
    governanceSource: governancePattern.source,
    unapprovedSource: unapprovedPattern.source,
    prohibitedProductSource: prohibitedProductPattern.source,
  });

  await page.addStyleTag({ content: ".skip-link{display:none!important}" });
  await page.screenshot({ path: join(out, screenshot), fullPage: true });
  await page.close();

  return { status: response?.status(), viewport, ...metrics };
}

const report = { publicUrl, routes: {}, mobile: {}, errors };
for (const [name, pathname] of routes) {
  report.routes[name] = await capture(name, pathname, { width: 1440, height: 900 }, `${name}-public-1440-long.png`);
}
for (const [name, pathname] of routes.filter(([name]) => name === "applications" || name === "progress")) {
  report.mobile[name] = await capture(name, pathname, { width: 390, height: 844 }, `${name}-public-390-long.png`);
}

const results = [...Object.values(report.routes), ...Object.values(report.mobile)];
report.checks = {
  allHttp200: results.every((item) => item.status === 200),
  noOverflow: results.every((item) => item.clientWidth === item.scrollWidth),
  noBrokenImages: results.every((item) => item.brokenImages.length === 0),
  noMissingAlt: results.every((item) => item.missingAlt.length === 0),
  noConsoleErrors: errors.length === 0,
  oneH1PerPage: results.every((item) => item.h1Count === 1),
  internalStatusOff: results.every((item) => item.internalStatuses === 0),
  internalSectionsHidden: results.every((item) => item.internalOnlySections === 0),
  noGovernanceCopy: results.every((item) => item.governanceMatches.length === 0),
  noUnapprovedContent: results.every((item) => item.unapprovedMatches.length === 0),
  noProhibitedProduct: results.every((item) => item.prohibitedProductMatches.length === 0),
};

await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(report.checks, null, 2));

if (enforce && !Object.values(report.checks).every(Boolean)) process.exitCode = 1;
