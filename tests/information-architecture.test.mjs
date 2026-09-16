import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Task 018.2 Home composes the information-first product story", async () => {
  const homePage = await source("../src/pages/HomePage.jsx");

  assert.match(homePage, /ProductHero/);
  // Task 018.7 removes only the duplicate homepage explanation.
  assert.doesNotMatch(homePage, /HomeMantisIntro/);
  assert.match(homePage, /RealWorld/);
  assert.doesNotMatch(homePage, /HomeApplications/); // 018.8B-F replaces only this homepage rendering.
  assert.match(homePage, /HomePartners/);
  assert.doesNotMatch(homePage, /HomeAbout|FinalCta/);
  assert.match(homePage, /HomeOfficialFilm/);
  assert.match(homePage, /HomeForms/);
  assert.match(homePage, /HomeWhyModular/);
  assert.match(homePage, /HomeTechnology/);
  assert.match(homePage, /HomeContact/);
  assert.doesNotMatch(homePage, /HomeLatest/);
  assert.doesNotMatch(homePage, /MantisProductDetail/);
  assert.doesNotMatch(homePage, /components\/MantisIntro/);
});

test("Task 018.3 Standard owns a dedicated product story instead of repeated introduction sections", async () => {
  const productPage = await source("../src/pages/MantisStandardPage.jsx");

  assert.match(productPage, /ProductPageHeader/);
  assert.match(productPage, /StandardProductSections/);
  assert.match(productPage, /StandardPageMotion/);
  assert.doesNotMatch(productPage, /MantisIntro|MantisProductDetail/);
  assert.doesNotMatch(productPage, /RealWorld/);
});

test("The app exposes the Standard-only sitemap and legacy product redirects", async () => {
  const app = await source("../src/App.jsx");
  const heroConfig = await source("../src/data/productHeroProducts.js");

  assert.match(app, /path="\/"/);
  assert.match(app, /path="\/products\/mantis-standard"/);
  for (const route of ["/products", "/products/mantis-pro", "/technology", "/applications", "/about", "/news", "/contact"]) {
    assert.match(app, new RegExp(`path="${route.replaceAll("/", "\\/")}"`));
  }
  assert.match(heroConfig, /href: "\/products\/mantis-standard"/);
  assert.doesNotMatch(heroConfig, /mantis-pro|Mantis Pro|P0000/);
  assert.match(app, /path="\/products" element={<Navigate to="\/products\/mantis-standard" replace \/>}/);
  assert.match(app, /path="\/products\/mantis-pro" element={<Navigate to="\/products\/mantis-standard" replace \/>}/);
  assert.doesNotMatch(app, /mantis-ultra/);
});

test("New content is data-driven and internal statuses can be hidden centrally", async () => {
  const internalStatus = await source("../src/components/InternalStatus.jsx");
  for (const path of ["products.js", "technology.js", "applications.js", "news.js", "company.js"]) {
    await assert.doesNotReject(source(`../src/data/${path}`));
  }
  assert.match(internalStatus, /VITE_SHOW_INTERNAL_STATUS/);
});

test("Navbar exposes a Standard-only accessible product extension", async () => {
  const navbar = await source("../src/components/Navbar.jsx");

  assert.match(navbar, /aria-expanded={productOpen}/);
  assert.match(navbar, /aria-haspopup="true"/);
  assert.match(navbar, /aria-controls="product-navigation"/);
  assert.match(navbar, /className="navbar__label"/);
  assert.match(navbar, /event\.key !== "Escape"/);
  assert.match(navbar, /to="\/products\/mantis-standard"/);
  assert.match(navbar, /role="tablist"/);
  assert.match(navbar, /productView === "standard"/);
  assert.match(navbar, /productView === "upcoming"/);
  assert.match(navbar, /scheduleHoverClose/);
  assert.match(navbar, /280/);
  assert.match(navbar, /nav-standard-a01781\.webp/);
  assert.match(navbar, /敬请期待/);
  assert.doesNotMatch(navbar, /Mantis Pro|MANTIS PRO|Ultra/);
});

test("Navbar follows the viewport and gains a solid surface after scrolling", async () => {
  const navbar = await source("../src/components/Navbar.jsx");
  const css = await source("../src/styles.css");

  assert.match(navbar, /const \[scrolled, setScrolled\] = useState\(false\)/);
  assert.match(navbar, /window\.scrollY > 32/);
  assert.match(navbar, /addEventListener\("scroll", requestScrollUpdate, \{ passive: true \}\)/);
  assert.match(navbar, /cancelAnimationFrame/);
  assert.match(navbar, /data-solid=\{solidSurface\}/);
  assert.match(css, /\.navbar \{[\s\S]*?position: fixed;/);
  assert.match(css, /\.navbar\[data-solid="true"\]/);
  assert.match(css, /scroll-margin-top: calc\(var\(--nav-height\) \+ 18px\)/);
});
