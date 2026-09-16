import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("home hero uses the approved concise capability definition", async () => {
  const products = await source("../src/data/productHeroProducts.js");
  const hero = await source("../src/components/ProductHero.jsx");
  assert.match(products, /heroDefinition:\s*"一脑多型，真模块化"/);
  assert.match(hero, /activeProduct\.heroDefinition \|\| activeProduct\.positioning/);
  assert.doesNotMatch(hero, /InternalStatus as="p" className="product-hero__positioning"/);
});

test("Task 018.2 repurposes the second home screen to explain modularity", async () => {
  const intro = await source("../src/components/HomeMantisIntro.jsx");
  assert.match(intro, /双臂移动操作机器人/);
  assert.doesNotMatch(intro, /效率工具/);
  assert.match(intro, /同一套智能与软件体系/);
  assert.match(intro, /机器人由可组合模块构成/);
  assert.doesNotMatch(intro, /进入产品页/);
  assert.doesNotMatch(intro, /550 mm|standardPublicSpecs|capabilities/);
});

test("task gallery adds evidence labels without changing its expandable structure", async () => {
  const gallery = await source("../src/components/HomeApplicationGallery.jsx");
  assert.match(gallery, /SV035:\s*\["抓取", "移动", "放置"\]/);
  assert.match(gallery, /TASK \{String\(index \+ 1\)\.padStart/);
  assert.match(gallery, /home-application-gallery__process/);
  assert.match(gallery, /flexGrow: \(index\) => \(index === activeIndex \? 5\.4 : 1\)/);
});

test("final home conversion uses explicit product and cooperation actions", async () => {
  const cta = await source("../src/components/FinalCta.jsx");
  assert.match(cta, /深入了解/);
  assert.match(cta, /查看产品详情/);
  assert.match(cta, /采购\/合作/);
});

test("Task 018.5 language is a static Chinese status until translations exist", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  assert.match(navbar, /GlobeSimple/);
  assert.match(navbar, /<span>中文<\/span>/);
  assert.match(navbar, /navbar__language-status/);
  assert.match(navbar, /网站语言：中文/);
  assert.doesNotMatch(navbar, /languageOpen|选择网站语言|<span>English<\/span>|<span>日本語<\/span>/);
  assert.doesNotMatch(navbar, /한국어/);
});
