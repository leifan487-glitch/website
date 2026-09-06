const { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } = require("node:fs");
const { join, relative } = require("node:path");

const root = join(__dirname, "..");
const dist = join(root, "dist", "client");
const output = join(root, "screenshots", "task017", "static-audit.json");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = walk(dist);
const clientBundles = files.filter((path) => /assets[\\/]index-[\w-]+\.js$/.test(path));
const clientText = clientBundles.map((path) => readFileSync(path, "utf8")).join("\n");
const discoveredEmails = [...clientText.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)].map((match) => match[0]);
const thirdPartyLicenseEmails = discoveredEmails.filter((email) => email === "jack@greensock.com");
const checks = {
  cloudflareWorker: existsSync(join(dist, "_worker.js")),
  cloudflareHeaders: existsSync(join(dist, "_headers")),
  sourceMaps: files.filter((path) => path.endsWith(".map")).map((path) => relative(dist, path)),
  localWindowsPaths: [...clientText.matchAll(/[A-Z]:\\[^"'`\s]+/g)].map((match) => match[0]),
  hardcodedEmails: discoveredEmails.filter((email) => email !== "jack@greensock.com"),
  thirdPartyLicenseEmails,
  leakedSecretShapes: [...clientText.matchAll(/(?:Bearer\s+[A-Za-z0-9._-]{16,}|re_[A-Za-z0-9_-]{16,})/g)].map((match) => match[0]),
  publicDebugCopy: ["TODO ·", "NEEDS CONFIRMATION", "HIGH RISK", "Backend Pending"].filter((value) => clientText.includes(value)),
  bytes: files.reduce((sum, path) => sum + statSync(path).size, 0),
  fileCount: files.length,
};
checks.allPassed = checks.cloudflareWorker
  && checks.cloudflareHeaders
  && checks.sourceMaps.length === 0
  && checks.localWindowsPaths.length === 0
  && checks.hardcodedEmails.length === 0
  && checks.leakedSecretShapes.length === 0
  && checks.publicDebugCopy.length === 0;
mkdirSync(join(output, ".."), { recursive: true });
writeFileSync(output, `${JSON.stringify(checks, null, 2)}\n`, "utf8");
console.log(JSON.stringify(checks, null, 2));
if (!checks.allPassed) process.exitCode = 1;
