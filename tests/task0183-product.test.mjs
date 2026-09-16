import { reopened0188b } from "./helpers/task0188b-scope.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { standardForms, standardHardware, standardDevelopmentPaths } from "../src/data/standard/story.js";
import { homeForms } from "../src/data/home.js";
import { standardQa } from "../src/data/standard/qa.js";
const read = file => readFile(new URL("../" + file, import.meta.url), "utf8");

test("Task 018.3 locks homepage, standalone routes, baseline and all existing public media", async () => {
  const locked = JSON.parse(await read("internal/task0183-locked-files.json"));
  const { exceptions: polish0187 } = JSON.parse(await read("internal/task0187-locked-files.json"));
  // Task 018.4 explicitly reopens only these remaining-page implementations.
  // Preserve the historical snapshot; the 018.4 test separately locks Home / Standard.
  const reopened0184 = new Set(["src/pages/TechnologyPage.jsx", "src/pages/ApplicationsPage.jsx", "src/pages/AboutPage.jsx", "src/pages/InquiryPage.jsx", "src/components/TechnologyExplorer.jsx", "src/components/InquiryForm.jsx", "src/components/SubpageMotion.jsx"]);
  for (const [file, expected] of Object.entries(locked)) {
    if (polish0187[file] || reopened0188b.has(file)) continue; // Explicit five-file polish scope; other RC files remain hash-locked.
    if (reopened0184.has(file)) continue;
    // Task 018.5: only documented navigation/media bugs and mobile document density.
    if (["src/App.jsx", "src/components/Navbar.jsx", "src/components/StandardMediaPlayer.jsx", "src/styles.css", "src/support.css"].includes(file)) continue;
    const actual = createHash("sha256").update(await readFile(new URL("../" + file, import.meta.url))).digest("hex");
    assert.equal(actual, expected, file);
  }
});

test("Task 018.3 reuses six official posters and retains bounded detailed form copy", () => {
  assert.deepEqual(standardForms.map(item => item.image), homeForms.map(item => item.image));
  assert.deepEqual(standardForms.map(item => item.sourceTimestamp), homeForms.map(item => item.sourceTimestamp));
  assert.ok(standardForms.every(item => item.paragraphs.length >= 2 && item.paragraphs.length <= 3));
  assert.equal(standardHardware.length, 7);
  assert.equal(standardDevelopmentPaths.length, 4);
});

test("Task 018.3 six questions preserve detailed reasoning behind always-visible summaries", async () => {
  assert.equal(standardQa.length, 6);
  assert.ok(standardQa.every(item => item.answer && item.fullExplanation.length >= 3));
  assert.match(standardQa[3].fullExplanation.join(""), /首次使用|首次购买/);
  assert.match(standardQa[3].fullExplanation.join(""), /已经使用|已经购买/);
  assert.match(standardQa[4].fullExplanation.join(""), /不是人的复制品/);
  const text = JSON.stringify({ standardForms, standardQa, standardDevelopmentPaths });
  assert.doesNotMatch(text, /行业最低|行业首次|性能全面领先|任意互换|随意组合|热插拔|免工具|1400|7kg|7自由度|4k60|专业的机器人摄影师|SOTA/);
  const source = await read("src/components/StandardProductSections.jsx");
  assert.match(source, /useState\(false\)/);
  assert.match(source, /sp-question__summary/);
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /hidden=\{!open\}/);
  assert.match(source, /fullExplanation\.map/);
});

test("Task 018.3 single price source and click-only media survive Owner tail removal", async () => {
  const hero = await read("src/components/ProductPageHeader.jsx");
  assert.match(hero, /standardCommercial\.publicStartingPrice/);
  assert.doesNotMatch(hero, /0\.98/);
  const source = await read("src/components/StandardProductSections.jsx");
  assert.match(source, /standardPublicSpecs, \{ publicMode: true \}/);
  assert.doesNotMatch(source, /to="\/support\/documents"/); // Owner 2026-09-16 removes the documents tail block.
  assert.doesNotMatch(source, /href=\{item.fileUrl\} download/); // 018.8B centralizes PDF actions.
  assert.equal((source.match(/to="\/inquiry"/g) || []).length, 0); // Independent route and navigation remain.
  assert.doesNotMatch(source, /<video|autoPlay|homeLoop|<iframe/);
  assert.match(source, /href=\{officialProductFilm.src\}/);
});

test("Task 018.3 scoped motion respects reduced motion and cleans up", async () => {
  const motion = await read("src/components/StandardPageMotion.jsx");
  assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.match(motion, /conditions.desktop \? 24 : 10/);
  assert.match(motion, /media.revert\(\)/);
  assert.match(motion, /context.revert\(\)/);
  assert.match(motion, /resize.disconnect\(\)/);
  assert.doesNotMatch(motion, /scrub|parallax|pin:/);
});
