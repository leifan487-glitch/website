import { reopened0188b } from "./helpers/task0188b-scope.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const read = p => readFile(new URL('../'+p,import.meta.url),'utf8');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
test('Task 018.7 limits source changes to five authorized files and preserves every RC asset',async()=>{
  const {baseline,files,exceptions}=JSON.parse(await read('internal/task0187-locked-files.json'));
  assert.equal(baseline,'bb3b328a2785bf344d1061b8b4e55212885768cc');
  assert.deepEqual(Object.keys(exceptions).sort(),['src/components/HomeProductStory.jsx','src/components/HomeSections.jsx','src/components/Navbar.jsx','src/home.css','src/pages/HomePage.jsx'].sort());
  for(const [file,hash] of Object.entries(files)) if(!exceptions[file]&&!reopened0188b.has(file)) assert.equal(digest(await readFile(new URL('../'+file,import.meta.url))),hash,file);
});
test('Task 018.7 official homepage-only crops have timestamps, hashes and a small WebP budget',async()=>{
  const m=JSON.parse(await read('internal/task0187-form-posters.json'));
  assert.equal(digest(await readFile(new URL('../'+m.source,import.meta.url))),m.sourceSha256);
  assert.deepEqual(m.records.map(r=>r.id),['arm','engineering','chassis','dual','inspection','complete']);
  assert.equal(m.width,800);assert.equal(m.height,640);
  let total=0;
  for(const r of m.records){
    assert.ok(r.timestamp>0);assert.equal(r.crop[0]/r.crop[1],1.25);
    assert.match(r.image,/^\/media\/mantis-standard\/home-forms\/[a-z]+\.webp$/);
    const bytes=await readFile(new URL('../public'+r.image,import.meta.url));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,r.bytes);assert.equal(digest(bytes),r.sha256);total+=bytes.length;
  }
  assert.ok(total<100000);
});
test('Task 018.7 removes duplication, retains real previews and does not add product claims',async()=>{
  const home=await read('src/pages/HomePage.jsx'),story=await read('src/components/HomeProductStory.jsx'),sections=await read('src/components/HomeSections.jsx');
  assert.doesNotMatch(home,/HomeMantisIntro/);
  assert.match(story,/>形态展示<\/h2>/); // Owner's four-character label; six real forms remain.
  // Owner's final polish uses new 4K-master crops; the historical assets above remain intact.
  assert.match(story,/width=\{1200\} height=\{960\} loading="lazy"/);
  assert.match(sections,/现场片段/);assert.match(sections,/slice\(0, 3\)/);
  assert.doesNotMatch(sections,/item.descriptionZh/);
  assert.match(sections,/getApplicationTaskAnchor\(item\)/);
  assert.doesNotMatch(story+sections,/最低成本|最高效率|热插拔|免工具|任意兼容|旗舰|豪华/);
});
