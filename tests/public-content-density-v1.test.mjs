import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { publicProjectRecords } from "../src/data/applications.js";
import { standardPublicSpecs } from "../src/data/standard/specifications.js";
import { getStandardMediaByUsage, hasPublicStandardTaskMedia, standardDerivedMedia, standardMedia, standardTaskMedia } from "../src/data/standard/media.js";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Home public flow keeps the approved reel while Applications owns its exclusive hero media", async () => {
  const [home, sections, realWorld, styles] = await Promise.all([
    source("../src/pages/HomePage.jsx"),
    source("../src/components/HomeSections.jsx"),
    source("../src/components/RealWorld.jsx"),
    source("../src/styles.css"),
  ]);
  assert.doesNotMatch(home, /HomeTechnology|HomeLatest/);
  assert.match(realWorld, /hasPublicStandardTaskMedia/);
  assert.equal(hasPublicStandardTaskMedia, true);
  assert.equal(standardTaskMedia.length, 9);
  assert.equal(standardDerivedMedia.length, 1);
  assert.equal(standardMedia.length, 10);
  assert.equal(standardTaskMedia.filter((item) => item.usages.includes("homeRealWorld")).length, 0);
  assert.equal(getStandardMediaByUsage("homeRealWorld", { publicMode: true })[0].derivativeType, "HOMEPAGE_REEL");
  assert.equal(getStandardMediaByUsage("applicationsHero", { publicMode: true })[0].sourceId, "SV019");
  assert.ok(standardTaskMedia.every((item) => item.audioRemoved === true));
  assert.doesNotMatch(sections, /technologyMedia|applicationStories|company\.image/);
  assert.match(sections, /home-technology__diagram/);
  assert.match(sections, /HomeApplicationGallery/);
  assert.match(sections, /companyIdentity/);
  assert.match(sections, /companyMission/);
  assert.doesNotMatch(sections, /Xi'an, China/);
  assert.match(styles, /home-technology-content-in/);
  assert.match(styles, /writing-mode:\s*vertical-rl/);
  assert.match(styles, /min-width:\s*901px\) and \(prefers-reduced-motion:\s*reduce/);
});

test("five anonymous Project Record V1 entries include real content fields", () => {
  assert.equal(publicProjectRecords.length, 5);
  assert.ok(publicProjectRecords.every((record) => (
    record.summary
    && record.taskScope
    && record.applicationDirection
    && record.customerName === null
    && record.schoolName === null
    && record.media === null
    && record.mediaApproved === false
  )));
});

test("public Standard specifications are grouped and exclude unresolved values", () => {
  assert.equal(new Set(standardPublicSpecs.map((record) => record.group)).size, 6);
  const publicText = JSON.stringify(standardPublicSpecs);
  assert.doesNotMatch(publicText, /胚胎体|成熟体|完全体|究极体|孩子王|DIY王|导览王|科研王|王中王/);
  assert.doesNotMatch(publicText, /3\s*m\/s|5\s*m\/s|2\s*h|5\s*h|10\s*h|7\s*kg|22\s*DoF|1\?/i);
});

test("About uses approved product media and Inquiry exposes the active public-safe form", async () => {
  const [about, inquiry, form] = await Promise.all([
    source("../src/pages/AboutPage.jsx"),
    source("../src/pages/InquiryPage.jsx"),
    source("../src/components/InquiryForm.jsx"),
  ]);
  assert.match(about, /className="about-hero"/);
  assert.match(about, /detail-standard-a01792\.webp/);
  assert.match(about, /hero-standard-series-a01644\.webp/);
  assert.match(about, /!companyPublicMode \? <InternalStatus/);
  assert.match(inquiry, /从需求/);
  assert.match(inquiry, /InquiryForm/);
  assert.match(form, /fetch\("\/api\/inquiry"/);
  assert.doesNotMatch(form, /不会传输或保存数据/);
});
