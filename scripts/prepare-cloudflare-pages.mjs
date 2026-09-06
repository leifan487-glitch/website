#!/usr/bin/env node
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "dist", "client");
const index = path.join(outputDirectory, "index.html");
const worker = path.join(root, "worker", "index.js");
const headers = path.join(outputDirectory, "_headers");

for (const file of [index, worker, headers]) {
  if (!existsSync(file)) throw new Error(`Missing Cloudflare Pages build input: ${file}`);
}

copyFileSync(worker, path.join(outputDirectory, "_worker.js"));
console.log("Prepared Cloudflare Pages advanced-mode build: dist/client/_worker.js");
