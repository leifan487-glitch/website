import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Home mounts the scoped GSAP motion controller", async () => {
  const homePage = await source("../src/pages/HomePage.jsx");

  assert.match(homePage, /useRef/);
  assert.match(homePage, /ref={mainRef}/);
  assert.ok(homePage.includes("<HomeMotion scopeRef={mainRef} />"));
});

test("homepage motion uses GSAP and ScrollTrigger with premium non-bouncy easing", async () => {
  const motion = await source("../src/components/HomeMotion.jsx");

  assert.ok(motion.includes('from "gsap"'));
  assert.ok(motion.includes('from "gsap/ScrollTrigger"'));
  assert.ok(motion.includes("gsap.registerPlugin(ScrollTrigger)"));
  assert.ok(motion.includes('const entranceEase = "expo.out"'));
  assert.doesNotMatch(motion, /bounce|elastic|back[.]out/i);
  assert.ok(motion.includes("stagger:"));
  assert.ok(motion.includes("clipPath:"));
});

test("homepage motion respects reduced motion and cleans up all animation state", async () => {
  const motion = await source("../src/components/HomeMotion.jsx");

  assert.ok(motion.includes("prefers-reduced-motion: no-preference"));
  assert.ok(motion.includes("prefers-reduced-motion: reduce"));
  assert.ok(motion.includes("media.revert()"));
  assert.ok(motion.includes("context.revert()"));
  assert.ok(motion.includes('remove("has-premium-motion")'));
  assert.ok(motion.includes('clearProps: "opacity,visibility,transform,clipPath,willChange"'));
});

test("media parallax is desktop-only and CSS composes reveal, parallax, and hover transforms", async () => {
  const [motion, styles] = await Promise.all([
    source("../src/components/HomeMotion.jsx"),
    source("../src/styles.css"),
  ]);

  assert.ok(motion.includes("min-width: 769px"));
  assert.ok(motion.includes('"--motion-media-y": "-3%"'));
  assert.ok(motion.includes('"--motion-media-y": "3%"'));
  assert.ok(styles.includes("--motion-media-y: 0%"));
  assert.ok(styles.includes("--motion-media-scale: 1"));
  assert.ok(styles.includes("translate3d(0, var(--motion-media-y), 0)"));
  assert.ok(styles.includes("scale(var(--motion-media-scale))"));
  assert.ok(styles.includes(".has-premium-motion .product-hero__swap"));
  assert.ok(styles.includes("animation: none"));
  assert.ok(!styles.includes("@keyframes task015-reveal"));
});
