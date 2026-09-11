import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");

test("Task 018 uses one editorial heading component across key product and company surfaces", async () => {
  const [component, product, technology, applications, about, documents, videos] = await Promise.all([
    source("src/components/EditorialHeading.jsx"),
    source("src/components/StandardProductSections.jsx"),
    source("src/components/TechnologyExplorer.jsx"),
    source("src/pages/ApplicationsPage.jsx"),
    source("src/pages/AboutPage.jsx"),
    source("src/components/DocumentCenter.jsx"),
    source("src/components/VideoCenter.jsx"),
  ]);

  assert.match(component, /editorial-heading__meta/);
  assert.match(component, /editorial-heading__title/);
  assert.match(component, /editorial-heading__detail/);
  for (const file of [product, technology, applications, about, documents, videos]) {
    assert.match(file, /EditorialHeading/);
  }
});

test("Task 018 keeps the final product family height-contained on wide screens", async () => {
  const css = await source("src/styles.css");
  assert.match(css, /Task 018 cascade bridge/);
  assert.match(css, /\.final-cta__media img \{[\s\S]*?max-height: calc\(100% - 28px\)/);
  assert.match(css, /@media \(min-width: 1800px\)[\s\S]*?max-height: calc\(100% - 42px\)/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.final-cta__media \{[\s\S]*?inset: 454px -42% 0 -8%/);
});
