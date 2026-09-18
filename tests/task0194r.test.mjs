import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reopened0194r} from './helpers/task0194r-scope.mjs';
import {reopened0196} from './helpers/task0196-scope.mjs';
import {added0197} from './helpers/task0197-scope.mjs';
import {productRefreshAdded} from './helpers/product-refresh-scope.mjs';
import {bwBrain} from '../src/data/bwBrain.js';
import {documentResources} from '../src/data/resources/documents.js';
import {alignedPlatforms} from '../src/data/alignment.js';
import {standardPublicSpecs} from '../src/data/standard/specifications.js';
import {beforeWormholeName} from './helpers/wormhole-name-scope.mjs';
import {beforeParameterApproval} from './helpers/task0197f-scope.mjs';
const bytes=f=>readFileSync(new URL('../'+f,import.meta.url));
const text=f=>bytes(f).toString();
const hash=b=>createHash('sha256').update(b).digest('hex');
const scope=JSON.parse(text('internal/task0194r-scope.json'));
const provenance=JSON.parse(text('internal/task0194r-provenance.json'));
function walk(dir){return readdirSync(new URL('../'+dir,import.meta.url),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}

test('019.4R retains every baseline fact, asset, video, mobile composition and server byte outside seven authorized sources',()=>{
 assert.equal(scope.baseline,'9b3e8d32200a7db45ac421f98574bf77f198a21d');
 assert.deepEqual([...reopened0194r].sort(),scope.allowed.toSorted());
 for(const [f,h]of Object.entries(scope.files))if(!reopened0194r.has(f)&&!reopened0196.has(f))assert.equal(hash(beforeParameterApproval(f,beforeWormholeName(f,bytes(f)))),h,f);
 const added=[...walk('src'),...walk('public'),...walk('worker')].filter(f=>!(f in scope.files));
 assert.deepEqual(added.sort(),['src/boss-review.css','src/data/bwBrain.js',provenance.engineering.output,...added0197,...productRefreshAdded].sort());
});
test('019.6 moves the source-backed Agent into the five-entry IA without adding capability claims',()=>{
 assert.equal(alignedPlatforms.length,5);
 assert.deepEqual(alignedPlatforms.map(p=>p.id),['silkworm','quantum','bw-brain','wormhole','honeycomb']);
 assert.equal(bwBrain.name,'BW Brain');assert.equal(bwBrain.description,provenance.brain.publicCopy);
 assert.match(bwBrain.role,/Agent/);assert.equal(bwBrain.modelRole,'具身基础模型');
 assert.doesNotMatch(alignedPlatforms.find(p=>p.id==='wormhole').concepts.join(' '),/Agent|MCP/);
 for(const f of ['src/components/HomeSections.jsx','src/pages/TechnologyPage.jsx'])assert.doesNotMatch(text(f),/BrainRelationship/);
 assert.doesNotMatch(text('src/components/HomeSections.jsx'),/查看技术体系/);
 assert.doesNotMatch(text('src/data/bwBrain.js'),/VLA\+|DRL|WAM|性能|自主|泛化|未来/);
});
test('019.4R navbar adds one home link and one formal document entry using the existing routes',()=>{
 const nav=text('src/components/Navbar.jsx');
 assert.equal((nav.match(/<NavLink to="\/" end/g)||[]).length,1);
 assert.ok(nav.indexOf('<NavLink to="/" end')<nav.indexOf('className="navbar__product"'));
 assert.match(nav,/className="navbar__product-documents" to="\/support\/documents" onClick=\{closeProductNav\}/);
 assert.match(text('src/boss-review.css'),/a.is-active:not\(\.navbar__inquiry-link\)/);
});
test('019.4R engineering derivative is versioned and other five images remain unchanged',()=>{
 const r=provenance.engineering,b=bytes(r.output);assert.equal(hash(b),r.outputSha256);assert.equal(b.length,r.bytes);assert.ok(b.length<100000);
 assert.equal(b.toString('ascii',8,12),'WEBP');assert.deepEqual(r.dimensions,[1200,960]);
 assert.match(text('src/components/HomeProductStory.jsx'),/item.id === "engineering" \? "engineering-v4" : item.id/);
 for(const id of ['arm','chassis','dual','inspection','complete']){const f=`public/media/mantis-standard/home-forms-v2/${id}.webp`;assert.equal(hash(bytes(f)),scope.files[f]);}
});
test('019.4R exposes exactly four unchanged approved PDFs and no manual/parameter/warranty addition',()=>{
 assert.equal(documentResources.length,4);
 assert.deepEqual(walk('public').filter(f=>f.endsWith('.pdf')).sort(),documentResources.map(d=>'public'+d.fileUrl).sort());
 for(const d of documentResources){assert.equal(d.publicApproved,true);assert.equal(hash(bytes('public'+d.fileUrl)),scope.files['public'+d.fileUrl]);}
 assert.deepEqual(provenance.manual.pagesActuallyReused,[]);assert.equal(provenance.manual.public,false);
 const dimension=standardPublicSpecs.find(s=>s.id==='public-dimensions');
 assert.equal(`${dimension.value} ${dimension.unit}`,'633 × 552 × 1400 mm'); // Owner 019.7F
 assert.match(text('src/components/InquiryForm.jsx'),/if \(!inquiryEnabled\) return/);
 for(const f of ['src/data/bwBrain.js','src/data/home.js'])assert.doesNotMatch(text(f),/1400|质保|旗舰|豪华|入门王|渠道/);
});
test('019.4R supporting typography never overrides the approved title or viewport image layout',()=>{
 const css=text('src/boss-review.css');
 assert.doesNotMatch(css,/product-hero__(?:name|media|image|content)|100[sd]?vh|object-fit/);
 assert.match(css,/product-hero__positioning.*font-weight: 500/);
 assert.match(css,/product-hero__price.*font-weight: 600/);
 assert.match(css,/max-width: 767px/);
});
test('019.4R-Fix uses foundation-model wording and omits the last platform arrow only',()=>{
 const wormhole=alignedPlatforms.find(p=>p.id==='wormhole');
 assert.equal(wormhole.roleZh,'具身基础模型');
 assert.doesNotMatch(wormhole.description,/具身智能模型/);
 assert.match(wormhole.description,/具身基础模型平台/);
 assert.match(text('src/pages/TechnologyPage.jsx'),/index < alignedPlatforms.length - 1 \? <ArrowRight size=\{16\} aria-hidden="true" \/> : null/);
 assert.equal(bwBrain.role,'智能体（Agent）层');
 assert.equal(bwBrain.description,provenance.brain.publicCopy);
});
