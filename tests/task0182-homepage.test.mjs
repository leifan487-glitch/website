import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { standardCommercial } from "../src/data/standard/commercial.js";
import { homeForms, modularBenefits, homeTechnologyPlatforms, getPublicHomeNews, getPublicHomePartners } from "../src/data/home.js";
const source = path => readFile(new URL(path, import.meta.url), "utf8");

test("Task 018.2 limits the new commercial approval to one starting-price string", async () => {
  assert.equal(standardCommercial.publicStartingPrice, "0.98 万起");
  assert.equal(standardCommercial.contentStatus, "VERIFIED");
  assert.match(await source("../src/components/ProductHero.jsx"), /standardCommercial\.publicStartingPrice/);
  assert.doesNotMatch(JSON.stringify(standardCommercial), /9800|SKU|税|运费|质保|库存|套餐/);
});

test("Task 018.2 renders the agreed information order and only one product body CTA", async () => {
  const home = await source("../src/pages/HomePage.jsx");
  let position = -1;
  // Task 018.7 removes HomeMantisIntro; remaining order is unchanged.
  for (const name of ["ProductHero", "HomeOfficialFilm", "HomeForms", "HomeWhyModular", "RealWorld", "HomeTechnology", "HomePartners", "HomeNews", "HomeContact"]) {
    const next = home.indexOf(`<${name}`, position + 1);
    assert.ok(next > position, name); position = next;
  }
  assert.doesNotMatch(home, /HomeAbout|FinalCta/);
  for (const file of ["HomeMantisIntro", "HomeSections", "HomeProductStory"]) {
    const text = await source(`../src/components/${file}.jsx`);
    assert.doesNotMatch(text, /to="\/products\/mantis-standard"|效率工具/);
    assert.equal((text.match(/to="\/inquiry"/g) || []).length, file === "HomeSections" ? 1 : 0);
  }
});

test("Task 018.2 film is activated by an accessible button, not viewport autoplay", async () => {
  const film = await source("../src/components/HomeProductStory.jsx");
  assert.match(film, /useState\(false\)/);
  assert.match(film, /activated \? <video/);
  assert.match(film, /controls playsInline preload="none"/);
  assert.match(film, /onClick=\{\(\) => setActivated\(true\)\}/);
  assert.match(film, /video\.removeAttribute\("src"\)/);
  assert.doesNotMatch(film, /autoPlay|muted|IntersectionObserver/);
});

test("Task 018.2 forms and platform names are bounded, not configuration promises", () => {
  assert.equal(homeForms.length, 6);
  assert.equal(modularBenefits.length, 3);
  assert.deepEqual(homeTechnologyPlatforms.map(p => p.nameZh), ["春茧", "量子", "虫洞", "蜂巢"]);
  assert.doesNotMatch(JSON.stringify({homeForms,modularBenefits}), /1400|热插拔|免工具|任意互换|青春|豪华|旗舰|质保|DimOS/);
});

test("Task 018.2 news and partners hide empty or unapproved records", () => {
  assert.deepEqual(getPublicHomeNews([]), []);
  assert.deepEqual(getPublicHomePartners([]), []);
  assert.deepEqual(getPublicHomePartners().map(item=>item.name), ['西安电子科技大学','西安交通大学','陕旅集团','质子汽车']);
  const news = getPublicHomeNews()[0];
  assert.equal(news.publisher, "人民日报");
  for (const patch of [{publicApproved:false},{contentStatus:"SOURCE"},{visibility:"PRIVATE"},{publicationStatus:"draft"},{href:""}]) {
    assert.deepEqual(getPublicHomeNews([{...news,...patch}]),[]);
  }
  const partner = {id:"fixture",name:"Test",contentStatus:"VERIFIED",publicApproved:true,visibility:"PUBLIC",logoApproved:true,logo:"/assets/test.svg"};
  assert.equal(getPublicHomePartners([partner]).length,1);
  for(const patch of [{logoApproved:false},{visibility:"PRIVATE"},{contentStatus:"TODO"},{logo:"https://example.com/logo.svg"}]) {
    assert.deepEqual(getPublicHomePartners([{...partner,...patch}]),[]);
  }
});

test("Task 018.2 leaves locked A01644, Reel and official-film bytes intact", async () => {
  const locked = {
    "assets/hero-standard-series-a01644.webp":"945f440bc8fa6209a2d3d44f6c1bce766df96d2adc2ef3185c13194eb694f0e8",
    "assets/hero-standard-series-a01644-mobile.webp":"040625fd5de19e04575209074a65777cca68c9f617d7922ece2a0859b4299607",
    "assets/hero-standard-series-a01644-mobile-focus.webp":"25d89bf85ca2ca3e3eb748e9a42f8668d76f412bc69806217d7622bd3a5ebbac",
    "assets/videos/standard/home-real-world/video.mp4":"e8b40d543dee73619a6e8581d00729cec387591c05c6a2cb7c2a5aa88be2cc95",
    "assets/videos/standard/home-real-world/poster.webp":"2deb38dee04e39c89f68d4f2279fb09735c6cf8ef2a0026b6118eea7570947aa",
    "media/mantis-standard/official-product-film.mp4":"ed4f73c9a433c8cd83cd67533b06ffac581f1cea9551664007bebde8cac844e7",
  };
  for (const [file,hash] of Object.entries(locked)) {
    assert.equal(createHash("sha256").update(await readFile(new URL(`../public/${file}`,import.meta.url))).digest("hex"),hash,file);
  }
});
