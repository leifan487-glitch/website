import test from 'node:test';
import {withoutMobileHero} from './helpers/mobile-hero-scope.mjs';
import {reopenedOwnerFeedback} from './helpers/owner-feedback-scope.mjs';
import {beforeControlFix} from './helpers/task0191-control-fix.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import worker from '../worker/index.js';
import {getSitemapRoutes} from '../src/data/siteMetadata.js';
const bytes=f=>readFile(new URL('../'+f,import.meta.url)),hash=b=>createHash('sha256').update(b).digest('hex');
test('Final homepage preserves Hero, facts, partner/news assets and all non-authorized source',async()=>{
 const lock=JSON.parse(await bytes('internal/home-final-locked-files.json'));
 for(const [file,h]of Object.entries(lock.files))if(!lock.reopened.includes(file)&&!reopenedOwnerFeedback.has(file))assert.equal(hash(beforeControlFix(file,withoutMobileHero(file,await bytes(file)))),h,file);
 assert.equal(lock.reopened.length,7);
});
test('Owner refinement restores standalone Inquiry and legacy Contact redirects',async()=>{
 for(const method of ['GET','HEAD']){
  const r=await worker.fetch(new Request('https://example.test/contact',{method}),{});
  assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://example.test/inquiry');
  const page=await worker.fetch(new Request('https://example.test/inquiry',{method,headers:{Accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('app',{headers:{'Content-Type':'text/html'}})}});
  assert.equal(page.status,200);
 }
 assert.ok(getSitemapRoutes().includes('/inquiry'));
 const app=(await bytes('src/App.jsx')).toString();assert.match(app,/path="\/inquiry" element=\{<InquiryPage/);
 const form=(await bytes('src/components/InquiryForm.jsx')).toString();assert.match(form,/if \(!inquiryEnabled\) return/);assert.match(form,/fetch\("\/api\/inquiry"/);
});
test('Owner refinement keeps six photographic forms and one homepage Inquiry link without inline form',async()=>{
 const story=(await bytes('src/components/HomeProductStory.jsx')).toString(),sections=(await bytes('src/components/HomeSections.jsx')).toString();
 for(const s of ['产品影片','形态展示','按需组合'])assert.ok(story.includes('>'+s+'</h2>'));
 for(const s of ['核心技术','合作伙伴','新闻动态','采购合作'])assert.ok(sections.includes('>'+s+'</h2>'));
 assert.doesNotMatch(sections,/InquiryForm|home-inquiry-panel|aria-expanded/);
 assert.equal((sections.match(/to="\/inquiry"/g)||[]).length,1);
 assert.match((await bytes('src/home-final.css')).toString(),/object-fit: cover/);
 assert.match((await bytes('.env.example')).toString(),/VITE_INQUIRY_ENABLED=false/);
});
