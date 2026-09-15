const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),web=path.join(root,'website'),backup=path.join(root,'backups/task0185-pre-final');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(dir){const all=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())all.push(...await walk(p));else all.push(p);}return all;}
(async()=>{
 await fs.mkdir(backup,{recursive:false});
 const paths=['website/src','website/public','website/worker','website/scripts','website/tests','website/internal','website/package.json','website/pnpm-lock.yaml','website/AGENTS.md','website/UPLOAD_MANIFEST.json','website/.env.example','docs/PROJECT.md','docs/DECISIONS.md','docs/HANDOFF.md'];
 for(const p of paths){await fs.mkdir(path.dirname(path.join(backup,p)),{recursive:true});await fs.cp(path.join(root,p),path.join(backup,p),{recursive:true,errorOnExist:true,force:false});}
 const files={};for(const dir of ['src','public','worker'])for(const p of await walk(path.join(web,dir)))files[path.relative(web,p).replaceAll('\\','/')]=hash(await fs.readFile(p));
 const publicFiles=await walk(path.join(web,'public'));
 const record={createdAt:new Date().toISOString(),node:process.version,pnpm:execFileSync('cmd.exe',['/d','/s','/c','pnpm --version'],{cwd:web,encoding:'utf8'}).trim(),sourceFileCount:(await walk(path.join(web,'src'))).length,publicAssetCount:publicFiles.length,publicAssetBytes:(await Promise.all(publicFiles.map(async p=>(await fs.stat(p)).size))).reduce((a,b)=>a+b,0),packageHash:hash(await fs.readFile(path.join(web,'package.json'))),files};
 await fs.writeFile(path.join(backup,'snapshot.json'),JSON.stringify(record,null,2));
 await fs.mkdir(path.join(root,'docs/final'),{recursive:true});
 await fs.writeFile(path.join(root,'docs/final/TASK0185_PRE_FINAL_MANIFEST.md'),`# Task 018.5 Pre-final Snapshot\n\nCreated: ${record.createdAt}\n\nBackup: backups/task0185-pre-final/ (write-once; source materials excluded)\n\n- Source files: ${record.sourceFileCount}\n- Public assets: ${record.publicAssetCount}\n- Public bytes: ${record.publicAssetBytes}\n- Node: ${record.node}\n- pnpm: ${record.pnpm}\n- package.json SHA-256: ${record.packageHash}\n\nSnapshot includes src/public/worker/scripts/tests/internal, package/lock, existing upload manifest and project governance. Excludes node_modules, dist, and original media libraries. All ${Object.keys(files).length} runtime/source/media hashes are recorded in snapshot.json.\n\n## Locked file SHA-256\n\n| File | SHA-256 |\n| --- | --- |\n${Object.entries(files).filter(([p])=>p.startsWith('src/pages/')||['src/data/standard/qa.js','src/data/standard/product.js','src/home.css','src/standard-page.css','src/alignment.css','src/components/Navbar.jsx','src/styles.css','worker/index.js'].includes(p)).map(([p,h])=>`| ${p} | ${h} |`).join('\n')}\n`);
 console.log(JSON.stringify({...record,files:Object.keys(files).length,backup},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
