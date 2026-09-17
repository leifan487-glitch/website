import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reopened0196} from './helpers/task0196-scope.mjs';
import {added0197} from './helpers/task0197-scope.mjs';
import {beforeParameterApproval} from './helpers/task0197f-scope.mjs';
import {homeTechnologyPlatforms} from '../src/data/home.js';
import {alignedPlatforms} from '../src/data/alignment.js';
import {bwBrain} from '../src/data/bwBrain.js';
import {standardPublicSpecs} from '../src/data/standard/specifications.js';
import {documentResources} from '../src/data/resources/documents.js';
const bytes=f=>readFileSync(new URL('../'+f,import.meta.url));
const text=f=>bytes(f).toString();
const hash=b=>createHash('sha256').update(b).digest('hex');
const scope=JSON.parse(text('internal/task0196-scope.json'));
const sections=JSON.parse(text('internal/task0196-locked-sections.json'));
const walk=d=>readdirSync(new URL('../'+d,import.meta.url),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);

test('019.6 limits runtime changes to seven owner-authorized files and removes only the old relationship component',()=>{
 assert.equal(scope.baseline,'25f5105c921d6c7282f513b61c9df97844a9d975');
 assert.equal(reopened0196.size,7);
 for(const [f,h]of Object.entries(scope.files))if(!reopened0196.has(f))assert.equal(hash(beforeParameterApproval(f,bytes(f))),h,f);
 const current=['src','public','worker'].flatMap(walk);
 assert.deepEqual(current.filter(f=>!(f in scope.files)).sort(),added0197.toSorted());
 assert.deepEqual(Object.keys(scope.files).filter(f=>!current.includes(f)),['src/components/BrainRelationship.jsx']);
});
test('019.6 preserves locked sections inside reopened files, including six questions and Hero CSS',()=>{
 for(const {file,start,end,sha256}of sections){const source=text(file);const first=source.indexOf(start);assert.ok(first>=0,file);const last=end?source.indexOf(end,first):source.length;assert.ok(last>first,file);assert.equal(hash(source.slice(first,last)),sha256,file+' '+start);}
});
test('019.6 has one shared ordered five-peer IA and a temporary owner-approved Brain name',()=>{
 for(const list of [homeTechnologyPlatforms,alignedPlatforms]){
  assert.deepEqual(list.map(p=>p.id),['silkworm','quantum','bw-brain','wormhole','honeycomb']);
  assert.deepEqual(list.map(p=>p.nameZh),['春茧','量子','大脑','虫洞','蜂巢']);
  assert.ok(list.every(p=>p.contentStatus==='VERIFIED'&&p.publicApproved));
 }
 const brain=alignedPlatforms[2];assert.equal(brain.name,'BW Brain');assert.equal(brain.description,bwBrain.description);assert.deepEqual(brain.concepts,[]);
 assert.match(text('src/data/home.js'),/TEMPORARY OWNER NAME \/ FINAL CN NAME TBD/);
 assert.equal(alignedPlatforms[3].roleZh,'具身基础模型');
 assert.match(alignedPlatforms[3].description,/为 BW Brain 智能体提供基础模型支撑/);
 assert.ok(!existsSync(new URL('../src/components/BrainRelationship.jsx',import.meta.url)));
 for(const file of ['src/components/HomeSections.jsx','src/pages/TechnologyPage.jsx'])assert.doesNotMatch(text(file),/BrainRelationship|technology-brain/);
 assert.match(text('src/pages/TechnologyPage.jsx'),/index < alignedPlatforms.length - 1/);
});
test('019.6 historical source values are retained; 019.7 explicitly replaces only their four-row presentation',()=>{
 const source=text('src/components/StandardProductSections.jsx');
 const ids=['public-dimensions','public-base-dof','public-arm-reach','public-lift-range'];
 assert.deepEqual(ids.map(id=>{const s=standardPublicSpecs.find(s=>s.id===id);assert.equal(s.publicApproved,true);return [s.value,s.unit]}),[['633 × 552 × 1400','mm'],['3 自由度全向移动',''],['663','mm'],['550','mm']]); // Owner 019.7F
 const section=source.split('export function SpecificationsSection()')[1].split('function QaItem')[0];
 assert.match(section,/return <StandardPerformance \/>/);
 assert.equal((text('src/components/StandardPerformance.jsx').match(/具体配置请咨询销售/g)||[]).length,1);
 assert.doesNotMatch(section,/standardSpecGroups|sp-specs__grid|根据配置不同/);
});
test('019.6 restores exactly one lightweight contextual technology CTA and no new products or PDFs',()=>{
 const home=text('src/components/HomeSections.jsx');
 assert.equal((home.match(/to="\/technology"/g)||[]).length,1);
 assert.match(home,/to="\/technology">了解技术体系<ArrowRight/);
 const publicSource=['src/components/HomeSections.jsx','src/pages/TechnologyPage.jsx','src/components/StandardProductSections.jsx','src/data/home.js'].map(text).join('\n');
 assert.doesNotMatch(publicSource,/Mantis\s+(Pro|Ultra)|敬请期待|青春|进阶|豪华|旗舰|质保/);
 assert.equal(documentResources.length,4);
 assert.deepEqual(walk('public').filter(f=>f.endsWith('.pdf')).sort(),documentResources.map(d=>'public'+d.fileUrl).sort());
 for(const d of documentResources)assert.equal(hash(bytes('public'+d.fileUrl)),scope.files['public'+d.fileUrl]);
});
