import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { getSitemapRoutes, siteMetadata } from "../src/data/siteMetadata.js";
import { getVisibleSupportModules, isSupportModuleVisible, supportModules } from "../src/data/supportModules.js";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Support module visibility preserves internal review and filters public preview", () => {
  assert.deepEqual(Object.values(supportModules).filter((module) => module.publicVisible).map((module) => module.id), ["documents", "videos"]);
  assert.equal(isSupportModuleVisible("videos", { publicPreview: false, hiddenModuleIds: ["videos"] }), true);
  assert.equal(isSupportModuleVisible("videos", { publicPreview: true, hiddenModuleIds: ["videos"] }), false);
  assert.deepEqual(getVisibleSupportModules({ publicPreview: true, hiddenModuleIds: ["downloads", "knowledge"] }).map((module) => module.id), ["documents", "videos"]);
});

test("sitemap source excludes redirects, Pro and hidden Support modules", () => {
  const routes = getSitemapRoutes({ hiddenModuleIds: ["videos"] });
  assert.ok(routes.includes("/"));
  assert.ok(routes.includes("/products/mantis-standard"));
  assert.ok(!routes.includes("/products"));
  assert.ok(!routes.includes("/products/mantis-pro"));
  assert.ok(!routes.includes("/support/videos"));
  assert.ok(routes.includes("/support/documents"));
  assert.ok(getSitemapRoutes({ hiddenModuleIds: [] }).includes("/support/videos"));
});

test("Cloudflare output includes a static 404 sentinel for real route statuses", async () => {
  const notFound = await source("../public/404.html");
  assert.match(notFound, /<meta name="robots" content="noindex"/);
  assert.match(notFound, /页面未找到/);
});

test("all public route metadata has a safe title and description", () => {
  for (const metadata of Object.values(siteMetadata)) {
    assert.match(metadata.title, /Blue Worm/);
    assert.ok(metadata.description.length > 8);
    assert.doesNotMatch(metadata.description, /全球领先|行业第一|最先进/);
  }
});

test("release shell has OG metadata without an unapproved image or fake canonical", async () => {
  const html = await source("../index.html");
  const app = await source("../src/App.jsx");
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:type"/);
  assert.doesNotMatch(html, /property="og:image"/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.match(app, /VITE_SITE_URL/);
  assert.match(app, /property="og:url"/);
});

test("release shell uses a square multi-size favicon family", async () => {
  const html = await source("../index.html");
  const png16 = await readFile(new URL("../public/assets/brand-favicon-a01623-16.png", import.meta.url));
  const png32 = await readFile(new URL("../public/assets/brand-favicon-a01623-32.png", import.meta.url));
  const apple = await readFile(new URL("../public/assets/brand-apple-touch-a01623-180.png", import.meta.url));
  const ico = await stat(new URL("../public/favicon.ico", import.meta.url));
  const pngDimensions = (buffer) => [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];

  assert.match(html, /rel="icon" href="\/favicon\.ico" sizes="any"/);
  assert.match(html, /sizes="32x32"[\s\S]+brand-favicon-a01623-32\.png/);
  assert.match(html, /sizes="16x16"[\s\S]+brand-favicon-a01623-16\.png/);
  assert.match(html, /rel="apple-touch-icon"[\s\S]+brand-apple-touch-a01623-180\.png/);
  assert.deepEqual(pngDimensions(png16), [16, 16]);
  assert.deepEqual(pngDimensions(png32), [32, 32]);
  assert.deepEqual(pngDimensions(apple), [180, 180]);
  assert.ok(ico.size > 0);
});

test("repository upload uses one package manager and has an integrity audit", async () => {
  const pkg = JSON.parse(await source("../package.json"));
  const gitignore = await source("../.gitignore");
  const uploadManifest = JSON.parse(await source("../UPLOAD_MANIFEST.json"));

  assert.match(pkg.packageManager, /^pnpm@/);
  assert.equal(pkg.scripts["audit:upload"], "node scripts/verify-upload-integrity.mjs");
  assert.equal(pkg.scripts["manifest:upload"], "node scripts/verify-upload-integrity.mjs --write");
  assert.match(pkg.scripts["verify:upload"], /^pnpm run build:cloudflare/);
  assert.match(pkg.scripts["verify:upload"], /pnpm run audit:upload$/);
  await assert.doesNotReject(source("../pnpm-lock.yaml"));
  await assert.rejects(source("../package-lock.json"));
  assert.match(gitignore, /__pycache__\//);
  assert.match(gitignore, /\*\.py\[cod\]/);
  assert.equal(uploadManifest.schemaVersion, 1);
  assert.ok(uploadManifest.fileCount > 100);
});

test("forms use mobile input semantics and a local error description", async () => {
  const inquiry = await source("../src/components/InquiryForm.jsx");
  const support = await source("../src/pages/SupportPages.jsx");
  assert.match(inquiry, /type: "tel"/);
  assert.match(support, /type: "tel"/);
  assert.match(inquiry, /aria-describedby/);
  assert.match(inquiry, /role="alert"/);
  assert.match(inquiry, /required: true/);
});

test("shared UI tokens and intermediate breakpoints are present", async () => {
  const css = await source("../src/styles.css");
  assert.match(css, /--type-page-hero/);
  assert.match(css, /--nav-dropdown-surface/);
  assert.match(css, /max-width: 1100px/);
  assert.match(css, /max-width: 900px/);
  assert.match(css, /max-width: 520px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("empty states and 404 use the shared Chinese UI language", async () => {
  const empty = await source("../src/components/EmptyState.jsx");
  const notFound = await source("../src/pages/NotFoundPage.jsx");
  assert.match(empty, /className="empty-state"/);
  assert.match(notFound, /页面未找到/);
  assert.match(notFound, /返回首页/);
});
