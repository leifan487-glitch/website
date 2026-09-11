import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");

test("Task 019 gives Applications an exclusive non-repeated hero video", async () => {
  const [page, media] = await Promise.all([
    source("src/pages/ApplicationsPage.jsx"),
    source("src/data/standard/media.js"),
  ]);

  assert.match(page, /getStandardMediaByUsage\("applicationsHero"/);
  assert.match(page, /sceneMedia = getStandardMediaByUsage\("applications"/);

  const recordStart = media.indexOf('id: "standard-video-sv019"');
  const recordEnd = media.indexOf("\n  },", recordStart);
  const heroRecord = media.slice(recordStart, recordEnd);
  assert.match(heroRecord, /sourceId: "SV019"/);
  assert.match(heroRecord, /usages: \["applicationsHero"\]/);
  assert.doesNotMatch(heroRecord, /videoCenter|productRealTasks|homeRealWorld/);
  assert.match(heroRecord, /audioRemoved: true/);
});

test("Task 019 ships a web-ready silent video and poster", async () => {
  const assetRoot = path.join(root, "public", "assets", "videos", "standard", "applications-hero");
  const [video, poster] = await Promise.all([
    fs.stat(path.join(assetRoot, "video.mp4")),
    fs.stat(path.join(assetRoot, "poster.webp")),
  ]);

  assert.ok(video.size > 1_000_000 && video.size < 10_000_000);
  assert.ok(poster.size > 20_000 && poster.size < 500_000);
});
