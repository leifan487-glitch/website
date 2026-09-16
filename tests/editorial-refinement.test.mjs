import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");

test("Task 018.4 replaces remaining large slogans with direct page purposes", async () => {
  const [inquiry, explorer, technology, applications] = await Promise.all([
    source("src/pages/InquiryPage.jsx"),
    source("src/components/TechnologyExplorer.jsx"),
    source("src/pages/TechnologyPage.jsx"),
    source("src/pages/ApplicationsPage.jsx"),
  ]);

  assert.match(inquiry, /采购\/合作/);
  assert.match(inquiry, /InquiryForm/);
  assert.match(explorer, /platform.nameZh/);
  assert.match(explorer, /platform.purpose/);
  assert.doesNotMatch(technology, /从任务条件开始|讨论技术方案|to="\/inquiry"/);
  assert.match(applications, /应用方向/);
  assert.match(applications, /item.keywords/);
  assert.doesNotMatch(applications, /提交任务现场|明确合作目标|to="\/inquiry"/);

  const publicCopy = [inquiry, explorer, technology, applications].join("\n");
  for (const oldCopy of ["把任务描述清楚", "本体是起点", "把技术问题带到具体任务里", "应用不是目录", "告诉我们，你希望机器人进入怎样的任务"]) {
    assert.doesNotMatch(publicCopy, new RegExp(oldCopy));
  }
});

test("Task 018.4 keeps the inquiry contract and makes disabled availability explicit", async () => {
  const form = await source("src/components/InquiryForm.jsx");
  for (const token of ["需求信息", "在线提交功能准备中", "提交需求", "fetch(\"/api/inquiry\""]) {
    assert.match(form, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const field of ["name", "company", "role", "email", "city", "phone", "product", "application", "message", "website"]) {
    assert.match(form, new RegExp(`name=\"${field}\"|fieldProps\\(\"${field}\"`));
  }
});

test("Task 015.7 consolidates videos into one filterable library", async () => {
  const videoCenter = await source("src/components/VideoCenter.jsx");
  assert.match(videoCenter, /useState\("all"\)/);
  assert.match(videoCenter, /video-library__filters/);
  assert.match(videoCenter, /aria-pressed/);
  assert.match(videoCenter, /video-library__grid/);
  assert.doesNotMatch(videoCenter, /className="video-collection/);
});

test("Task 018.4 preserves video compatibility while About uses compact company sections", async () => {
  const [pageHero, supportPages, about, css] = await Promise.all([
    source("src/components/PageHero.jsx"),
    source("src/pages/SupportPages.jsx"),
    source("src/pages/AboutPage.jsx"),
    source("src/styles.css"),
  ]);

  assert.match(pageHero, /page-hero--\$\{variant\}/);
  assert.match(supportPages, /variant="video"/);
  assert.match(supportPages, /title="任务影像"/);
  assert.match(about, /公司使命/);
  assert.match(about, /产品与技术体系/);
  assert.match(about, /核心团队/);
  assert.match(about, /aligned-mission/);
  assert.doesNotMatch(about, /机器人与人工智能.*研发，最终要回到/);
  assert.match(css, /\.page-hero--video[\s\S]*?min-height: clamp\(400px, 48svh, 520px\)/);
  assert.match(css, /\.about-belief__media \{[\s\S]*?position: relative;[\s\S]*?aspect-ratio: 16 \/ 7\.5;/);
});
