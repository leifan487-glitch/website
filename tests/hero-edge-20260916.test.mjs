import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Desktop Hero floor edge blends at the intrinsic image bounds without fading robots or mobile',async()=>{
 const css=await readFile(new URL('../src/owner-refinements.css',import.meta.url),'utf8');
 const block=css.match(/@media \(min-width: 901px\) \{([\s\S]*?)\n\}/)?.[1];
 assert.ok(block);
 assert.match(block,/width: auto; height: auto; max-width: 100%; max-height: 100%/);
 assert.match(block,/inset: auto 0 0/);
 assert.match(block,/-webkit-mask-image: linear-gradient\(to right, #000 88%, transparent 100%\)/);
 assert.match(block,/\n    mask-image: linear-gradient\(to right, #000 88%, transparent 100%\)/);
});
