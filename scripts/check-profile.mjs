import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readmePath = path.join(root, "README.md");
const readme = fs.readFileSync(readmePath, "utf8");
const failures = [];
const pass = (message) => console.log(`PASS  ${message}`);
const fail = (message) => failures.push(message);

const imageSources = [...readme.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]);
for (const source of imageSources) {
  if (/^https?:\/\//i.test(source)) {
    fail(`Remote image source is not allowed: ${source}`);
    continue;
  }
  const absolute = path.resolve(root, source);
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute)) {
    fail(`Missing or unsafe local image path: ${source}`);
  }
}
if (failures.length === 0) pass(`All ${imageSources.length} README images resolve to local files`);

const requiredLinks = [
  "https://github.com/amirreza91-13",
  "https://www.linkedin.com/in/amirreza-mirhaj-490250435/",
  "https://x.com/amirrezaPG",
  "mailto:amirreza.91mirhaj@gmail.com",
  "https://t.me/AmirrezaMirhajAIBot",
  "https://github.com/amirreza91-13/devflow-kit",
  "https://github.com/amirreza91-13/mirhaj-realestate",
  "https://github.com/amirreza91-13/planner",
  "https://github.com/amirreza91-13/Local-Coding-Assistant",
];
for (const link of requiredLinks) {
  if (!readme.includes(link)) fail(`Required destination missing: ${link}`);
}
if (requiredLinks.every((link) => readme.includes(link))) pass("All social, contact, and featured-project destinations are present");

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const svgFiles = [path.join(root, "banner.svg"), path.join(root, "logo.svg"), ...walk(path.join(root, "assets")).filter((file) => file.endsWith(".svg"))];

for (const file of svgFiles) {
  const relative = path.relative(root, file);
  const svg = fs.readFileSync(file, "utf8");
  if (!/^\s*<svg\b/.test(svg) || !/<\/svg>\s*$/.test(svg)) fail(`Invalid SVG root or closing tag: ${relative}`);
  if (svg.includes("scale(.?") || svg.includes("TODO") || svg.includes("REPLACE_ME")) fail(`Placeholder or unfinished transform found: ${relative}`);

  const ids = [...svg.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) fail(`Duplicate SVG IDs: ${relative}`);
  const idSet = new Set(ids);
  for (const ref of [...svg.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1])) {
    if (!idSet.has(ref)) fail(`Unresolved SVG paint/filter reference #${ref}: ${relative}`);
  }

  const source = svg.replace(/<!--[\s\S]*?-->/g, "");
  const stack = [];
  const tags = source.match(/<\/?[A-Za-z][^>]*>/g) ?? [];
  for (const tag of tags) {
    const close = tag.match(/^<\/([A-Za-z][\w:-]*)/);
    if (close) {
      const expected = stack.pop();
      if (expected !== close[1]) {
        fail(`Unbalanced SVG tag in ${relative}: expected </${expected ?? "none"}>, found </${close[1]}>`);
        break;
      }
    } else if (!/^<\?|^<!/.test(tag) && !/\/\s*>$/.test(tag)) {
      const name = tag.match(/^<([A-Za-z][\w:-]*)/)?.[1];
      if (name) stack.push(name);
    }
  }
  if (stack.length) fail(`Unclosed SVG elements in ${relative}: ${stack.slice(-4).join(", ")}`);
}
if (failures.length === 0) pass(`All ${svgFiles.length} SVG assets pass structural, ID, and reference checks`);


for (const relative of ["banner.svg", "assets/frost-glass.svg"]) {
  const animatedSvg = fs.readFileSync(path.join(root, relative), "utf8");
  if (!animatedSvg.includes("<animate")) fail(`Expected animated snowfall is missing: ${relative}`);
}
if (!readme.includes("<details>") || !readme.includes("<table>")) {
  fail("The collapsible toolbox and project tables must remain present");
}
if (failures.length === 0) pass("Snowfall animation and interactive README sections are present");

if (failures.length) {
  console.error("\nProfile quality checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("\nFrostbyte profile quality checks passed.");
