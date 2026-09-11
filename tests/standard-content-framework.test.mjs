import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { standardMediaProvenanceFields } from "../internal/standard-media-provenance.mjs";
import { documentResources } from "../src/data/resources/documents.js";
import { videoResources } from "../src/data/resources/videos.js";
import { isSupportModuleVisible } from "../src/data/supportModules.js";
import { standardConfigurations } from "../src/data/standard/configurations.js";
import { standardDerivedMedia, standardMedia, standardTaskMedia, standardTaskMediaFields, getStandardMediaByUsage } from "../src/data/standard/media.js";
import { standardPublicSpecs, standardSpecs } from "../src/data/standard/specifications.js";
import { selectStandardContent } from "../src/data/standard/visibility.js";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await files(path));
    else output.push(path);
  }
  return output;
}

test("Standard page retains sections 01–03 and adds confirmed content through Q&A", async () => {
  const page = await source("../src/pages/MantisStandardPage.jsx");
  const sections = await source("../src/components/StandardProductSections.jsx");
  for (const component of ["ProductPageHeader", "MantisIntro", "MantisProductDetail", "StandardProductSections"]) {
    assert.ok(page.indexOf(`<${component}`) > -1, `${component} missing`);
  }
  const ids = ["modular", "capability-system", "real-tasks", "specifications", "questions", "product-inquiry"];
  for (const id of ids) assert.match(sections, new RegExp(`id=\\"${id}\\"`));
  const renderOrder = ["ModularArchitectureSection", "CapabilitySystemSection", "RealTasksSection", "SpecificationsSection", "StandardQaSection", "StandardInquirySection"];
  const renderBlock = sections.slice(sections.indexOf("export function StandardProductSections"));
  let cursor = -1;
  for (const component of renderOrder) {
    const next = renderBlock.indexOf(`<${component}`);
    assert.ok(next > cursor, `${component} missing or out of order`);
    cursor = next;
  }
});

test("unapproved specs are available internally and absent from public selection", () => {
  assert.ok(standardSpecs.length > 0);
  assert.equal(selectStandardContent(standardSpecs, { publicMode: false }).length, standardSpecs.length);
  assert.deepEqual(selectStandardContent(standardSpecs, { publicMode: true }), []);
  assert.ok(standardSpecs.every((item) => item.contentStatus === "SOURCE" && item.publicApproved === false));
});

test("Task 014.1 publishes a conflict-safe six-group specification projection", () => {
  assert.equal(selectStandardContent(standardPublicSpecs, { publicMode: true }).length, standardPublicSpecs.length);
  assert.ok(standardPublicSpecs.every((item) => item.contentStatus === "VERIFIED" && item.publicApproved === true && item.conflict === false));
  assert.deepEqual([...new Set(standardPublicSpecs.map((item) => item.group))], [
    "Robot Body",
    "Mobility",
    "Dual Arm",
    "Lift / Workspace",
    "Compute / Interface",
    "Development / Connectivity",
  ]);
  assert.ok(standardPublicSpecs.some((item) => item.value === "根据配置不同"));
  assert.ok(standardPublicSpecs.every((item) => !/3\s*m\/s|5\s*m\/s|2\s*h|5\s*h|10\s*h|7\s*kg|22\s*DoF|1\?/i.test(`${item.value} ${item.unit}`)));
});

test("internal configurations, price and warranty are never public records", () => {
  assert.equal(standardConfigurations.length, 13);
  assert.ok(standardConfigurations.every((item) => item.visibility === "INTERNAL" && item.publicApproved === false));
  assert.ok(standardConfigurations.every((item) => item.internalName && item.price && item.warranty));
});

test("task media is one approval-driven usage source", () => {
  for (const field of ["sourceId", "titleZh", "titleEn", "taskGroup", "identity", "batchPublicPermission", "mediaApproved", "privacyRisk", "audioRemoved", "poster", "video", "duration", "usages", "publicApproved", "notes"]) {
    assert.ok(standardTaskMediaFields.includes(field));
  }
  assert.deepEqual(standardMediaProvenanceFields, ["sourceId", "sourceFile", "status"]);
  assert.equal(standardTaskMedia.length, 8);
  assert.equal(standardDerivedMedia.length, 2);
  assert.equal(standardMedia.length, 10);
  assert.equal(getStandardMediaByUsage("homeRealWorld", { publicMode: true }).length, 1);
  assert.equal(getStandardMediaByUsage("homeRealWorld", { publicMode: true })[0].derivativeType, "HOMEPAGE_REEL");
  assert.equal(getStandardMediaByUsage("productRealTasks", { publicMode: true }).length, 4);
  assert.equal(getStandardMediaByUsage("applications", { publicMode: true }).length, 3);
  assert.equal(getStandardMediaByUsage("applicationsHero", { publicMode: true }).length, 1);
  assert.equal(getStandardMediaByUsage("applicationsHero", { publicMode: true })[0].sourceId, "APPLICATIONS-MULTI-TASK-REEL");
  assert.equal(getStandardMediaByUsage("videoCenter", { publicMode: true }).length, 8);
  assert.equal(videoResources.length, 8);
  assert.ok(standardTaskMedia.every((item) => item.audioRemoved && item.batchPublicPermission && item.mediaApproved && item.publicApproved));
  assert.ok(standardTaskMedia.every((item) => !item.usages.includes("homeRealWorld")));
});

test("documents stay content-empty while Documents and Video Center follow Support visibility", () => {
  assert.deepEqual(documentResources, []);
  assert.equal(videoResources.length, 8);
  assert.equal(isSupportModuleVisible("documents", { publicPreview: true, hiddenModuleIds: [] }), true);
  assert.equal(isSupportModuleVisible("documents", { publicPreview: true, hiddenModuleIds: ["documents"] }), false);
  assert.equal(isSupportModuleVisible("videos", { publicPreview: true, hiddenModuleIds: [] }), true);
  assert.equal(isSupportModuleVisible("videos", { publicPreview: true, hiddenModuleIds: ["videos"] }), false);
});

test("Real Tasks player and Inquiry route are wired", async () => {
  const sections = await source("../src/components/StandardProductSections.jsx");
  assert.match(sections, /StandardMediaPlayer/);
  assert.match(sections, /productRealTasks/);
  assert.match(sections, /to="\/inquiry"/);
  assert.doesNotMatch(sections, /product-resources|support\/documents|support\/videos/);
});

test("Production Public visibility requires explicit approval and hides review badges", async () => {
  const visibility = await source("../src/data/standard/visibility.js");
  const internalStatus = await source("../src/components/InternalStatus.jsx");
  assert.match(visibility, /buildEnv\.MODE === "production"/);
  assert.match(visibility, /contentStatus === "VERIFIED"/);
  assert.match(visibility, /publicApproved === true/);
  assert.match(visibility, /record\.conflict !== true/);
  assert.match(internalStatus, /buildEnv\.MODE !== "production"/);
});

test("production bundle excludes internal configuration names, price and warranty", async () => {
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  const distFiles = await files(dist);
  const textFiles = distFiles.filter((path) => [".js", ".css", ".html", ".json"].includes(extname(path)));
  const bundle = (await Promise.all(textFiles.map((path) => readFile(path, "utf8")))).join("\n");
  assert.doesNotMatch(bundle, /丐版|幼年|胚胎体|究极体|孩子王|DIY王|导览王|科研王|王中王/);
  assert.doesNotMatch(bundle, /9800|15800|99800|市场定价|质保期限/);
  assert.doesNotMatch(bundle, /Mantis Pro|MANTIS PRO|hero-pro|p0000[1-5]/i);
});
