import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {controlFix} from './helpers/task0191-control-fix.mjs';
test('Task0191 only passes empty Applications overlay clicks through, retaining selectable text',async()=>{
 const css=await readFile(new URL('../src/editorial.css',import.meta.url),'utf8');
 assert.ok(css.endsWith(controlFix));
 assert.equal(css.split(controlFix).length,2);
 assert.doesNotMatch(controlFix,/z-index|height|width|color|display/);
});
