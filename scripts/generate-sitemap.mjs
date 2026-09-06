#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getSitemapRoutes } from "../src/data/siteMetadata.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = join(root, "dist", "client");
const configuredSiteUrl = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");

if (!configuredSiteUrl) {
  console.log("Skipped sitemap.xml: VITE_SITE_URL is not configured.");
  process.exit(0);
}

let siteUrl;
try {
  siteUrl = new URL(configuredSiteUrl);
} catch {
  throw new Error("VITE_SITE_URL must be a valid absolute URL.");
}
if (siteUrl.protocol !== "https:" || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
  throw new Error("VITE_SITE_URL must be an HTTPS origin without a path, query, or hash.");
}

const hiddenModuleIds = (process.env.VITE_HIDDEN_SUPPORT_MODULES || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const routes = getSitemapRoutes({ hiddenModuleIds });
const entries = routes
  .map((pathname) => `  <url><loc>${siteUrl.origin}${pathname === "/" ? "" : pathname}</loc></url>`)
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

await writeFile(join(outputDirectory, "sitemap.xml"), sitemap, "utf8");
const robotsPath = join(outputDirectory, "robots.txt");
const robots = await readFile(robotsPath, "utf8");
await writeFile(robotsPath, `${robots.trim()}\n\nSitemap: ${siteUrl.origin}/sitemap.xml\n`, "utf8");
console.log(`Generated sitemap.xml with ${routes.length} public routes.`);
