import test from 'node:test';
import {withoutMobileHero} from './helpers/mobile-hero-scope.mjs';
import {beforeControlFix} from './helpers/task0191-control-fix.mjs';
import {reopenedHomeFinal} from './helpers/task0188b-scope.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {partners} from '../src/data/partners.js';
import {getPublicHomeNews,getPublicHomePartners} from '../src/data/home.js';
const bytes=f=>readFile(new URL('../'+f,import.meta.url)),hash=b=>createHash('sha256').update(b).digest('hex');
test('018.8B-F keeps locked source, all prior media and Navbar byte-identical',async()=>{
 const lock=JSON.parse(await bytes('internal/task0188bf-locked-files.json'));
 assert.deepEqual(lock.reopened,['src/pages/HomePage.jsx','src/components/HomeSections.jsx','src/data/home.js','src/data/news.js','src/home.css']);
 for(const [file,h]of Object.entries(lock.files))if(!lock.reopened.includes(file)&&!reopenedHomeFinal.has(file))assert.equal(hash(beforeControlFix(file,withoutMobileHero(file,await bytes(file)))),h,file);
});
test('018.8B-F uses the exact Owner source and four official logos without new relationships',async()=>{
 assert.equal(getPublicHomeNews()[0].href,'http://gd.people.com.cn/n2/2025/0818/c123932-41325012.html');
 assert.deepEqual(partners.map(p=>p.name),['西安电子科技大学','西安交通大学','陕旅集团','质子汽车']);
 const sources=JSON.parse(await bytes('internal/task0188bf-logo-sources.json'));
 assert.equal(getPublicHomePartners().length,4);
 for(const p of partners){assert.equal(p.alt,p.name);assert.equal(p.publicApproved,true);const r=sources.records.find(r=>r.id===p.id);assert.equal(hash(await bytes('public'+p.logo)),r.sha256);}
 const page=(await bytes('src/pages/HomePage.jsx')).toString();assert.doesNotMatch(page,/HomeApplications/);assert.ok(page.indexOf('<HomeTechnology')<page.indexOf('<HomePartners'));assert.ok(page.indexOf('<HomePartners')<page.indexOf('<HomeNews'));
 const section=(await bytes('src/components/HomeSections.jsx')).toString().split('export function HomePartners')[1].split('export function HomeContact')[0];assert.doesNotMatch(section,/<a\b|<Link|source|notes|战略|客户/);
});
