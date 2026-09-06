const { createHash } = require("node:crypto");
const { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } = require("node:fs");
const { extname, join, relative } = require("node:path");
const { gzipSync } = require("node:zlib");
const { spawnSync } = require("node:child_process");
const sharp = require("sharp");

const siteRoot = join(__dirname, "..");
const distRoot = join(siteRoot, "dist", "client");
const srcRoot = join(siteRoot, "src");
const outputPath = process.argv[2] || join(siteRoot, "screenshots", "task016", "asset-summary.json");
const ffprobe = process.env.FFPROBE || "ffprobe";

function walk(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function usageFor(path, sourceText) {
  const webPath = `/${relative(distRoot, path).replaceAll("\\", "/")}`.replace(/^\/assets\//, "/assets/");
  const direct = sourceText.filter((item) => item.text.includes(webPath)).map((item) => item.path);
  if (direct.length) return direct;
  const basename = path.split(/[\\/]/).pop();
  return sourceText.filter((item) => item.text.includes(basename)).map((item) => item.path);
}

async function main() {
  const sourceText = walk(srcRoot).filter((path) => /\.(jsx?|css)$/.test(path)).map((path) => ({
    path: relative(siteRoot, path).replaceAll("\\", "/"),
    text: readFileSync(path, "utf8"),
  }));
  const files = walk(distRoot);
  const records = [];

  for (const path of files) {
    const buffer = readFileSync(path);
    const ext = extname(path).toLowerCase();
    const item = {
      path: relative(distRoot, path).replaceAll("\\", "/"),
      bytes: buffer.length,
      sha256: sha256(buffer),
      type: ext.slice(1) || "file",
      usage: usageFor(path, sourceText),
    };
    if ([".js", ".css", ".html", ".svg", ".json", ".txt", ".xml"].includes(ext)) {
      item.gzipBytes = gzipSync(buffer).length;
    }
    if ([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"].includes(ext)) {
      try {
        const metadata = await sharp(path).metadata();
        item.width = metadata.width;
        item.height = metadata.height;
        item.format = metadata.format;
      } catch (error) {
        item.inspectError = error.message;
      }
    }
    if ([".mp4", ".webm", ".mov"].includes(ext)) {
      const probe = spawnSync(ffprobe, ["-v", "error", "-show_entries", "format=duration,bit_rate,size:stream=index,codec_type,codec_name,width,height,r_frame_rate", "-of", "json", path], { encoding: "utf8" });
      if (probe.status === 0) {
        const data = JSON.parse(probe.stdout);
        const video = data.streams?.find((stream) => stream.codec_type === "video");
        const audio = data.streams?.find((stream) => stream.codec_type === "audio");
        item.video = {
          duration: Number(data.format?.duration || 0),
          bitRate: Number(data.format?.bit_rate || 0),
          width: video?.width,
          height: video?.height,
          codec: video?.codec_name,
          frameRate: video?.r_frame_rate,
          hasAudio: Boolean(audio),
          audioCodec: audio?.codec_name || null,
        };
      } else {
        item.inspectError = probe.stderr.trim() || "ffprobe failed";
      }
    }
    records.push(item);
  }

  const totals = {
    assets: records.length,
    bytes: records.reduce((sum, item) => sum + item.bytes, 0),
    jsBytes: records.filter((item) => item.type === "js").reduce((sum, item) => sum + item.bytes, 0),
    jsGzipBytes: records.filter((item) => item.type === "js").reduce((sum, item) => sum + (item.gzipBytes || 0), 0),
    cssBytes: records.filter((item) => item.type === "css").reduce((sum, item) => sum + item.bytes, 0),
    cssGzipBytes: records.filter((item) => item.type === "css").reduce((sum, item) => sum + (item.gzipBytes || 0), 0),
    imageBytes: records.filter((item) => ["png", "jpg", "jpeg", "webp", "avif", "gif"].includes(item.type)).reduce((sum, item) => sum + item.bytes, 0),
    videoBytes: records.filter((item) => ["mp4", "webm", "mov"].includes(item.type)).reduce((sum, item) => sum + item.bytes, 0),
  };
  const report = {
    generatedAt: new Date().toISOString(),
    distRoot,
    totals,
    largest20: [...records].sort((a, b) => b.bytes - a.bytes).slice(0, 20),
    largest20Images: records.filter((item) => ["png", "jpg", "jpeg", "webp", "avif", "gif"].includes(item.type)).sort((a, b) => b.bytes - a.bytes).slice(0, 20),
    videos: records.filter((item) => ["mp4", "webm", "mov"].includes(item.type)).sort((a, b) => b.bytes - a.bytes),
    scriptsAndStyles: records.filter((item) => ["js", "css"].includes(item.type)).sort((a, b) => b.bytes - a.bytes),
    allAssets: records,
  };
  mkdirSync(join(outputPath, ".."), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, totals, largest: report.largest20.slice(0, 5).map(({ path, bytes }) => ({ path, bytes })) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
