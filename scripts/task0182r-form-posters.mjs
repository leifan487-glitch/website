import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(root, "../经验素材取地/新资料/宣传视频.mp4");
const output = path.join(root, "public/media/mantis-standard/forms");
const records = [
  { id: "arm", name: "机械臂形态", timestamp: 24, crop: [3680, 1760, 120, 120] },
  { id: "engineering", name: "工程形态", timestamp: 41, crop: [1380, 1940, 1100, 0] },
  { id: "chassis", name: "底盘形态", timestamp: 53, crop: [2880, 2000, 480, 80] },
  { id: "dual", name: "双臂形态", timestamp: 72.5, crop: [1960, 1540, 920, 400] },
  { id: "inspection", name: "巡检形态", timestamp: 79, crop: [2200, 2000, 820, 80] },
  { id: "complete", name: "完整形态", timestamp: 22, crop: [2200, 1800, 820, 240] },
];
await mkdir(output, { recursive: true });
for (const record of records) {
  const [w,h,x,y] = record.crop;
  const filter = `crop=${w}:${h}:${x}:${y},scale=900:720:force_original_aspect_ratio=decrease,pad=900:720:(ow-iw)/2:(oh-ih)/2:color=0xeef0f0`;
  const target = path.join(output, `${record.id}.webp`);
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(record.timestamp), "-i", source, "-frames:v", "1", "-vf", filter, "-c:v", "libwebp", "-quality", "86", target]);
  const buffer = await readFile(target);
  record.image = `/media/mantis-standard/forms/${record.id}.webp`;
  record.bytes = buffer.length;
  record.sha256 = createHash("sha256").update(buffer).digest("hex");
  record.filter = filter;
}
const manifest = {
  task: "018.2R", source: "经验素材取地/新资料/宣传视频.mp4", sourceWidth:3840, sourceHeight:2160, sourceFps:60,
  sourceSha256: createHash("sha256").update(await readFile(source)).digest("hex"),
  notes: "Official source frame extraction only. Crop/resize/neutral letterbox; no generated structures, retouching or added claims. Timestamps are seconds from source start, aligned with official-product-film.mp4.",
  records,
};
await writeFile(path.join(root,"internal/task0182r-form-posters.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify(records.map(({id,timestamp,bytes})=>({id,timestamp,bytes})),null,2));
