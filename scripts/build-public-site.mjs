import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(repositoryRoot, "public-site");
const temporaryDirectory = join(repositoryRoot, ".public-site-build");
const approvedAsset = "assets/images/student-platform/student-platform-industrial-background.png";
const approvedAssetSha256 = "ba2bf5d6bc7807a933342ef0af531de0c62de4fb3b9412aa996cf971457424ea";

const outputAllowlist = Object.freeze([
  "_headers",
  "_redirects",
  "_routes.json",
  "assets/student-platform-industrial-background.png",
  "index.html",
  "robots.txt",
  "styles/platform-public.css",
]);

const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="theme-color" content="#102f45">
  <title>THINKamigBOB Platform</title>
  <link rel="stylesheet" href="./styles/platform-public.css">
</head>
<body>
  <header class="public-header">
    <span class="public-brand-mark" aria-hidden="true">BOB</span>
    <span><strong>THINKamigBOB</strong><small>STEM Learning Platform</small></span>
  </header>
  <main>
    <section class="public-status" aria-labelledby="public-status-title">
      <p class="public-eyebrow">School-start platform</p>
      <h1 id="public-status-title">Public sign-in is not available yet.</h1>
      <p>Students and teachers should use the classroom link provided by their teacher or school.</p>
      <p class="public-note">This public preview does not contain student records, teacher records, development credentials, or classroom-only destinations.</p>
    </section>
  </main>
  <footer>THINKamigBOB Classroom Pilot</footer>
</body>
</html>
`;

const publicCss = `:root {
  color-scheme: light;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #102f45;
  background: #071019;
}

* { box-sizing: border-box; }

body {
  min-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  background-color: #1b363d;
  background-image:
    linear-gradient(180deg, rgba(7, 16, 25, 0.18), rgba(7, 16, 25, 0.48)),
    url("../assets/student-platform-industrial-background.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.public-header {
  display: flex;
  min-height: 5.5rem;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem max(1rem, calc((100% - 74rem) / 2));
  border-bottom: 4px solid #d8a526;
  color: #fff;
  background: #102f45;
}

.public-header strong,
.public-header small { display: block; }
.public-header strong { font-size: clamp(1.1rem, 3vw, 1.45rem); }
.public-header small { color: #cfe4ee; }

.public-brand-mark {
  display: grid;
  width: 3.2rem;
  height: 3.2rem;
  place-items: center;
  flex: 0 0 auto;
  border: 2px solid #fff;
  border-radius: 50%;
  color: #102f45;
  background: #d8a526;
  font-size: 0.8rem;
  font-weight: 800;
}

main {
  width: min(100% - 2rem, 74rem);
  margin: auto;
  padding: clamp(2rem, 7vw, 6rem) 0;
}

.public-status {
  max-width: 52rem;
  padding: clamp(1.5rem, 5vw, 3rem);
  border: 1px solid rgba(197, 213, 220, 0.95);
  border-left: 7px solid #2f7f5e;
  border-radius: 1rem;
  background: rgba(247, 251, 252, 0.96);
  box-shadow: 0 1rem 2.5rem rgba(7, 16, 25, 0.35);
}

.public-eyebrow {
  margin: 0 0 0.5rem;
  color: #2f7f5e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 6vw, 3.75rem);
  line-height: 1.08;
}

.public-status p:not(.public-eyebrow) {
  color: #506774;
  font-size: clamp(1rem, 2.4vw, 1.25rem);
  line-height: 1.55;
}

.public-note {
  padding-top: 1rem;
  border-top: 1px solid #c5d5dc;
  font-size: 0.92rem !important;
}

footer {
  padding: 1.25rem;
  color: #d1e3ea;
  background: #17394d;
  text-align: center;
  font-size: 0.78rem;
}
`;

const headers = `/index.html
  Cache-Control: no-store
  Content-Security-Policy: default-src 'self'; base-uri 'none'; connect-src 'none'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'none'; style-src 'self'; upgrade-insecure-requests
  Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=()
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-Robots-Tag: noindex, nofollow, noarchive

/platform/*
  Cache-Control: no-store
  Content-Security-Policy: default-src 'self'; base-uri 'none'; connect-src 'self'; font-src 'self' https://fonts.gstatic.com; form-action 'self' https://accounts.google.com; frame-ancestors 'none'; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; object-src 'none'; script-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; upgrade-insecure-requests
  Permissions-Policy: camera=(self), geolocation=(), microphone=(self), payment=(), usb=()
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-Robots-Tag: noindex, nofollow, noarchive
`;

// Cloudflare Pages serves index.html for the site root without a catch-all
// redirect. A catch-all here also captures /platform/ and replaces the real
// application with the public holding page.
const redirects = "";
const routes = `{\n  "version": 1,\n  "include": ["/api/*"],\n  "exclude": []\n}\n`;

const robots = `User-agent: *
Disallow: /
`;

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(join(directory, entry.name), relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new Error(`Unsupported public artifact entry: ${relativePath}`);
  }
  return files;
}

async function write(relativePath, content) {
  const destination = join(temporaryDirectory, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content, "utf8");
}

async function validateArtifact() {
  const actualFiles = await listFiles(temporaryDirectory);
  if (JSON.stringify(actualFiles) !== JSON.stringify(outputAllowlist)) {
    throw new Error(`Public artifact allowlist mismatch:\n${actualFiles.join("\n")}`);
  }

  const html = await readFile(join(temporaryDirectory, "index.html"), "utf8");
  const css = await readFile(join(temporaryDirectory, "styles/platform-public.css"), "utf8");
  const references = [
    ["index.html", "styles/platform-public.css"],
    ["styles/platform-public.css", "assets/student-platform-industrial-background.png"],
  ];
  for (const [source, target] of references) {
    await readFile(join(temporaryDirectory, target));
    const sourceText = source.endsWith(".html") ? html : css;
    if (!sourceText.includes(target.split("/").at(-1))) throw new Error(`Missing reference from ${source} to ${target}`);
  }

  const textFiles = actualFiles.filter((path) => !path.endsWith(".png"));
  const combined = (await Promise.all(textFiles.map(async (path) => `${path}\n${await readFile(join(temporaryDirectory, path), "utf8")}`))).join("\n");
  const forbidden = [
    /192\.168\.\d{1,3}\.\d{1,3}/i,
    /localhost|127\.0\.0\.1/i,
    /teacher\.preview@example\.test/i,
    /BOB-Preview-001/i,
    /platform-fixtures|DEVELOPMENT_FIXTURE/i,
    /private identifier|studentId|teacherId|classId/i,
    /sourceMappingURL/i,
    /(?:api[_-]?key|client[_-]?secret|password)\s*[:=]/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(combined)) throw new Error(`Forbidden public artifact content matched ${pattern}`);
  }
  if (/<script\b/i.test(html)) throw new Error("Public artifact must not contain JavaScript");
}

async function build() {
  const sourceAssetPath = join(repositoryRoot, approvedAsset);
  const assetHash = await sha256(sourceAssetPath);
  if (assetHash !== approvedAssetSha256) throw new Error(`Approved asset hash mismatch: ${assetHash}`);

  await rm(temporaryDirectory, { recursive: true, force: true });
  await mkdir(temporaryDirectory, { recursive: true });
  await write("index.html", indexHtml);
  await write("styles/platform-public.css", publicCss);
  await write("_headers", headers);
  await write("_redirects", redirects);
  await write("_routes.json", routes);
  await write("robots.txt", robots);
  await mkdir(join(temporaryDirectory, "assets"), { recursive: true });
  await cp(sourceAssetPath, join(temporaryDirectory, "assets/student-platform-industrial-background.png"));

  await validateArtifact();
  // The Cloudflare project runs this safety build automatically. Preserve the
  // separately generated and reviewed Platform application instead of
  // replacing it with only the public holding page.
  await cp(join(outputDirectory, "platform"), join(temporaryDirectory, "platform"), { recursive: true });
  await rm(outputDirectory, { recursive: true, force: true });
  await rename(temporaryDirectory, outputDirectory);
}

await build();
const manifest = await listFiles(outputDirectory);
process.stdout.write(`Public site and Platform built:\n${manifest.map((path) => `- ${path}`).join("\n")}\n`);
