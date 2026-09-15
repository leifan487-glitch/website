const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'output/task0184');
fs.mkdirSync(out, {recursive:true});
const target = path.join(out, 'upload-manifest-before.json');
if(fs.existsSync(target)) throw new Error('Task baseline already exists; do not overwrite.');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'UPLOAD_MANIFEST.json')));
fs.copyFileSync(path.join(root,'UPLOAD_MANIFEST.json'), target);
const editable = new Set(['src/pages/TechnologyPage.jsx','src/pages/ApplicationsPage.jsx','src/pages/AboutPage.jsx','src/pages/InquiryPage.jsx','src/components/TechnologyExplorer.jsx','src/components/InquiryForm.jsx','src/components/SubpageMotion.jsx']);
const locks = {};
for(const file of manifest.files) {
  if((file.path.startsWith('src/') || file.path.startsWith('public/') || file.path.startsWith('worker/') || file.path==='.env.example') && !editable.has(file.path))
    locks[file.path] = createHash('sha256').update(fs.readFileSync(path.join(root,file.path))).digest('hex');
}
fs.writeFileSync(path.join(root,'internal/task0184-locked-files.json'),JSON.stringify(locks,null,2)+'\n');
for(const file of editable) {
  const dest = path.join(out,'before',file);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(path.join(root,file),dest);
}
console.log({lockedFiles:Object.keys(locks).length,editable:[...editable]});
