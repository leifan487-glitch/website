import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {standardPerformance} from '../src/data/standard/performance.js';
import {added0197} from './helpers/task0197-scope.mjs';
import {beforeParameterApproval} from './helpers/task0197f-scope.mjs';
const bytes=f=>readFileSync(new URL('../'+f,import.meta.url));
const text=f=>bytes(f).toString();
const hash=b=>createHash('sha256').update(b).digest('hex');
const scope=JSON.parse(text('internal/task0197-scope.json'));
const provenance=JSON.parse(text('internal/task0197-provenance.json'));
const assets=JSON.parse(text('internal/task0197-assets.json'));
const walk=d=>readdirSync(new URL('../'+d,import.meta.url),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);

test('019.7 changes only the parameter section and adds its bounded native implementation and official derivatives',()=>{
 for(const [f,h]of Object.entries(scope.files))if(f!=='src/components/StandardProductSections.jsx')assert.equal(hash(beforeParameterApproval(f,bytes(f))),h,f);
 const files=['src','public','worker'].flatMap(walk);
 assert.deepEqual(files.filter(f=>!(f in scope.files)).sort(),added0197.toSorted());
 assert.deepEqual(Object.keys(scope.files).filter(f=>!files.includes(f)),[]);
 // Existing sibling sections are also protected by the retained 019.6 partial hashes.
 const source=text('src/components/StandardProductSections.jsx');
 assert.match(source,/export function SpecificationsSection\(\) \{\s+return <StandardPerformance \/>;\s+\}/);
});

test('019.7 renders exactly the 14 source-backed parameters, with the height discrepancy explicitly retained internally',()=>{
 assert.equal(provenance.parameters.length,14);
 assert.deepEqual(standardPerformance,Object.fromEntries(provenance.parameters.map(({id,label,value,unit})=>[id,{label,value,unit}])));
 assert.equal(standardPerformance.height.value,'1400');
 assert.equal(provenance.conflict.previous,'1300 mm');
 const source=text('src/components/StandardPerformance.jsx');
 assert.deepEqual([...source.matchAll(/<Metric name="([^"]+)"/g)].map(m=>m[1]).sort(),Object.keys(standardPerformance).sort());
 assert.equal((source.match(/具体配置请咨询销售/g)||[]).length,1);
 assert.doesNotMatch(source,/iframe|canvas|\.pdf|渠道|青春|豪华|旗舰|质保/);
});

test('019.7 official images are individually optimized, traceable and not a screenshot of the performance slide',()=>{
 assert.equal(assets.length,6);
 for(const asset of assets){assert.equal(hash(bytes(asset.output)),asset.outputSha256);assert.ok(asset.bytes<100000);assert.ok(asset.sourceDimensions[0]>=4500);assert.match(asset.source,/标准版渲染\/.*\/PNG\//);}
 assert.equal(walk('public').filter(f=>f.endsWith('.pdf')).length,4);
});

test('019.7 provides native semantic metrics, touch-independent layout and reduced-motion hover fallback',()=>{
 const source=text('src/components/StandardPerformance.jsx'),css=text('src/components/standard-performance.css');
 assert.match(source,/<dt>\{label\}<\/dt><dd>/);assert.match(source,/loading="lazy" decoding="async"/);
 assert.match(css,/@media \(hover: hover\) and \(pointer: fine\)/);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
 assert.match(css,/object-fit: contain/);assert.match(css,/max-width: 599px/);
 assert.doesNotMatch(source,/onMouse|onTouch|tabIndex/);
});
