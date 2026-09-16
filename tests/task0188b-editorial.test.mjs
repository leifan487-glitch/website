import test from 'node:test';
import { withoutVideoRange } from './helpers/video-range-scope.mjs';
import {reopened0188bf,reopenedHomeFinal} from './helpers/task0188b-scope.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import worker from '../worker/index.js';
import {getSitemapRoutes} from '../src/data/siteMetadata.js';
import {getApplicationTaskAnchor} from '../src/data/applicationTaskAnchors.js';
import {getStandardMediaByUsage} from '../src/data/standard/media.js';
const bytes=f=>readFile(new URL('../'+f,import.meta.url));
const read=async f=>(await bytes(f)).toString();
const hash=b=>createHash('sha256').update(b).digest('hex');
test('018.8B preserves facts, six questions, all assets and email/security implementation',async()=>{
 const lock=JSON.parse(await read('internal/task0188b-locked-files.json'));
 assert.ok(lock.reopened.every(f=>!f.startsWith('public/')&&!f.startsWith('src/data/standard/')&&!f.startsWith('src/data/company/')));
 for(const [f,h] of Object.entries(lock.files))if(!lock.reopened.includes(f)&&!reopened0188bf.has(f)&&!reopenedHomeFinal.has(f))assert.equal(hash(await bytes(f)),h,f);
 assert.equal(hash(withoutVideoRange(await read('worker/index.js')).split('const SECURITY_HEADERS')[1]),lock.workerImplementation);
 assert.match(await read('.env.example'),/VITE_INQUIRY_ENABLED=false/);
});
test('018.8B canonical news and document routes work without reviving Progress',async()=>{
 for(const method of ['GET','HEAD'])for(const route of ['/support/downloads','/news/peoples-daily-whrg-2025','/progress','/missing-0188b']){
  const response=await worker.fetch(new Request('https://example.test'+route,{method,headers:{Accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('app',{headers:{'Content-Type':'text/html'}})}});
  assert.equal(response.status,route==='/support/downloads'?308:route.startsWith('/news/')?200:404);
  if(route==='/support/downloads')assert.equal(response.headers.get('Location'),'https://example.test/support/documents');
 }
 assert.ok(getSitemapRoutes().includes('/news/peoples-daily-whrg-2025'));
 assert.ok(!getSitemapRoutes().includes('/support/downloads'));
 const detail=await read('src/pages/NewsDetailPage.jsx');
 assert.match(detail,/查看人民日报原文/);assert.match(detail,/target="_blank" rel="noopener noreferrer"/);
 assert.doesNotMatch(detail,/<iframe|<img|fetch\(/);
});
test('018.8B keeps three unique task anchors and six structures plus separate development',async()=>{
 const anchors=getStandardMediaByUsage('applications',{publicMode:true}).map(getApplicationTaskAnchor);
 assert.equal(new Set(anchors).size,3);assert.ok(anchors.every(Boolean));
 const standard=await read('src/components/StandardProductSections.jsx');
 assert.match(standard,/产品结构与接口/);assert.match(standard,/sp-development-interface/);
 assert.doesNotMatch(standard,/SixFormsSection|sp-forms__grid|documentResources\.filter/);
 assert.equal((standard.match(/to="\/support\/documents"/g)||[]).length,0); // Owner removes only the product-page tail block.
 const css=await read('src/editorial.css');assert.match(css,/HarmonyOS Sans SC/);assert.doesNotMatch(css,/@font-face|url\(/);
});
