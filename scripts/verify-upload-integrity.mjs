#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "UPLOAD_MANIFEST.json");
const distRoot = path.join(root, "dist", "client");
const reportPath = path.join(root, "output", "upload-integrity-report.json");
const writeManifest = process.argv.includes("--write");
const maxGitHubFileBytes = 100 * 1024 * 1024;

const rootFiles = [
  ".env.example",
  ".gitattributes",
  ".gitignore",
  ".npmrc",
  "AGENTS.md",
  "DEPLOYMENT.md",
  "README.md",
  "UPLOAD_CHECKLIST.md",
  "design-qa.md",
  "index.html",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "vite.config.mjs",
];
const uploadDirectories = [".openai", "docs", "internal", "public", "scripts", "src", "tests", "worker"];
const ignoredNames = new Set(["__pycache__", ".DS_Store", "Thumbs.db"]);
const forbiddenLockfiles = ["package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"];

const toPosix = (value) => value.split(path.sep).join("/");

async function walk(directory) {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredNames.has(entry.name) || /\.py[cod]$/i.test(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(toPosix(path.relative(root, absolute)));
  }
  return files;
}

async function uploadFilePaths() {
  const files = [];
  for (const file of rootFiles) {
    if (existsSync(path.join(root, file))) files.push(file);
  }
  for (const directory of uploadDirectories) {
    files.push(...await walk(path.join(root, directory)));
  }
  return [...new Set(files)].sort();
}

async function hashFile(relativePath, base = root) {
  const buffer = await readFile(path.join(base, relativePath));
  return createHash("sha256").update(buffer).digest("hex");
}

async function buildEntries(paths) {
  return Promise.all(paths.map(async (relativePath) => {
    const fileStat = await stat(path.join(root, relativePath));
    return {
      path: relativePath,
      bytes: fileStat.size,
      sha256: await hashFile(relativePath),
    };
  }));
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = path.extname(base)
    ? [base]
    : [base, base + ".js", base + ".jsx", base + ".css", path.join(base, "index.js"), path.join(base, "index.jsx")];
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

async function productionGraph() {
  const queue = [path.join(root, "src", "main.jsx")];
  const visited = new Set();
  const importPattern = /(?:import\s+(?:[^"']+?\s+from\s+)?|import\s*\()["']([^"']+)["']/g;

  while (queue.length) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    if (!/\.(?:js|jsx|css)$/.test(current)) continue;
    const text = await readFile(current, "utf8");
    for (const match of text.matchAll(importPattern)) {
      const resolved = resolveImport(current, match[1]);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
    }
  }

  return [...visited].sort();
}

function extractPublicReferences(text) {
  return [...text.matchAll(/\/(?:assets\/[A-Za-z0-9._/-]+|favicon\.ico)\b/g)]
    .map((match) => match[0])
    .filter((value) => !value.includes("*"));
}

async function referencedPublicFiles(graphFiles) {
  const references = new Set();
  const scanFiles = [path.join(root, "index.html"), ...graphFiles];
  for (const file of scanFiles) {
    if (!/\.(?:html|js|jsx|css)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    for (const reference of extractPublicReferences(text)) references.add(reference.slice(1));
  }
  return [...references].sort();
}

async function distTextReferences() {
  if (!existsSync(distRoot)) return [];
  const files = await walk(distRoot);
  const references = new Set();
  for (const relativePath of files.filter((file) => /\.(?:html|js|css)$/.test(file))) {
    const text = await readFile(path.join(root, relativePath), "utf8");
    for (const reference of extractPublicReferences(text)) references.add(reference.slice(1));
  }
  return [...references].sort();
}

async function main() {
  const uploadPaths = await uploadFilePaths();
  const currentEntries = await buildEntries(uploadPaths);
  const currentByPath = new Map(currentEntries.map((entry) => [entry.path, entry]));

  if (writeManifest) {
    const manifest = {
      schemaVersion: 1,
      generatedOn: "2026-09-06",
      fileCount: currentEntries.length,
      totalBytes: currentEntries.reduce((sum, entry) => sum + entry.bytes, 0),
      files: currentEntries,
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  }

  const manifest = existsSync(manifestPath)
    ? JSON.parse(await readFile(manifestPath, "utf8"))
    : { schemaVersion: null, files: [] };
  const manifestByPath = new Map(manifest.files.map((entry) => [entry.path, entry]));
  const missingManifestFiles = manifest.files.filter((entry) => !currentByPath.has(entry.path)).map((entry) => entry.path);
  const extraUploadFiles = currentEntries.filter((entry) => !manifestByPath.has(entry.path)).map((entry) => entry.path);
  const changedUploadFiles = currentEntries.filter((entry) => {
    const expected = manifestByPath.get(entry.path);
    return expected && (expected.bytes !== entry.bytes || expected.sha256 !== entry.sha256);
  }).map((entry) => entry.path);

  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const packageManagerOk = /^pnpm@11\./.test(packageJson.packageManager || "")
    && existsSync(path.join(root, "pnpm-lock.yaml"));
  const forbiddenLocksPresent = forbiddenLockfiles.filter((file) => existsSync(path.join(root, file)));
  const requiredFilesMissing = rootFiles.filter((file) => !existsSync(path.join(root, file)));

  const graph = await productionGraph();
  const sourceReferences = await referencedPublicFiles(graph);
  const missingSourceAssets = sourceReferences.filter((relativePath) => !existsSync(path.join(root, "public", relativePath)));

  const publicFiles = (await walk(path.join(root, "public")))
    .map((relativePath) => relativePath.replace(/^public\//, ""))
    .sort();
  const oversizedPublicFiles = [];
  const distMismatches = [];
  let publicBytes = 0;
  for (const relativePath of publicFiles) {
    const sourcePath = path.join(root, "public", relativePath);
    const sourceStat = await stat(sourcePath);
    publicBytes += sourceStat.size;
    if (sourceStat.size >= maxGitHubFileBytes) oversizedPublicFiles.push(relativePath);

    const distPath = path.join(distRoot, relativePath);
    if (!existsSync(distPath)) {
      distMismatches.push({ path: relativePath, reason: "missing-from-dist" });
      continue;
    }
    const [sourceHash, distHash] = await Promise.all([
      hashFile(toPosix(path.join("public", relativePath))),
      hashFile(relativePath, distRoot),
    ]);
    if (sourceHash !== distHash) distMismatches.push({ path: relativePath, reason: "sha256-mismatch" });
  }

  const requiredDistFiles = ["index.html", "_worker.js", "_headers", "robots.txt", "favicon.ico"];
  const missingDistFiles = requiredDistFiles.filter((file) => !existsSync(path.join(distRoot, file)));
  const distReferences = await distTextReferences();
  const missingDistReferences = distReferences.filter((relativePath) => !existsSync(path.join(distRoot, relativePath)));

  const checks = {
    manifestSchema: manifest.schemaVersion === 1,
    manifestFileCountMatches: manifest.fileCount === currentEntries.length,
    packageManagerOk,
    forbiddenLocksPresent,
    requiredFilesMissing,
    missingManifestFiles,
    extraUploadFiles,
    changedUploadFiles,
    productionGraphFiles: graph.length,
    sourceAssetReferences: sourceReferences.length,
    missingSourceAssets,
    publicFiles: publicFiles.length,
    publicBytes,
    oversizedPublicFiles,
    missingDistFiles,
    distMismatches,
    distAssetReferences: distReferences.length,
    missingDistReferences,
  };
  checks.allPassed = checks.manifestSchema
    && checks.manifestFileCountMatches
    && checks.packageManagerOk
    && checks.forbiddenLocksPresent.length === 0
    && checks.requiredFilesMissing.length === 0
    && checks.missingManifestFiles.length === 0
    && checks.extraUploadFiles.length === 0
    && checks.changedUploadFiles.length === 0
    && checks.missingSourceAssets.length === 0
    && checks.oversizedPublicFiles.length === 0
    && checks.missingDistFiles.length === 0
    && checks.distMismatches.length === 0
    && checks.missingDistReferences.length === 0;

  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(checks, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(checks, null, 2));
  if (!checks.allPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
