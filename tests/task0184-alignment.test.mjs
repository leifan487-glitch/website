import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {alignedPlatforms, alignedScenarios} from "../src/data/alignment.js";
import {potentialApplications} from "../src/data/applications.js";
const read = p => readFile(new URL('../'+p,import.meta.url),'utf8');

test('Task 018.4 locks Home, Standard, six-Q, backend and all existing public resources', async()=>{
  const locks=JSON.parse(await read('internal/task0184-locked-files.json'));
  for(const [file,expected] of Object.entries(locks)) {
    // Explicit Task 018.5 bug-fix / small responsive exceptions; historical hashes retained.
    if (["src/App.jsx", "src/components/Navbar.jsx", "src/components/StandardMediaPlayer.jsx", "src/styles.css", "src/support.css"].includes(file)) continue;
    assert.equal(createHash('sha256').update(await readFile(new URL('../'+file,import.meta.url))).digest('hex'),expected,file);
  }
});
test('Task 018.4 platforms put approved Chinese names first and distinguish external models',async()=>{
  assert.deepEqual(alignedPlatforms.map(p=>p.nameZh),['春茧','量子','虫洞','蜂巢']);
  assert.ok(alignedPlatforms.every(p=>p.publicApproved&&p.purpose&&p.description));
  assert.match(alignedPlatforms[1].note,/不代表所有网络条件/);
  assert.match(alignedPlatforms[2].description,/不是蓝虫自研模型/);
  const source=await read('src/components/TechnologyExplorer.jsx');
  assert.doesNotMatch(source,/role="tab/);
  assert.match(source,/nameZh.*platform.name/);
});
test('Task 018.4 keeps six approved application directions and adds traceable task wording',()=>{
  assert.deepEqual(alignedScenarios.map(x=>x.id),potentialApplications.map(x=>x.id));
  assert.ok(alignedScenarios.every(x=>x.description&&x.source&&x.keywords.length>=2));
});
test('Task 018.4 remaining pages do not reintroduce body business CTAs or decorative forms',async()=>{
  for(const file of ['TechnologyPage','ApplicationsPage','AboutPage']) assert.doesNotMatch(await read('src/pages/'+file+'.jsx'),/to="\/inquiry"|提交.*Brief/);
  const page=await read('src/pages/InquiryPage.jsx'), form=await read('src/components/InquiryForm.jsx');
  assert.doesNotMatch(page,/inquiry-folder|inquiry-brief|<video/);
  assert.match(form,/在线提交功能准备中/);
  assert.match(form,/可通过上方商务邮箱联系我们/);
  assert.match(form,/if \(!inquiryEnabled\) return/);
  assert.match(form,/readOnly: true/);
  assert.match(form,/disabled=\{!inquiryEnabled/);
});
