import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await files(path));
    else output.push(path);
  }
  return output;
}

test("public deploy source contains no product-specific Pro assets", async () => {
  const publicFiles = await files(fileURLToPath(new URL("../public/", import.meta.url)));
  const names = publicFiles.map(path => path.toLowerCase()).join("\n");
  assert.doesNotMatch(names, /hero-pro|pro-arm|technology-pro|p0000[1-5]/);
});

test("active public data contains Standard only", async () => {
  const hero = await readFile(new URL("../src/data/productHeroProducts.js", import.meta.url), "utf8");
  const products = await readFile(new URL("../src/data/products.js", import.meta.url), "utf8");
  const activeData = `${hero}\n${products}`;
  assert.doesNotMatch(activeData, /Mantis Pro|MANTIS PRO|P0000[1-5]|hero-pro/);
  assert.match(activeData, /Mantis Standard|STANDARD/);
});

test("production bundle contains no Pro product narrative or asset reference", async () => {
  const distFiles = await files(fileURLToPath(new URL("../dist/", import.meta.url)));
  const textFiles = distFiles.filter(path => [".js", ".css", ".html", ".json", ".md"].includes(extname(path)));
  const bundle = (await Promise.all(textFiles.map(path => readFile(path, "utf8")))).join("\n");
  assert.doesNotMatch(bundle, /Mantis Pro|MANTIS PRO|P0000[1-5]|hero-pro|pro-arm|technology-pro|product-hero__selector/);
});
