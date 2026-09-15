import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { potentialApplications, publicProjectRecords } from "../src/data/applications.js";
import { companyProjects } from "../internal/company-applications-provenance.mjs";
import { companyIdentity, companyMission, leadership } from "../src/data/company.js";
import { companyIntroductionSource } from "../src/data/company/source.js";
import { isApprovedCompanyContent, selectCompanyContent } from "../src/data/company/visibility.js";
import { dexterousHandNameConflict, ipRecords, progressEvidenceRecords } from "../src/data/company/evidence.js";
import { publicProgressRecords, verifiedMediaCoverage } from "../src/data/news.js";
import { companyTechnologyPlatforms } from "../src/data/technology.js";

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

test("company source remains traceable while only Task 014-approved records are promoted", () => {
  assert.equal(companyIntroductionSource.pageCount, 36);
  assert.equal(companyIntroductionSource.contentStatus, "SOURCE");
  assert.equal(companyIntroductionSource.publicApproved, false);
  for (const record of [...companyProjects, ...progressEvidenceRecords]) {
    assert.equal(record.sourceId, companyIntroductionSource.id);
    assert.ok(record.sourcePage, `${record.id} lacks sourcePage`);
    assert.equal(record.contentStatus, "SOURCE");
    assert.equal(record.publicApproved, false);
    assert.ok(["LOW", "MEDIUM", "HIGH"].includes(record.claimRisk));
  }
  for (const record of [...companyTechnologyPlatforms, ...potentialApplications, companyIdentity, companyMission, ...leadership]) {
    assert.equal(record.sourceId, companyIntroductionSource.id);
    assert.ok(record.sourcePage, `${record.id} lacks sourcePage`);
    assert.equal(record.contentStatus, "VERIFIED");
    assert.equal(record.publicApproved, true);
  }
  assert.ok(publicProjectRecords.every((record) => record.customerName === null && record.schoolName === null));
  assert.ok(publicProgressRecords.every((record) => record.contentStatus === "VERIFIED" && record.publicApproved));
  assert.ok(verifiedMediaCoverage.every((record) => record.href.startsWith("https://")));
});

test("public company selection requires VERIFIED and explicit approval", () => {
  const verified = { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC" };
  assert.equal(isApprovedCompanyContent(verified), true);
  assert.equal(isApprovedCompanyContent({ ...verified, publicApproved: false }), false);
  assert.equal(isApprovedCompanyContent({ ...verified, contentStatus: "SOURCE" }), false);
  assert.equal(isApprovedCompanyContent({ ...verified, visibility: "PRIVATE" }), false);
  assert.deepEqual(selectCompanyContent(companyProjects, { publicMode: true }), []);
  assert.equal(selectCompanyContent(publicProjectRecords, { publicMode: true }).length, 5);
});

test("Task 018.4 company pages expose compact approved content and public guards", async () => {
  const [technology, applications, about, progress] = await Promise.all([
    source("../src/pages/TechnologyPage.jsx"),
    source("../src/pages/ApplicationsPage.jsx"),
    source("../src/pages/AboutPage.jsx"),
    source("../src/pages/NewsPage.jsx"),
  ]);
  for (const token of ["TechnologyExplorer", "alignedPlatforms", "ecosystem-title"]) assert.match(technology, new RegExp(token));
  assert.doesNotMatch(technology, /TECHNOLOGY INQUIRY|to="\/inquiry"/);
  assert.deepEqual(companyTechnologyPlatforms.map((item) => item.name), ["Silkworm", "Quantum", "Wormhole", "Honeycomb"]);
  for (const token of ["aligned-scenarios", "aligned-scenes", "getStandardMediaByUsage"]) assert.match(applications, new RegExp(token));
  assert.doesNotMatch(applications, /PROJECT INQUIRY|to="\/inquiry"/);
  for (const token of ["companyIdentity", "companyMission", "leadership", "intellectualPropertyCopy", "aligned-mission", "aligned-build", "aligned-people"]) assert.match(about, new RegExp(token));
  for (const token of ["COMPANY / PROGRESS", "COMPETITIONS", "媒体报道"]) assert.match(progress, new RegExp(token));
  assert.match(technology, /alignedPlatforms/);
  assert.doesNotMatch(applications, /companyProjects|companyPublicMode|InternalStatus/);
  assert.match(about, /selectCompanyContent\(leadership, \{publicMode:true\}\)/);
  assert.doesNotMatch(progress, /evidenceQueue|progressEvidenceRecords|NEEDS CONFIRMATION|companyPublicMode|InternalStatus/);
});

test("company source records use safe patent and evidence wording", async () => {
  assert.equal(ipRecords.length, 22);
  assert.ok(ipRecords.every((record) => record.status === "UNKNOWN" && record.publicApproved === false));
  const graphFiles = [
    "../src/data/company/evidence.js",
    "../src/data/news.js",
    "../src/pages/NewsPage.jsx",
    "../src/pages/AboutPage.jsx",
  ];
  const graph = (await Promise.all(graphFiles.map(source))).join("\n");
  assert.doesNotMatch(graph, /22项授权专利|央视认证|央视背书|世界排名10%|世界排名|奖金/);
  assert.match(graph, /全国亚军/);
});

test("dexterous hand naming conflict stays internal and has one safe public label", () => {
  assert.equal(dexterousHandNameConflict.contentStatus, "SOURCE");
  assert.equal(dexterousHandNameConflict.publicApproved, false);
  assert.equal(dexterousHandNameConflict.conflict, true);
  assert.equal(dexterousHandNameConflict.verification, "NEEDS CONFIRMATION");
  assert.equal(dexterousHandNameConflict.publicLabel, "自研灵巧手");
  assert.deepEqual(dexterousHandNameConflict.sourceValues.map((item) => item.name), ["FF8D-Hand", "FF16D-Hand"]);
  assert.deepEqual(dexterousHandNameConflict.sourceValues.map((item) => item.sourcePage), [19, 20]);
});

test("production bundle excludes prohibited public claim strings", async () => {
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  const distFiles = await files(dist);
  const textFiles = distFiles.filter((path) => [".js", ".css", ".html", ".json"].includes(extname(path)));
  const bundle = (await Promise.all(textFiles.map((path) => readFile(path, "utf8")))).join("\n");
  assert.doesNotMatch(bundle, /Mantis Pro|Mantis Ultra|Boston Dynamics RAI VS Blue Worm|波士顿动力\s*follow|世界排名10%|世界排名|奖金|央视认证|央视背书|22项授权专利/i);
});
