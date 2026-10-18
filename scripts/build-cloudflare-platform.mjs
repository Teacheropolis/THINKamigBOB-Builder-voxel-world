import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "platform");
const destination = path.join(root, "public-site", "platform");
const publicClientId = "42889983876-krlc3beis1nc9f5sblrab11t2n4nmo19.apps.googleusercontent.com";

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const directory of ["assets", "data", "scripts", "styles"]) {
  await cp(path.join(source, directory), path.join(destination, directory), { recursive: true });
}

const sourceIndex = await readFile(path.join(source, "index.html"), "utf8");
const publicIndex = sourceIndex
  .replace('name="thinkamigbob-production-identity" content="disabled"', 'name="thinkamigbob-production-identity" content="enabled"')
  .replace('name="thinkamigbob-student-access" content="disabled"', 'name="thinkamigbob-student-access" content="enabled"')
  .replace('name="thinkamigbob-google-signin-client-id" content=""', `name="thinkamigbob-google-signin-client-id" content="${publicClientId}"`)
  .replace('./scripts/platform-app.mjs?v=preview-20261018-323', './scripts/platform-app.bundle.js?v=cloudflare-20261018-16');

if (!publicIndex.includes('name="thinkamigbob-student-access" content="enabled"')) {
  throw new Error("student-access-must-be-enabled");
}
await writeFile(path.join(destination, "index.html"), publicIndex);
