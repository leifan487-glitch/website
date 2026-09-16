import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { homeForms, modularBenefits } from "../src/data/home.js";

test("Task 018.2R six official form posters have traceable timestamps and bounded payloads", async () => {
  const manifest = JSON.parse(await readFile(new URL("../internal/task0182r-form-posters.json", import.meta.url), "utf8"));
  assert.deepEqual(homeForms.map(item => item.name), ["机械臂形态", "工程形态", "底盘形态", "双臂形态", "巡检形态", "完整形态"]);
  let total = 0;
  for (const item of homeForms) {
    const provenance = manifest.records.find(record => record.id === item.id);
    assert.equal(item.sourceTimestamp, provenance.timestamp);
    assert.equal(item.image, provenance.image);
    assert.equal(item.width, 900);
    assert.equal(item.height, 720);
    const bytes = await readFile(new URL(`../public${item.image}`, import.meta.url));
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), provenance.sha256);
    assert.equal(bytes.length, provenance.bytes);
    assert.ok(bytes.length < 40000);
    total += bytes.length;
  }
  assert.ok(total < 120000);
});

test("Task 018.2R keeps poster loading lazy and value statements within approved meaning", async () => {
  const component = await readFile(new URL("../src/components/HomeProductStory.jsx", import.meta.url), "utf8");
  // Task 018.7 uses homepage-only crops; original six shared posters remain hash-locked above.
  assert.match(component, /home-forms-v2\/[^>]+loading="lazy"[^>]+decoding="async"/);
  assert.deepEqual(modularBenefits.map(item => item.title), ["按任务组合", "随需求扩展", "提高模块利用率"]);
  assert.match(modularBenefits[1].description, /扩展或重新组合已有模块/);
  assert.match(modularBenefits[2].description, /不是始终绑定在完整整机形态中/);
  assert.doesNotMatch(JSON.stringify({ homeForms, modularBenefits }), /最低|最高|节省|百分比|任意兼容|热插拔|免工具|套餐|质保/);
});
