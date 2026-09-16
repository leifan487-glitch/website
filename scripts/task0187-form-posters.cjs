// Extract homepage-only official-film stills. Never overwrite shared Standard posters.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = 'public/media/mantis-standard/official-product-film.mp4';
const records = [
  {id:'arm', timestamp:26, crop:[1000,800,500,190]},
  {id:'engineering', timestamp:41, crop:[1220,976,10,0]},
  {id:'chassis', timestamp:53, crop:[1250,1000,350,40]},
  {id:'dual', timestamp:72.5, crop:[1040,832,400,130]},
  {id:'inspection', timestamp:79, crop:[1250,1000,350,40]},
  {id:'complete', timestamp:22, crop:[1100,880,410,100]},
];
const output = path.join(root, 'public/media/mantis-standard/home-forms');
fs.mkdirSync(output, {recursive:true});
for (const record of records) {
  record.image = '/media/mantis-standard/home-forms/'+record.id+'.webp';
  record.filter = 'crop='+record.crop.join(':')+',scale=800:640';
  cp.execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-n','-ss',String(record.timestamp),'-i',path.join(root,source),'-frames:v','1','-vf',record.filter,'-c:v','libwebp','-quality','84',path.join(root,'public'+record.image)], {stdio:'inherit'});
  const bytes = fs.readFileSync(path.join(root,'public'+record.image));
  record.bytes = bytes.length;
  record.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
}
console.log(JSON.stringify({task:'018.7',source,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,source))).digest('hex'),width:800,height:640,notes:'Real official-film frames; crop and resize only. No padding, synthesis or retouching. Shared Standard assets are unchanged.',records},null,2));
