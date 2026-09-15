import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { documentResources } from "../src/data/resources/documents.js";
import { downloadResources } from "../src/data/resources/downloads.js";
import { knowledgeResources } from "../src/data/resources/knowledge.js";
import { videoResources } from "../src/data/resources/videos.js";
import { isPublicResource } from "../src/data/resources/visibility.js";
import { siteMetadata } from "../src/data/siteMetadata.js";
import { getVisibleSupportModules, supportModules } from "../src/data/supportModules.js";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

const compatibilityRoutes = [
  "/support",
  "/support/downloads",
  "/support/service",
  "/support/knowledge",
];

const publicRoutes = [
  "/support/documents",
  "/support/videos",
  "/inquiry",
  "/policy/privacy",
  "/policy/terms",
];

test("Support compatibility routes remain while only current destinations have public metadata", async () => {
  const app = await source("../src/App.jsx");
  for (const route of [...compatibilityRoutes, ...publicRoutes]) {
    assert.match(app, new RegExp(`path="${route.replaceAll("/", "\\/")}"`));
  }
  for (const route of publicRoutes) {
    assert.ok(siteMetadata[route]?.title);
    assert.ok(siteMetadata[route]?.description);
  }
  assert.match(siteMetadata["/support"].title, /服务与支持/);
  assert.ok(siteMetadata["/support/contact"]);
});

test("approved documents share their dataset with downloads; video archive remains intact", () => {
  assert.equal(documentResources.length, 4);
  assert.equal(downloadResources, documentResources);
  assert.ok(documentResources.every(isPublicResource));
  assert.equal(videoResources.length, 8);
  assert.ok(videoResources.every((record) => isPublicResource(record)));
  assert.deepEqual(knowledgeResources, []);
  assert.equal(isPublicResource({ contentStatus: "SOURCE", publicApproved: true, fileUrl: "/source.pdf" }), false);
  assert.equal(isPublicResource({ contentStatus: "VERIFIED", publicApproved: false, fileUrl: "/private.pdf" }), false);
  assert.equal(isPublicResource({ contentStatus: "VERIFIED", publicApproved: true, visibility: "PRIVATE", fileUrl: "/private.pdf" }), false);
  assert.equal(isPublicResource({ contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", fileUrl: "/approved.pdf" }), true);
});

test("Navbar exposes the practical support IA in its accessible dropdown", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  assert.match(navbar, /support-navigation/);
  assert.match(navbar, /supportOpen/);
  assert.match(navbar, />服务与支持</);
  assert.match(navbar, /getVisibleSupportModules/);
  assert.match(navbar, /to=\{item\.href\}/);
  assert.match(navbar, /aria-expanded=\{supportOpen\}/);
  assert.match(navbar, /scheduleSupportHoverClose/);
  assert.match(navbar, /event\.key !== "Escape"/);
  assert.doesNotMatch(navbar, /<span className="navbar__label">视频中心<\/span>/);
  assert.deepEqual(getVisibleSupportModules({ publicPreview: true }).map((item) => item.id), ["documents", "downloads", "service", "contact"]);
  assert.equal(supportModules.documents.href, "/support/documents");
  assert.equal(supportModules.videos.href, "/support/videos");
});

test("Navbar exposes one direct procurement and collaboration destination", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  assert.match(navbar, /to="\/inquiry"/);
  assert.match(navbar, />采购\/合作</);
  assert.match(navbar, /navbar__inquiry-link/);
  assert.doesNotMatch(navbar, /contact-navigation|contactOpen|to="\/contact"/);
});

test("Video compatibility remains public but outside primary support navigation", () => {
  assert.equal(supportModules.videos.publicVisible, true);
  assert.equal(supportModules.videos.primaryNavigation, false);
});

test("Footer shares the practical support navigation and preserves global contact and legal destinations", async () => {
  const footer = await source("../src/components/Footer.jsx");
  for (const route of ["/inquiry", "/policy/privacy", "/policy/terms"]) {
    assert.match(footer, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(footer, /getVisibleSupportModules/);
  assert.match(footer, /服务与支持/);
  assert.match(footer, /businessEmailHref/);
  assert.match(footer, /采购\/合作/);
});

test("Document Center exposes searchable published PDFs with separate view and download actions", async () => {
  const documentCenter = await source("../src/components/DocumentCenter.jsx");
  assert.match(documentCenter, /role="search"/);
  assert.match(documentCenter, /aria-pressed=\{activeCategory === category\.value\}/);
  assert.match(documentCenter, /resources\s*\.filter\(isPublicResource\)/);
  assert.doesNotMatch(documentCenter, /文档内容待补充|等待正式资料/);
  assert.match(documentCenter, /target="_blank" rel="noopener noreferrer"/);
  assert.match(documentCenter, /download aria-label/);
  assert.doesNotMatch(documentCenter, /href="#"/);
});

test("Inquiry form has validation semantics and active submission feedback", async () => {
  const form = await source("../src/components/InquiryForm.jsx");
  assert.match(form, /required: true/);
  assert.match(form, /aria-invalid/);
  assert.match(form, /role="alert"/);
  assert.match(form, /VITE_INQUIRY_ENABLED/);
  assert.match(form, /disabled=\{!inquiryEnabled \|\| submitState === "submitting"\}/);
  assert.match(form, /aria-busy=\{submitState === "submitting"\}/);
  assert.match(form, /fetch\("\/api\/inquiry"/);
});

test("robots allows the local V1 shell to be indexed without inventing a production domain", async () => {
  const robots = await source("../public/robots.txt");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(robots, /Sitemap:/);
});
