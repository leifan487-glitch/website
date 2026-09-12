import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { standardMediaProvenance } from "../internal/standard-media-provenance.mjs";
import { getStandardMediaByUsage, standardMedia } from "../src/data/standard/media.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");

test("Task 021 gives Applications one approved rapid multi-task montage", async () => {
  const page = await source("src/pages/ApplicationsPage.jsx");
  const [reel] = getStandardMediaByUsage("applicationsHero", { publicMode: true });

  assert.match(page, /getStandardMediaByUsage\("applicationsHero"/);
  assert.match(page, /sceneMedia = getStandardMediaByUsage\("applications"/);
  assert.equal(reel.sourceId, "APPLICATIONS-MULTI-TASK-REEL");
  assert.equal(reel.derivedCompilation, true);
  assert.equal(reel.derivativeType, "APPLICATIONS_MONTAGE_V2");
  assert.equal(reel.duration, 12.3);
  assert.deepEqual(reel.usages, ["applicationsHero"]);
  assert.equal(reel.audioRemoved, true);
});

test("Task 021 montage uses six website-exclusive source files with traceable action ranges", () => {
  const [reel] = getStandardMediaByUsage("applicationsHero", { publicMode: true });
  const otherSourceIds = new Set(standardMedia
    .filter((item) => item !== reel)
    .flatMap((item) => [item.sourceId, ...(item.sourceMediaIds ?? [])]));

  assert.deepEqual(reel.sourceMediaIds, ["SV002", "SV005", "SV032", "SV036", "SV044", "SV050"]);
  assert.equal(reel.sourceMediaIds.some((sourceId) => otherSourceIds.has(sourceId)), false);
  assert.ok(reel.clipRanges.every((range) => range.duration <= 2.1));
  assert.ok(Math.abs(reel.clipRanges.reduce((total, range) => total + range.duration, 0) - reel.duration) < 0.001);
  assert.ok(reel.sourceMediaIds.every((sourceId) => (
    standardMediaProvenance[sourceId]?.status === "SOURCE"
    && standardMediaProvenance[sourceId].sourceFile.startsWith("E:\\标准版视频网页\\")
  )));
});

test("Task 021 ships one versioned web-ready silent montage and poster", async () => {
  const [reel] = getStandardMediaByUsage("applicationsHero", { publicMode: true });
  const assetRoot = path.join(root, "public", path.dirname(reel.video));
  const [video, poster] = await Promise.all([
    fs.stat(path.join(assetRoot, "video.mp4")),
    fs.stat(path.join(assetRoot, "poster.webp")),
  ]);

  assert.match(reel.video, /applications-montage-v2\/video\.mp4$/);
  assert.match(reel.poster, /applications-montage-v2\/poster\.webp$/);
  assert.ok(video.size > 1_000_000 && video.size < 10_000_000);
  assert.ok(poster.size > 20_000 && poster.size < 500_000);
});
