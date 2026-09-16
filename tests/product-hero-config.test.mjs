import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { productHeroProducts } from "../src/data/productHeroProducts.js";

test("Standard is the only public Product Hero state", () => {
  const enabledProducts = productHeroProducts.filter((product) => product.enabled);

  assert.deepEqual(
    enabledProducts.map((product) => product.id),
    ["standard"],
  );
  assert.ok(enabledProducts.every((product) => product.contentStatus === "VERIFIED"));
  assert.ok(enabledProducts.every((product) => product.approval?.copy === true && product.approval?.claim === true));
});

test("Standard uses the restored A01644 product composition on desktop and mobile", () => {
  const standard = productHeroProducts.find((product) => product.id === "standard");

  assert.equal(standard.mediaMode, "series-array");
  assert.equal(standard.visualMode, "product-composition");
  assert.equal(standard.poster.desktop.assetId, "A01644");
  assert.match(standard.poster.desktop.src, /series-a01644/);
  assert.equal(standard.poster.mobile.assetId, "A01644");
  assert.equal(standard.poster.compact.assetId, "A01644");
  assert.match(standard.poster.compact.src, /mobile-focus/);
  assert.equal(standard.cta.href, "/products/mantis-standard");
  assert.equal(standard.positioning, "消费级");
  assert.deepEqual(standard.valueWords, ["More Useful", "More Options", "More Value"]);
});

test("the Standard state retains its locked responsive media layout", () => {
  for (const product of productHeroProducts.filter((item) => item.enabled)) {
    assert.ok(product.theme);
    assert.ok(product.mediaMode);
    assert.ok(product.name);
    assert.ok(product.variant);
    assert.ok(product.positioning);
    assert.ok(product.cta?.label);
    assert.ok(product.cta?.href);
    assert.ok(product.poster?.desktop?.src);
    assert.ok(product.poster?.mobile?.src);
    assert.ok(product.poster?.compact?.src);
    assert.ok(product.poster?.desktop?.assetId);
    assert.ok(product.poster?.mobile?.assetId);
    assert.ok(product.poster?.compact?.assetId);
    assert.ok(product.mediaLayout?.desktop?.objectFit);
    assert.ok(product.mediaLayout?.desktop?.objectPosition);
    assert.equal(typeof product.mediaLayout?.desktop?.scale, "number");
    assert.ok(product.mediaLayout?.desktop?.translateY);
    assert.ok(product.mediaLayout?.mobile?.objectFit);
    assert.ok(product.mediaLayout?.mobile?.objectPosition);
    assert.equal(typeof product.mediaLayout?.mobile?.scale, "number");
    assert.ok(product.mediaLayout?.compact?.objectFit);
    assert.ok(product.mediaLayout?.compact?.objectPosition);
    assert.equal(typeof product.mediaLayout?.compact?.scale, "number");
  }
});

test("Owner refinement contains the full Hero image and resets the legacy wide-screen offset", async () => {
  const styles = await readFile(new URL("../src/owner-refinements.css", import.meta.url), "utf8");
  assert.match(styles, /\.homepage-v2 \.product-hero\[data-media-mode="series-array"\] \.product-hero__media img\s*{[^}]*inset: 0;[^}]*width: 100%;[^}]*object-fit: contain;[^}]*transform: none;[^}]*mask-image: none;/s);
});
