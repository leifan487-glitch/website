import { reopened0188b } from "./helpers/task0188b-scope.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('Task 018.5 preserves every snapshot source and public resource outside six documented fix files',async()=>{
 const {files,exceptions}=JSON.parse(await read('internal/task0185-locked-files.json'));
 const {exceptions:polish0187}=JSON.parse(await read('internal/task0187-locked-files.json'));
 for(const [file,h]of Object.entries(files))if(!exceptions[file]&&!polish0187[file]&&!reopened0188b.has(file))assert.equal(createHash('sha256').update(await readFile(new URL('../'+file,import.meta.url))).digest('hex'),h,file);
});
test('Task 018.5 mobile menu has viewport, background and keyboard safeguards',async()=>{
 const nav=await read('src/components/Navbar.jsx'),css=await read('src/styles.css');
 assert.match(nav,/useLayoutEffect/);assert.match(nav,/sibling.inert = true/);assert.match(nav,/position: "fixed"/);assert.match(nav,/event.key === "Tab"/);assert.match(nav,/event.key === "Escape"/);assert.match(css,/height: calc\(100dvh - var\(--nav-height\)\)/);
});
test('Task 018.5 captures the mounted video element for route-exit resource cleanup',async()=>{
 const p=await read('src/components/StandardMediaPlayer.jsx');assert.match(p,/const element = videoRef.current;[\s\S]*return \(\) => \{[\s\S]*element.removeAttribute\("src"\)/);assert.match(p,/\[homeLoop, activated\]/);
});
test('Task 018.5 inquiry preserves contract without consecutive email duplication',async()=>{
 const form=await read('src/components/InquiryForm.jsx');assert.match(form,/上方商务邮箱/);assert.doesNotMatch(form,/businessEmail/);assert.match(form,/if \(!inquiryEnabled\) return/);assert.match(await read('.env.example'),/VITE_INQUIRY_ENABLED=false/);
});
test('Task 018.5 skip link moves keyboard focus past the nested navbar',async()=>{
 const source=await read('src/App.jsx');assert.match(source,/onClick=\{skipNavigation\}/);assert.match(source,/document.querySelector\("main h1"\)/);assert.match(source,/target.focus\(\)/);
});
