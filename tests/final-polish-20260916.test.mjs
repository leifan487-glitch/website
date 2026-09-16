import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { finalPolish, reopenedFinalPolish } from './helpers/final-polish-scope.mjs';
import { selectVideoDelivery, videoDelivery } from '../src/data/videoDelivery.js';
const read = f => readFile(new URL('../'+f,import.meta.url));
test('Final local polish preserves all prior-round facts, routes, media, server and inquiry files',async()=>{
 for(const [f,h]of Object.entries(finalPolish.files)) if(!reopenedFinalPolish.has(f)) assert.equal(createHash('sha256').update(await read(f)).digest('hex'),h,f);
 assert.equal(reopenedFinalPolish.size,6);
});
test('Delivery selects bounded approved variants, with stable desktop/mobile fallback',async()=>{
 assert.equal(Object.keys(videoDelivery).length,11);
 for(const [original,variants]of Object.entries(videoDelivery)){
  assert.equal(selectVideoDelivery(original,{compact:true}),variants.mobile);
  assert.equal(selectVideoDelivery(original,{compact:false}),variants.desktop);
  for(const file of new Set(Object.values(variants))){const b=await read('public'+file);assert.ok(b.length>1000);assert.equal(b.toString('ascii',4,8),'ftyp');assert.ok(b.indexOf(Buffer.from('moov'))<b.indexOf(Buffer.from('mdat')),file);}
 }
 assert.equal(selectVideoDelivery('/not-approved.mp4',{compact:true}),'/not-approved.mp4');
});
test('Six high-resolution photographic cards share one frame and unobstructed captions',async()=>{
 const source=(await read('src/components/HomeProductStory.jsx')).toString();
 assert.match(source,/home-forms-v2/);assert.match(source,/width=\{1200\} height=\{960\}/);
 for(const id of ['arm','engineering','chassis','dual','inspection','complete'])assert.equal((await read('public/media/mantis-standard/home-forms-v2/'+id+'.webp')).toString('ascii',8,12),'WEBP');
 const css=(await read('src/owner-refinements.css')).toString();assert.match(css,/figcaption \{ position: static/);assert.match(css,/width: min\(100%, 376px\)/);
});
test('Reviewed derivatives match the measured media manifest without changing frames or duration',async()=>{
 const {assets}=JSON.parse(await read('internal/final-polish-media.json'));
 assert.equal(Object.keys(assets).length,21);
 for(const [file,record]of Object.entries(assets)){
  const bytes=await read(file);assert.equal(bytes.length,record.bytes,file);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256,file);
  if(file.endsWith('.mp4')){assert.ok(record.ssim>.98,file);assert.equal(record.sameFrameCount,true,file);assert.equal(record.sameDuration,true,file);}
 }
});
test('Playback retains poster gating, retry, delayed feedback and explicit pause intent',async()=>{
 const source=(await read('src/components/StandardMediaPlayer.jsx')).toString();
 for(const expected of ['navigator.connection?.saveData','userPaused.current','onWaiting','onPlaying','onError','role="status"','重新加载','900'])assert.ok(source.includes(expected));
 const anatomy=(await read('src/components/StandardProductSections.jsx')).toString();assert.match(anatomy,/aria-controls=\{`part-/);assert.match(anatomy,/sp-anatomy__halo/);
});
