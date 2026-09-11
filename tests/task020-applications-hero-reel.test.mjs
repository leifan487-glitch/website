import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { standardMediaProvenance } from "../internal/standard-media-provenance.mjs";
import { getStandardMediaByUsage, standardMedia } from "../src/data/standard/media.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");

test("Task 020 gives Applications one approved multi-task hero reel", async () => {
  const page = await source("src/pages/ApplicationsPage.jsx");
  const [reel] = getStandardMediaByUsage("applicationsHero", { publicMode: true });

  assert.match(page, /getStandardMediaByUsage\("applicationsHero"/);
  assert.match(page, /sceneMedia = getStandardMediaByUsage\("applications"/);
  assert.equal(reel.sourceId, "APPLICATIONS-MULTI-TASK-REEL");
  assert.equal(reel.derivedCompilation, true);
  assert.equal(reel.derivativeType, "APPLICATIONS_REEL");
  assert.equal(reel.duration, 14);
  assert.deepEqual(reel.usages, ["applicationsHero"]);
  assert.equal(reel.audioRemoved, true);
});

test("Task 020 reel uses four website-exclusive source files with traceable ranges", () => {
  const [reel] = getStandardMediaByUsage("applicationsHero", { publicMode: true });
  const otherSourceIds = new Set(standardMedia
    .filter((item) => item !== reel)
    .flatMap((item) => [item.sourceId, ...(item.sourceMediaIds ?? [])]));

  assert.deepEqual(reel.sourceMediaIds, ["SV028", "SV004", "SV016", "SV043"]);
  assert.equal(reel.sourceMediaIds.some((sourceId) => otherSourceIds.has(sourceId)), false);
  assert.equal(reel.clipRanges.reduce((total, range) => total + range.duration, 0), reel.duration);
  assert.ok(reel.sourceMediaIds.every((sourceId) => (
    standardMediaProvenance[sourceId]?.status === "SOURCE"
    && standardMediaProvenance[sourceId].sourceFile.startsWith("E:\\标准版视频网页\\")
  )));
});

test("Task 020 ships one web-ready silent reel and poster", async () => {
  const assetRoot = path.join(root, "public", "assets", "videos", "standard", "applications-hero");
  const [video, poster] = await Promise.all([
    fs.stat(path.join(assetRoot, "video.mp4")),
    fs.stat(path.join(assetRoot, "poster.webp")),
  ]);

  assert.ok(video.size > 1_000_000 && video.size < 10_000_000);
  assert.ok(poster.size > 20_000 && poster.size < 500_000);
});
