import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {withoutMobileHero} from './helpers/mobile-hero-scope.mjs';
import {productHeroProducts} from '../src/data/productHeroProducts.js';
const read=f=>readFileSync(new URL('../'+f,import.meta.url));

test('Mobile art direction leaves desktop config, existing copy and all shared markup intact',()=>{
 for(const file of ['src/main.jsx','src/components/ProductHero.jsx','src/data/productHeroProducts.js']) {
  const baseline=execFileSync('git',['show',`7d9eb8f:${file}`]);
  assert.deepEqual(withoutMobileHero(file,read(file)),baseline,file);
 }
 const hero=read('src/components/ProductHero.jsx').toString();
 assert.equal((hero.match(/<h1/g)||[]).length,1);
 assert.equal((hero.match(/publicStartingPrice/g)||[]).length,1);
 assert.equal((hero.match(/<picture/g)||[]).length,1);
 assert.match(hero,/media="\(max-width: 767px\)"\s+srcSet=\{activeProduct.poster.phone.src\}/);
 assert.match(hero,/media="\(max-width: 900px\)"\s+srcSet=\{activeProduct.poster.mobile.src\}/);
});

test('Dedicated mobile render is traceable, portrait, compact and independent of desktop artwork',()=>{
 const record=JSON.parse(read('internal/mobile-hero-20260917.json'));
 const bytes=read(record.output),phone=productHeroProducts[0].poster.phone;
 assert.equal(record.assetId,'A01781');assert.equal(phone.width/phone.height,3/5);
 assert.equal('public'+phone.src,record.output);
 assert.equal(bytes.length,record.bytes);assert.ok(bytes.length<100_000);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
});

test('All mobile CSS is bounded to 767px, uses stable viewport sizing and never crops the robot',()=>{
 const css=read('src/mobile-hero.css').toString();
 const top=css.replace(/\/\*[\s\S]*?\*\//g,'').trim();
 let depth=0;
 for(const line of top.split('\n')){
  if(depth===0&&line.trim())assert.match(line,/^@media \(max-width: 767px\)/);
  depth+=(line.match(/\{/g)||[]).length-(line.match(/\}/g)||[]).length;
 }
 assert.equal(depth,0);assert.match(css,/height: 100svh/);
 assert.match(css,/object-fit: contain/);assert.doesNotMatch(css,/object-fit: cover|100dvh|transition:|animation:/);
 assert.match(css,/min-height: 44px/);assert.match(css,/safe-area-inset-bottom/);
});
