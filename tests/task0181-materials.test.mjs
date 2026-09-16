import assert from "node:assert/strict";
import test from "node:test";
import { readFile, stat } from "node:fs/promises";
import { documentResources } from "../src/data/resources/documents.js";
import { downloadResources } from "../src/data/resources/downloads.js";
import { officialProductFilm } from "../src/data/standard/officialFilm.js";
import { standardMedia } from "../src/data/standard/media.js";
import { businessEmail } from "../src/data/contact.js";
import worker from "../worker/index.js";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Task 018.1 publishes four real, approved PDFs from one resource dataset", async () => {
  assert.equal(downloadResources, documentResources);
  assert.equal(documentResources.length, 4);
  for (const doc of documentResources) {
    const data = await readFile(new URL(`../public${doc.fileUrl}`, import.meta.url));
    assert.equal(data.subarray(0, 5).toString(), "%PDF-");
    assert.equal(data.length, doc.fileSize);
    assert.ok(doc.publicApproved && doc.contentStatus === "VERIFIED");
    assert.match(doc.title, /^Mantis Standard 人形机器人/);
    assert.doesNotMatch(JSON.stringify(doc), /file:\/\/|[A-Z]:\\|经验素材取地/);
  }
});

test("Task 018.1 prepares the official film without enrolling it into existing reels or Video Center", async () => {
  assert.equal(officialProductFilm.usage, "homepage-feature");
  assert.equal(officialProductFilm.hasAudio, true);
  assert.equal(officialProductFilm.publicApproved, true);
  assert.ok(!standardMedia.some((item) => item.id === officialProductFilm.id));
  const file = await readFile(new URL(`../public${officialProductFilm.src}`, import.meta.url));
  assert.ok(file.length < 25 * 1024 * 1024);
  assert.ok(file.indexOf(Buffer.from("moov")) < file.indexOf(Buffer.from("mdat")), "faststart metadata must precede media");
  assert.ok((await stat(new URL(`../public${officialProductFilm.poster}`, import.meta.url))).size > 1000);
  assert.match(await source("../src/components/HomeProductStory.jsx"), /officialProductFilm/);
});

test("Task 018.1 email is public, but recipient alone cannot enable delivery", async () => {
  assert.equal(businessEmail, "business@bluewormrobotics.com");
  assert.match(await source("../.env.example"), /VITE_INQUIRY_ENABLED=false/);
  assert.match(await source("../.env.example"), /INQUIRY_TO_EMAIL=business@bluewormrobotics\.com/);
  const response = await worker.fetch(new Request("https://example.test/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://example.test" },
    body: JSON.stringify({ name: "QA", company: "Example", city: "Xi'an", phone: "1234567890", product: "Mantis Standard", application: "科研测试" }),
  }), { MAIL_PROVIDER: "resend", INQUIRY_TO_EMAIL: businessEmail });
  assert.equal(response.status, 503);
});

test("Task 018.1 service routes serve the shell while unknown routes keep genuine 404 status", async () => {
  for (const route of ["/support", "/support/contact", "/support/documents", "/support/downloads", "/support/service", "/missing-task0181"]) {
    const response = await worker.fetch(new Request(`https://example.test${route}`, { headers: { Accept: "text/html" } }), {
      ASSETS: { fetch: async (request) => new URL(request.url).pathname === "/"
        ? new Response("app", { headers: { "Content-Type": "text/html" } })
        : new Response("missing", { status: 404 }) },
    });
    assert.equal(response.status, route.startsWith("/missing") ? 404 : route === "/support/downloads" ? 308 : 200, route);
  }
});

test("Task 018.1 removes future efficiency-tool narrative and body inquiry CTAs", async () => {
  for (const path of ["components/HomeMantisIntro.jsx", "components/MantisIntro.jsx", "components/Footer.jsx", "components/Navbar.jsx", "data/standard/product.js", "data/standard/qa.js", "data/standard/capabilities.js", "data/siteMetadata.js"]) {
    assert.doesNotMatch(await source(`../src/${path}`), /效率工具|efficiency.tools|tool system/i, path);
  }
  for (const path of ["TechnologyPage", "ApplicationsPage"]) {
    assert.doesNotMatch(await source(`../src/pages/${path}.jsx`), /to="\/inquiry"|subpage-contact/);
  }
});
