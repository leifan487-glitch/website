import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {standardPublicSpecs,standardSpecs} from '../src/data/standard/specifications.js';
import {standardPerformance,standardPerformanceApproval} from '../src/data/standard/performance.js';
import {selectStandardContent} from '../src/data/standard/visibility.js';
import {beforeParameterApproval} from './helpers/task0197f-scope.mjs';
const bytes=f=>readFileSync(new URL('../'+f,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(bytes('internal/task0197f-scope.json'));
const approval=JSON.parse(bytes('internal/task0197f-approval.json'));
const historical=JSON.parse(bytes('internal/task0197-provenance.json'));
const walk=d=>readdirSync(new URL('../'+d,import.meta.url),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);

test('019.7F keeps every visual, media, route and server byte locked; only approved data may change',()=>{
 const runtime=['src','public','worker'].flatMap(walk);
 assert.deepEqual(runtime.toSorted(),Object.keys(baseline.files).filter(f=>/^(src|public|worker)\//.test(f)).sort());
 for(const f of runtime)if(f!=='src/data/standard/performance.js')assert.equal(hash(beforeParameterApproval(f,bytes(f))),baseline.files[f],f);
 for(const f of ['internal/task0197-provenance.json','internal/task0197-assets.json'])assert.equal(hash(bytes(f)),baseline.files[f],f);
});

test('019.7F explicitly approves all adopted PPT values, resolves the height conflict and preserves old source evidence',()=>{
 assert.equal(approval.resolution,'RESOLVED BY OWNER — PPT BASELINE APPROVED');
 assert.equal(approval.parameterHold,false);assert.equal(approval.publicApproved,true);
 assert.deepEqual(Object.keys(standardPerformance),approval.approvedParameterIds);
 assert.deepEqual(standardPerformance,Object.fromEntries(historical.parameters.map(({id,label,value,unit})=>[id,{label,value,unit}])));
 assert.equal(standardPerformanceApproval.source,'Owner-approved Performance PPT');
 assert.equal(standardPerformanceApproval.contentStatus,'VERIFIED');assert.equal(standardPerformanceApproval.publicApproved,true);assert.equal(standardPerformanceApproval.conflict,false);
 const dimensions=standardPublicSpecs.find(s=>s.id==='public-dimensions');
 assert.equal(dimensions.value+' '+dimensions.unit,'633 × 552 × 1400 mm');assert.equal(dimensions.source,approval.parameterSource);
 const legacy=standardSpecs.find(s=>s.id==='dimensions-overall');assert.equal(legacy.value,'633 x 552 x 1300');assert.equal(legacy.publicApproved,false);
 assert.deepEqual(selectStandardContent(standardSpecs,{publicMode:true}),[]);
 assert.doesNotMatch(JSON.stringify(selectStandardContent(standardPublicSpecs,{publicMode:true})),/1300/);
 assert.equal(walk('public').filter(f=>f.endsWith('.pdf')).length,4);
});

test('019.7F built public content contains no legacy product-height expression',()=>{
 const publicText=walk('dist/client').filter(f=>/\.(html|js|css|json|xml|txt)$/.test(f)).map(f=>bytes(f).toString()).join('\n');
 assert.doesNotMatch(publicText,/633\s*[x×*]\s*552\s*[x×*]\s*1300|1300\s*(?:mm|毫米)|(?:整机高度|整体高度|机身高度|高度)[^\n]{0,15}1300/i);
 assert.doesNotMatch(publicText,/Mantis\s+(?:Pro|Ultra)|渠道SKU|青春版|豪华版|旗舰版/);
});
