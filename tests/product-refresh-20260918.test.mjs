import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { productRefreshBaseline as baseline, productRefreshAdded, beforeProductRefresh } from './helpers/product-refresh-scope.mjs';
import { standardConfigurations as families, brochureApproval } from '../src/data/standard/brochureConfigurations.js';
const bytes=f=>readFileSync(new URL('../'+f,import.meta.url));
const text=f=>bytes(f).toString();
const hash=b=>createHash('sha256').update(b).digest('hex');
const walk=d=>readdirSync(new URL('../'+d,import.meta.url),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);

test('Owner product refresh and detail feedback change only scoped product views, rail entry and new product-only files',()=>{
 assert.equal(baseline.head,'4657812d3f4444612a0ddc10a10293284d15f937');
 const runtime=['src','public','worker'].flatMap(walk);
 assert.deepEqual(runtime.toSorted(),[...Object.keys(baseline.files),...productRefreshAdded].sort());
 assert.deepEqual(Object.keys(baseline.originals).sort(),['src/components/ProductPageHeader.jsx','src/components/StandardProductSections.jsx']);
 for(const [file,expected] of Object.entries(baseline.files)){
  if(Object.hasOwn(baseline.originals,file))assert.equal(hash(baseline.originals[file]),expected,'retained original '+file);
  else assert.equal(hash(beforeProductRefresh(file,bytes(file))),expected,file);
 }
});

test('Anatomy, tasks, performance, six questions and product section order remain byte-identical',()=>{
 const file='src/components/StandardProductSections.jsx',old=baseline.originals[file].replace(/export function DevelopmentSection\(\) \{[^]*?(?=\/\/ Task 019.6)/,'').replace('<DevelopmentSection />',''),current=text(file);
 const markers=['function Heading(', 'export function ProductOverviewSection(', 'export function ModularArchitectureSection(', 'export function CapabilitySystemSection(', 'export function RealTasksSection(', 'export function SpecificationsSection(', 'function QaItem(', 'export function StandardQaSection(', 'export function StandardProductSections('];
 const changed=new Set(['export function ProductOverviewSection(', 'export function ModularArchitectureSection(', 'export function DevelopmentSection(']);
 const piece=(source,start,end)=>source.slice(source.indexOf(start),end?source.indexOf(end):source.length);
 markers.forEach((start,i)=>{assert.ok(current.includes(start));if(!changed.has(start))assert.equal(piece(current,start,markers[i+1]),piece(old,start,markers[i+1]),start);});
 const hero=text('src/components/ProductPageHeader.jsx');
 assert.match(hero,/standardCommercial.publicStartingPrice/);
 assert.match(hero,/一脑多型，真模块化/);
 assert.match(hero,/href="#modular"/);assert.doesNotMatch(hero,/比较配置|href="#configurations"/);
});

test('Explicit Owner approval covers exactly four screenshot families and thirteen versions, not the source PDF',()=>{
 assert.equal(brochureApproval.contentStatus,'VERIFIED');assert.equal(brochureApproval.publicApproved,true);assert.equal(brochureApproval.rawPdfPublicApproved,false);
 assert.deepEqual(families.map(f=>[f.id,f.versions.length]),[['arm',2],['base',2],['dual',4],['body',5]]);
 assert.deepEqual(families[3].versions,['整机（入门王）','整机（DIY王）','整机（导览王）','整机（科研王）','整机（王中王）']);
 for(const family of families){
  assert.equal(new Set(family.rows.map(r=>r.label)).size,family.rows.length);
  for(const r of family.rows){assert.equal(r.values.length,family.versions.length);assert.ok(r.values.every(v=>typeof v==='boolean'||typeof v==='string'&&v.length));}
  assert.ok(bytes('public'+family.image).length>1000);
 }
 const row=(id,label)=>families.find(f=>f.id===id).rows.find(r=>r.label===label).values;
 assert.deepEqual(row('arm','质保期限'),['3个月','6个月 + 专项服务']);
 assert.deepEqual(row('base','质保期限'),['6个月 + 专项服务','1年 + 专项服务']);
 assert.deepEqual(row('dual','质保期限'),['3个月','6个月 + 专项服务','1年 + 专项服务','1年 + 专项服务']);
 assert.deepEqual(row('body','质保期限'),['3个月','6个月 + 专项服务','1年 + 专项服务','1年 + 专项服务','1年 + 专项服务']);
 assert.deepEqual(row('base','移动速度'),['5 m/s','5 m/s']);assert.deepEqual(row('base','综合续航'),['6 h','6 h']);
 assert.deepEqual(row('body','综合续航'),Array(5).fill('3 h'));
 assert.deepEqual(row('body','VLA 例程'),[false,false,false,true,true]);
 assert.deepEqual(row('dual','VLA 例程'),[false,false,false,true]);
 assert.doesNotMatch(JSON.stringify(families),/1300|价格|定价|¥|￥|渠道|Pro|Ultra/);
 assert.equal(walk('public').filter(f=>f.endsWith('.pdf')).length,4);
});

test('Native controls support keyboard, visible configuration scope, compact screens and reduced motion',()=>{
 const source=text('src/components/StandardBrochureSections.jsx'),css=text('src/components/standard-brochure.css');
 for(const expected of ['role="tablist"','role="tabpanel"','ArrowRight','ArrowLeft','aria-selected','<select','<table','scope="row"','scope="col"','仅看版本差异','不代表各版本的全部配备','具体服务内容请咨询销售'])assert.ok(source.includes(expected),expected);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);assert.match(css,/max-width: 1024px/);assert.match(css,/object-fit: contain/);
 assert.doesNotMatch(source,/<iframe|<canvas|\.pdf|autoPlay|onMouseMove/);
 assert.match(source,/<h2 id="overview-title">模块化平台<\/h2>/);
 assert.doesNotMatch(source,/BrochureDevelopment|home-forms-v2|一种平台/);
 assert.doesNotMatch(text('src/components/ProductSectionRail.jsx'),/id: "development"/);
 assert.match(css,/border-radius: 999px; background: #111/);
 assert.match(source,/href=\{officialProductFilm.src\}/);
});

test('Hero hover keeps its hit target stationary and limits motion to the contained arrow',()=>{
 const css=text('src/components/standard-brochure.css');
 const hover=css.match(/\.brochure-hero \.sp-button:hover \{([^}]+)\}/)?.[1];
 assert.ok(hover); assert.doesNotMatch(hover,/transform/);
 assert.match(css,/\.sp-button:hover svg \{ transform: translateY\(3px\); \}/);
 assert.match(css,/@media \(hover: hover\) and \(pointer: fine\)/);
 assert.match(css,/\.sp-button svg \{ pointer-events: none/);
 assert.match(css,/\.sp-button svg \{ transition: none; transform: none; \}/);
});

test('Product-only render replacements retain true source transparency without changing existing assets',()=>{
 const assets=JSON.parse(text('internal/product-polish-alpha-assets.json'));
 assert.deepEqual(assets.map(a=>a.name),['dual','inspection','engineering']);
 for(const asset of assets){const image=bytes(asset.output);assert.equal(hash(image),asset.outputSha256);assert.equal(asset.hasAlpha,true);assert.equal(image.toString('ascii',8,12),'WEBP');assert.ok(image.includes(Buffer.from('ALPH')));assert.match(asset.source,/标准版渲染\/.*\/PNG\//);}
 const brochure=text('src/components/StandardBrochureSections.jsx');
 assert.doesNotMatch(brochure,/brochureDevelopment|brochureModes|home-forms-v2/);
 assert.match(brochure,/performance-v1\/front.webp/);
 assert.equal(families.find(f=>f.id==='dual').image,'/media/mantis-standard/product-forms-alpha/dual.webp');
});
