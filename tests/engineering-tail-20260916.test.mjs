import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { finalPolish } from './helpers/final-polish-scope.mjs';
const bytes=f=>readFile(new URL('../'+f,import.meta.url));
const text=async f=>(await bytes(f)).toString();
test('Owner removes only the last two product sections and matching rail anchors',async()=>{
 const sections=await text('src/components/StandardProductSections.jsx');
 assert.doesNotMatch(sections,/StandardDocumentsSection|StandardInquirySection|product-documents|product-inquiry/);
 assert.match(sections,/<SpecificationsSection \/><StandardQaSection \/><\/>/);
 const rail=await text('src/components/ProductSectionRail.jsx');
 assert.equal((rail.match(/\{ id: /g)||[]).length,8);
 assert.doesNotMatch(rail,/product-documents|product-inquiry/);
 const restored=rail.replace('  { id: "questions", label: "六个问题" },','  { id: "questions", label: "六个问题" },\n  { id: "product-documents", label: "资料与开发" },\n  { id: "product-inquiry", label: "采购/合作" },');
 assert.equal(createHash('sha256').update(restored).digest('hex'),finalPolish.files['src/components/ProductSectionRail.jsx']);
 assert.match(await text('src/components/HomeSections.jsx'),/to="\/inquiry"/);
 assert.match(await text('src/App.jsx'),/path="\/inquiry"/);
});
test('Only engineering uses the approved replacement; its legacy film derivative remains intact',async()=>{
 const source=await text('src/components/HomeProductStory.jsx');
 assert.match(source,/item.id === "engineering" \? "engineering-v4" : item.id/); // 019.4R official studio render replaces corridor.
 const manifest=JSON.parse(await text('internal/engineering-tail-20260916.json'));
 const image=await bytes('public'+manifest.image);
 assert.equal(createHash('sha256').update(image).digest('hex'),manifest.sha256);
 assert.equal(image.length,manifest.bytes);
 assert.deepEqual(manifest.crop,[1920,1536,1250,300]);
 assert.equal(manifest.timestamp,43.2);
});
