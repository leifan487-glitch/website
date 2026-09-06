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
  assert.match(sections, /role="tablist"/);
  assert.match(sections, /standard-specifications__matrix/);
  assert.doesNotMatch(sections, /StandardResourcesSection/);
});

test("product definition removes the repeated hero image and the product systems use structural layouts", async () => {
  const intro = await source("../src/components/MantisIntro.jsx");
  const sections = await source("../src/components/StandardProductSections.jsx");

  assert.doesNotMatch(intro, /mantis-standard-a01790|<img/);
  assert.match(intro, /mantis-intro__inner/);
  assert.match(intro, /机器人 \+ 效率工具/);
  assert.match(sections, /standard-modular__assembly/);
  assert.match(sections, /moduleGroups/);
  assert.match(sections, /standard-system__panel-heading/);
  assert.match(sections, /tabIndex=\{activeTab === tab\.id \? 0 : -1\}/);
  assert.match(sections, /BODY/);
  assert.match(sections, /BUILD/);
  assert.match(sections, /TASK/);
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
