import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { standardMediaProvenance, standardMediaProvenanceFields } from "../internal/standard-media-provenance.mjs";
import {
  getStandardMediaByUsage,
  standardDerivedMedia,
  standardMedia,
  standardTaskMedia,
  standardTaskMediaFields,
} from "../src/data/standard/media.js";

const task014AllowedIds = ["SV001", "SV003", "SV007", "SV010", "SV018", "SV035", "SV037", "SV054"];
const heldIds = ["SV049", "SV052", "SV053", "SV056", "SV057", "SV058", "SV059", "SV060", "SV061", "SV062"];

test("Task 014.3 retains its locked eight source-video records", () => {
  assert.deepEqual(standardTaskMedia.map((item) => item.sourceId).sort(), task014AllowedIds.sort());
  assert.equal(standardTaskMedia.some((item) => heldIds.includes(item.sourceId)), false);
  for (const field of ["id", "sourceId", "titleZh", "titleEn", "taskGroup", "identity", "batchPublicPermission", "mediaApproved", "privacyRisk", "audioRemoved", "poster", "video", "duration", "usages", "publicApproved", "notes"]) {
    assert.ok(standardTaskMediaFields.includes(field), `${field} missing from schema`);
  }
  assert.deepEqual(standardMediaProvenanceFields, ["sourceId", "sourceFile", "status"]);
});

test("public media records retain SOURCE provenance and explicit derivative approval", () => {
  assert.ok(standardTaskMedia.every((item) => (
    standardMediaProvenance[item.sourceId].status === "SOURCE"
    && item.batchPublicPermission === true
    && item.mediaApproved === true
    && item.audioRemoved === true
    && item.publicApproved === true
    && item.video.startsWith("/assets/videos/standard/")
    && item.poster.startsWith("/assets/videos/standard/")
    && standardMediaProvenance[item.sourceId].sourceFile.startsWith("E:\\标准版视频网页\\")
  )));
});

test("all referenced web derivatives exist", async () => {
  for (const item of standardMedia) {
    for (const asset of [item.video, item.poster, item.homeVideo, item.homePoster].filter(Boolean)) {
      const path = fileURLToPath(new URL(`../public${asset}`, import.meta.url));
      await access(path);
    }
  }
});

test("Homepage Real World resolves only to the approved derived reel", () => {
  assert.equal(standardTaskMedia.length, 8);
  assert.equal(standardDerivedMedia.length, 2);
  assert.equal(standardMedia.length, 10);

  const [reel] = getStandardMediaByUsage("homeRealWorld", { publicMode: true });
  assert.equal(reel, standardDerivedMedia[0]);
  assert.equal(reel.derivedCompilation, true);
  assert.equal(reel.derivativeType, "HOMEPAGE_REEL");
  assert.deepEqual(reel.sourceMediaIds, ["SV010", "SV018", "SV054", "SV007"]);
  assert.deepEqual(reel.clipRanges, [
    { sourceMediaId: "SV010", start: 2.5, end: 5.5, duration: 3 },
    { sourceMediaId: "SV018", start: 6, end: 10, duration: 4 },
    { sourceMediaId: "SV054", start: 8, end: 12, duration: 4 },
    { sourceMediaId: "SV007", start: 2, end: 5, duration: 3 },
  ]);
  assert.equal(reel.duration, 14);

  const [applicationsHero] = getStandardMediaByUsage("applicationsHero", { publicMode: true });
  assert.equal(applicationsHero.sourceId, "APPLICATIONS-MULTI-TASK-REEL");
  assert.equal(applicationsHero.derivedCompilation, true);
  assert.equal(applicationsHero.derivativeType, "APPLICATIONS_MONTAGE_V2");
  assert.deepEqual(applicationsHero.sourceMediaIds, ["SV002", "SV005", "SV032", "SV036", "SV044", "SV050"]);
  assert.deepEqual(applicationsHero.usages, ["applicationsHero"]);
  assert.equal(getStandardMediaByUsage("videoCenter", { publicMode: true }).length, 8);

  const sv035 = standardTaskMedia.find((item) => item.sourceId === "SV035");
  assert.deepEqual(sv035.usages, ["productRealTasks", "applications", "videoCenter"]);
  assert.equal("homeVideo" in sv035, false);
  assert.equal("homePoster" in sv035, false);
  assert.equal("homeDuration" in sv035, false);

  const sv037 = standardTaskMedia.find((item) => item.sourceId === "SV037");
  assert.match(sv037.notes, /unmasked public derivative/i);
  assert.doesNotMatch(sv037.notes, /privacy-safe masked derivative/i);
});

test("player provides poster activation, playsinline and reduced-motion handling", async () => {
  const component = await readFile(new URL("../src/components/StandardMediaPlayer.jsx", import.meta.url), "utf8");
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /playsInline/);
  assert.match(component, /preload=\{shouldLoad && autoplay \? "metadata" : "none"\}/);
  assert.match(component, /src=\{shouldLoad \? video : undefined\}/);
  assert.match(component, /aria-label=\{accessibleLabel\}/);
  assert.match(component, /暂停/);
});
