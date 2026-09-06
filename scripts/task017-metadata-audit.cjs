const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { chromium } = require("playwright");

const root = join(__dirname, "..");
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const expectedOrigin = process.env.EXPECTED_SITE_ORIGIN;
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const routes = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/news", "/support/videos", "/inquiry", "/policy/privacy", "/policy/terms"];

if (!expectedOrigin) throw new Error("EXPECTED_SITE_ORIGIN is required.");

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pages = [];
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      openGraphUrl: document.querySelector('meta[property="og:url"]')?.content || "",
    }));
    const expectedUrl = `${expectedOrigin}${route === "/" ? "" : route}`;
    pages.push({ route, expectedUrl, ...metadata, passed: Boolean(metadata.title && metadata.description && metadata.canonical === expectedUrl && metadata.openGraphUrl === expectedUrl) });
  }
  await browser.close();

  const sitemap = readFileSync(join(root, "dist", "client", "sitemap.xml"), "utf8");
  const robots = readFileSync(join(root, "dist", "client", "robots.txt"), "utf8");
  const report = {
    generatedAt: new Date().toISOString(),
    expectedOrigin,
    pages,
    sitemapEntries: (sitemap.match(/<url>/g) || []).length,
    sitemapUsesOrigin: sitemap.includes(expectedOrigin),
    robotsReferencesSitemap: robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`),
  };
  report.allPassed = pages.every((item) => item.passed) && report.sitemapEntries === routes.length && report.sitemapUsesOrigin && report.robotsReferencesSitemap;
  writeFileSync(join(root, "screenshots", "task017", "metadata-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ allPassed: report.allPassed, pages: pages.length, sitemapEntries: report.sitemapEntries, robotsReferencesSitemap: report.robotsReferencesSitemap }, null, 2));
  if (!report.allPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
