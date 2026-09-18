import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("product page keeps the section rail and consolidates content without changing the homepage", async () => {
  const page = await source("../src/pages/MantisStandardPage.jsx");
  const home = await source("../src/pages/HomePage.jsx");
  const sections = await source("../src/components/StandardProductSections.jsx");

  assert.match(page, /ProductSectionRail/);
  assert.doesNotMatch(home, /ProductSectionRail|EditorialSpotlightRow/);
  assert.match(sections, /CapabilitySystemSection/);
  assert.doesNotMatch(sections, /role="tablist"/);
  assert.match(sections, /return <StandardPerformance \/>/); // 019.7 owner-approved native performance board.
  assert.doesNotMatch(sections, /StandardDocumentsSection|StandardInquirySection/);
});

test("product systems retain anatomy and native forms while Owner removes the standalone development chapter", async () => {
  const intro = await source("../src/components/MantisIntro.jsx");
  const sections = await source("../src/components/StandardProductSections.jsx");

  assert.doesNotMatch(intro, /mantis-standard-a01790|<img/);
  assert.match(intro, /mantis-intro__inner/);
  assert.match(intro, /双臂移动操作机器人/);
  const brochure = await source("../src/components/StandardBrochureSections.jsx");
  assert.match(brochure, /brochure-principles/);
  assert.match(sections, /structures\.map/);
  assert.doesNotMatch(brochure, /BrochureDevelopment|让开发，走向任务实践/);
  assert.doesNotMatch(sections, /<DevelopmentSection/);
  assert.doesNotMatch(sections, /systemTabs|activeTab/);
  assert.doesNotMatch(sections, /模块化<br \/>设计|从本体<br \/>到任务/);
});

test("section rail throttles pointer and scroll work and cleans up animation frames", async () => {
  const rail = await source("../src/components/ProductSectionRail.jsx");
  assert.match(rail, /requestAnimationFrame/);
  assert.match(rail, /cancelAnimationFrame/);
  assert.match(rail, /addEventListener\("scroll", requestActiveUpdate, \{ passive: true \}\)/);
  assert.match(rail, /aria-current=\{active \? "location"/);
});

test("spotlight is fine-pointer only and the CSS provides reduced-motion fallback", async () => {
  const spotlight = await source("../src/components/EditorialSpotlightRow.jsx");
  const css = await source("../src/styles.css");
  const pkg = JSON.parse(await source("../package.json"));

  assert.match(spotlight, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /Task 015\.2/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.equal(pkg.dependencies.motion, undefined);
  assert.equal(pkg.dependencies.three, undefined);
  assert.equal(pkg.dependencies.ogl, undefined);
});
