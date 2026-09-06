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
  "/support/documents",
  "/support/downloads",
  "/support/service",
  "/support/knowledge",
];

const publicRoutes = [
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

test("Navbar exposes one direct Video Center destination without a Support dropdown", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  assert.match(navbar, /to="\/support\/videos"/);
  assert.match(navbar, />视频中心</);
  assert.doesNotMatch(navbar, /support-navigation|supportOpen|supportItems|getVisibleSupportModules|closeSupportNav/);
  for (const module of Object.values(supportModules)) assert.match(module.href, /^\/support\//);
});

test("Navbar exposes one direct Inquiry destination without a Contact dropdown", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  assert.match(navbar, /to="\/inquiry"/);
  assert.match(navbar, />联系我们</);
  assert.doesNotMatch(navbar, /contact-navigation|contactOpen|to="\/contact"/);
});

test("Video Center is the only public Support module", () => {
  assert.deepEqual(Object.values(supportModules).filter((module) => module.publicVisible).map((module) => module.id), ["videos"]);
});

test("Footer contains only Video Center under Support plus Inquiry and Legal destinations", async () => {
  const footer = await source("../src/components/Footer.jsx");
  for (const route of ["/support/videos", "/inquiry", "/policy/privacy", "/policy/terms"]) {
    assert.match(footer, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.doesNotMatch(footer, /"\/support"|support\/documents|support\/downloads|support\/service|support\/knowledge|getVisibleSupportModules/);
  assert.match(footer, /视频中心/);
  assert.match(footer, /商务询盘/);
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
