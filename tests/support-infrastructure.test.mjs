import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { documentResources } from "../src/data/resources/documents.js";
import { downloadResources } from "../src/data/resources/downloads.js";
import { knowledgeResources } from "../src/data/resources/knowledge.js";
import { videoResources } from "../src/data/resources/videos.js";
import { isPublicResource } from "../src/data/resources/visibility.js";
import { siteMetadata } from "../src/data/siteMetadata.js";
import { supportModules } from "../src/data/supportModules.js";

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
  assert.equal(siteMetadata["/support"], undefined);
});

test("only the approved video resource center is populated", () => {
  assert.deepEqual(documentResources, []);
  assert.deepEqual(downloadResources, []);
  assert.equal(videoResources.length, 8);
  assert.ok(videoResources.every((record) => isPublicResource(record)));
  assert.deepEqual(knowledgeResources, []);
  assert.equal(isPublicResource({ contentStatus: "SOURCE", publicApproved: true, fileUrl: "/source.pdf" }), false);
  assert.equal(isPublicResource({ contentStatus: "VERIFIED", publicApproved: false, fileUrl: "/private.pdf" }), false);
  assert.equal(isPublicResource({ contentStatus: "VERIFIED", publicApproved: true, visibility: "PRIVATE", fileUrl: "/private.pdf" }), false);
  assert.equal(isPublicResource({ contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", fileUrl: "/approved.pdf" }), true);
});

test("Navbar exposes Documents and Videos in one accessible Support dropdown", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  assert.match(navbar, /support-navigation/);
  assert.match(navbar, /supportOpen/);
  assert.match(navbar, />支持</);
  assert.match(navbar, /supportModules\.documents/);
  assert.match(navbar, /supportModules\.videos/);
  assert.match(navbar, /to=\{item\.href\}/);
  assert.match(navbar, /aria-expanded=\{supportOpen\}/);
  assert.match(navbar, /scheduleSupportHoverClose/);
  assert.match(navbar, /event\.key !== "Escape"/);
  assert.doesNotMatch(navbar, /<span className="navbar__label">视频中心<\/span>/);
  assert.doesNotMatch(navbar, /getVisibleSupportModules/);
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

test("Documents and Videos are the public Support modules", () => {
  assert.deepEqual(Object.values(supportModules).filter((module) => module.publicVisible).map((module) => module.id), ["documents", "videos"]);
});

test("Footer contains Documents and Videos under Support plus Inquiry and Legal destinations", async () => {
  const footer = await source("../src/components/Footer.jsx");
  for (const route of ["/support/documents", "/support/videos", "/inquiry", "/policy/privacy", "/policy/terms"]) {
    assert.match(footer, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.doesNotMatch(footer, /"\/support"|support\/downloads|support\/service|support\/knowledge|getVisibleSupportModules/);
  assert.match(footer, /文档中心/);
  assert.match(footer, /视频中心/);
  assert.match(footer, /采购\/合作/);
});

test("Document Center exposes a searchable framework and a safe empty placeholder", async () => {
  const documentCenter = await source("../src/components/DocumentCenter.jsx");
  assert.match(documentCenter, /role="search"/);
  assert.match(documentCenter, /aria-pressed=\{activeCategory === category\.value\}/);
  assert.match(documentCenter, /resources\s*\.filter\(isPublicResource\)/);
  assert.match(documentCenter, /文档内容待补充/);
  assert.match(documentCenter, /等待正式资料/);
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
