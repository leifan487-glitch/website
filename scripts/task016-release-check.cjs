const { readFileSync, existsSync, readdirSync, statSync, writeFileSync } = require("node:fs");
const { join, relative } = require("node:path");
const { chromium, request } = require("playwright");

const siteRoot = join(__dirname, "..");
const publicRoot = join(siteRoot, "public");
const outputPath = join(siteRoot, "screenshots", "task016", "release-check.json");
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const routes = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/news", "/inquiry", "/support/videos", "/policy/privacy", "/policy/terms"];
const forbidden = [
  ["TODO", /\bTODO\b/i], ["SOURCE", /\bSOURCE\b/i], ["PRIVATE", /\bPRIVATE\b/i],
  ["HIGH RISK", /HIGH RISK/i], ["NEEDS CONFIRMATION", /NEEDS CONFIRMATION/i],
  ["INTERNAL", /\bINTERNAL\b/i], ["审核", /审核/], ["待确认", /待确认/], ["内部配置", /内部配置/],
  ["Pro", /\bMantis\s+Pro\b/i], ["Ultra", /\bMantis\s+Ultra\b/i], ["FF8D", /FF8D/i],
  ["FF16", /FF16/i], ["Boston Dynamics", /Boston Dynamics/i], ["价格", /价格/], ["质保", /质保/],
];

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const routeChecks = [];
  const hrefs = new Set();
  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
    await page.waitForTimeout(120);
    routeChecks.push(await page.evaluate(({ route, status, patterns }) => {
      const text = document.body.innerText;
      return {
        route,
        status,
        title: document.title,
        h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() || null,
        hygieneMatches: patterns.filter((item) => new RegExp(item.source, item.flags).test(text)).map((item) => item.label),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
        externalFontLinks: [...document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="font"]')].map((link) => link.href).filter((href) => !href.startsWith(location.origin)),
        hrefs: [...document.querySelectorAll("a[href]")].map((anchor) => anchor.getAttribute("href")),
      };
    }, { route, status: response?.status() || null, patterns: forbidden.map(([label, regex]) => ({ label, source: regex.source, flags: regex.flags })) }));
    routeChecks.at(-1).hrefs.filter((href) => href?.startsWith("/")).forEach((href) => hrefs.add(href.split("#")[0] || "/"));
  }
  const notFoundResponse = await page.goto(`${baseUrl}/task016-not-a-real-route`, { waitUntil: "load" });
  const notFound = await page.evaluate((transportStatus) => ({
    transportStatus,
    h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() || null,
    hasNotFoundPage: /页面未找到|404/.test(document.body.innerText),
  }), notFoundResponse?.status() || null);
  await context.close();
  await browser.close();

  const api = await request.newContext();
  const linkChecks = [];
  for (const href of [...hrefs].sort()) {
    const response = await api.get(`${baseUrl}${href}`);
    linkChecks.push({ href, status: response.status() });
  }
  const videos = walk(publicRoot).filter((path) => path.toLowerCase().endsWith(".mp4"));
  const videoChecks = [];
  for (const path of videos) {
    const href = `/${relative(publicRoot, path).replaceAll("\\", "/")}`;
    const response = await api.get(`${baseUrl}${href}`, { headers: { Range: "bytes=0-1023" } });
    const buffer = readFileSync(path);
    const moov = buffer.indexOf(Buffer.from("moov"));
    const mdat = buffer.indexOf(Buffer.from("mdat"));
    videoChecks.push({
      href,
      bytes: statSync(path).size,
      rangeStatus: response.status(),
      acceptRanges: response.headers()["accept-ranges"] || "",
      contentRange: response.headers()["content-range"] || "",
      moovOffset: moov,
      mdatOffset: mdat,
      faststart: moov > 0 && mdat > 0 && moov < mdat,
    });
  }
  await api.dispose();

  const css = readFileSync(join(siteRoot, "src", "styles.css"), "utf8");
  const jsBundle = walk(join(siteRoot, "dist", "client", "assets")).find((path) => /index-.*\.js$/.test(path));
  const cssBundle = walk(join(siteRoot, "dist", "client", "assets")).find((path) => /index-.*\.css$/.test(path));
  const report = {
    generatedAt: new Date().toISOString(),
    environment: "Production preview; transport status for SPA fallback is expected to be 200 while the app renders its NotFound page",
    routeChecks,
    linkChecks,
    notFound,
    videoChecks,
    cssAudit: {
      bytes: statSync(join(siteRoot, "src", "styles.css")).size,
      transitionAllCount: (css.match(/transition\s*:\s*all\b/gi) || []).length,
      backdropFilterCount: (css.match(/backdrop-filter\s*:/gi) || []).length,
      filterDeclarationCount: (css.match(/(^|[;{]\s*)filter\s*:/gim) || []).length,
      fixedPositionCount: (css.match(/position\s*:\s*fixed\b/gi) || []).length,
      fontFaceCount: (css.match(/@font-face\b/gi) || []).length,
    },
    bundle: {
      js: jsBundle ? { path: relative(siteRoot, jsBundle).replaceAll("\\", "/"), bytes: statSync(jsBundle).size } : null,
      css: cssBundle ? { path: relative(siteRoot, cssBundle).replaceAll("\\", "/"), bytes: statSync(cssBundle).size } : null,
      sourceMaps: walk(join(siteRoot, "dist", "client")).filter((path) => path.endsWith(".map")).map((path) => relative(siteRoot, path).replaceAll("\\", "/")),
    },
    cacheConfig: {
      publicHeadersExists: existsSync(join(publicRoot, "_headers")),
      wranglerConfigExists: ["wrangler.toml", "wrangler.json", "wrangler.jsonc"].some((name) => existsSync(join(siteRoot, name))),
      note: "No formal production cache policy is configured in the repository; preview no-cache headers are not production evidence.",
    },
  };
  report.allPassed = routeChecks.every((item) => item.status === 200 && !item.hygieneMatches.length && !item.overflow && !item.brokenImages.length && !item.externalFontLinks.length)
    && linkChecks.every((item) => item.status === 200)
    && notFound.hasNotFoundPage
    && videoChecks.every((item) => item.rangeStatus === 206 && item.faststart)
    && report.bundle.sourceMaps.length === 0;
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, allPassed: report.allPassed, routes: routeChecks.length, links: linkChecks.length, hygieneMatches: routeChecks.flatMap((item) => item.hygieneMatches.map((match) => `${item.route}:${match}`)), notFound, videoRanges: videoChecks.map(({ href, rangeStatus, faststart }) => ({ href, rangeStatus, faststart })), cssAudit: report.cssAudit, cacheConfig: report.cacheConfig }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
