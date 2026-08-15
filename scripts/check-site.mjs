import fs from "node:fs";
import path from "node:path";

const outputRoot = path.resolve("_site");
const sourceRoot = path.resolve("content/blog");
const siteOrigin = "https://www.bensampica.com";
const errors = [];

function filesBelow(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesBelow(target, predicate));
    else if (predicate(target)) files.push(target);
  }
  return files;
}

function routeFor(file) {
  const relative = path.relative(outputRoot, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -10)}`;
  return `/${relative}`;
}

function resolveOutput(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\//, "");
  const direct = path.join(outputRoot, relative);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(direct, "index.html");
  if (fs.existsSync(index)) return index;
  if (!path.extname(direct) && fs.existsSync(`${direct}.html`)) return `${direct}.html`;
  return null;
}

const htmlFiles = filesBelow(outputRoot, (file) => file.endsWith(".html"));
const sitemap = fs.readFileSync(path.join(outputRoot, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  const titleCount = (html.match(/<title>[\s\S]*?<\/title>/g) ?? []).length;
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)">/)?.[1];
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  const noindex = html.includes('<meta name="robots" content="noindex,follow">');

  if (titleCount !== 1) errors.push(`${route}: expected one <title>, found ${titleCount}`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (!canonical?.startsWith(`${siteOrigin}/`)) errors.push(`${route}: canonical is not absolute`);
  if (h1Count !== 1) errors.push(`${route}: expected one <h1>, found ${h1Count}`);
  if (!noindex && canonical && !sitemapUrls.has(canonical)) errors.push(`${route}: canonical missing from sitemap`);
  if (html.includes("localhost:8080")) errors.push(`${route}: contains local development URL`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of html.matchAll(/<(?:a|link|img|script|source|video)\b[^>]*\s(?:href|src)="([^"]+)"[^>]*>/g)) {
    const reference = match[1];
    if (/^(?:#|data:|mailto:|tel:|javascript:)/.test(reference)) continue;

    let url;
    try {
      url = new URL(reference, `${siteOrigin}${route}`);
    } catch {
      errors.push(`${route}: invalid URL ${reference}`);
      continue;
    }

    if (url.origin !== siteOrigin) continue;
    if (!resolveOutput(url.pathname)) errors.push(`${route}: broken internal reference ${reference}`);
  }
}

const sourcePosts = fs
  .readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(sourceRoot, entry.name, "index.md")));
const outputPosts = htmlFiles.filter((file) => /^\/blog\/[^/]+\/$/.test(routeFor(file)));
if (sourcePosts.length !== outputPosts.length) {
  errors.push(`post count mismatch: ${sourcePosts.length} source posts, ${outputPosts.length} output posts`);
}

const sourceCallouts = sourcePosts.reduce((total, entry) => {
  const markdown = fs.readFileSync(path.join(sourceRoot, entry.name, "index.md"), "utf8");
  return total + (markdown.match(/^>\s+(?:\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO)\]|\*\*(?:Note|Tip|Important|Warning|Caution|Info):\*\*)/gim) ?? []).length;
}, 0);
const renderedCallouts = htmlFiles.reduce(
  (total, file) => total + (fs.readFileSync(file, "utf8").match(/class="callout callout--/g) ?? []).length,
  0,
);
if (sourceCallouts !== renderedCallouts) {
  errors.push(`callout count mismatch: ${sourceCallouts} source callouts, ${renderedCallouts} rendered callouts`);
}

for (const required of [
  "index.xml",
  "blog/index.xml",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "pagefind/pagefind.js",
]) {
  if (!fs.existsSync(path.join(outputRoot, required))) errors.push(`missing generated ${required}`);
}

if (errors.length > 0) {
  console.error(`Site verification failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Site verification passed: ${htmlFiles.length} HTML pages, ${outputPosts.length} posts, ${renderedCallouts} callouts.`,
  );
}
