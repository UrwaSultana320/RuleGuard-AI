import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {
  throw new Error("Environment configuration could not be loaded for the client-bundle check.");
} });
const names = ["GEMINI_API_KEY", "GEMINI_FALLBACK_MODEL", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
const configured = names.filter(name => process.env[name]?.trim().length >= 8);
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  }))).flat();
}
const files = [
  ...await filesIn(".next/static"),
  ...(await filesIn(".next/server/app")).filter(file => file.endsWith(".html")),
];
let matches = 0;
for (const file of files) {
  const bytes = await readFile(file);
  if (names.some(name => bytes.includes(Buffer.from(name))) ||
      configured.some(name => bytes.includes(Buffer.from(process.env[name].trim())))) {
    // Never report matched values or source snippets.
    console.error(`FAIL: server environment material found in ${file}`);
    matches++;
  }
}
if (matches) process.exitCode = 1;
else console.log(`PASS: no server key names or configured secret values in ${files.length} client/static HTML artifacts.`);
