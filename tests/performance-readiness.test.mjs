import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const playerSource = await readFile(new URL("../src/components/StandardMediaPlayer.jsx", import.meta.url), "utf8");
const footerSource = await readFile(new URL("../src/components/Footer.jsx", import.meta.url), "utf8");

test("homepage reel defers its MP4 until it approaches the viewport", () => {
  assert.match(playerSource, /new IntersectionObserver/);
  assert.match(playerSource, /rootMargin: "80% 0px"/);
  assert.match(playerSource, /src=\{shouldLoad \? video : undefined\}/);
  assert.match(playerSource, /data-media-loaded=\{shouldLoad \? "true" : "false"\}/);
});

test("homepage loop pauses while offscreen and releases media on unmount", () => {
  assert.match(playerSource, /!inViewport/);
  assert.match(playerSource, /element\.removeAttribute\("src"\)/);
  assert.match(playerSource, /element\.load\(\)/);
});

test("footer logo does not join the initial above-the-fold request queue", () => {
  assert.match(footerSource, /brand-logo-reverse-a01621\.png[^>]+loading="lazy"[^>]+decoding="async"/s);
});
