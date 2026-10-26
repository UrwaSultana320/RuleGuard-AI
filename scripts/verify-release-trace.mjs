import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const trace = path.join(root, ".next/server/app/api/compare/route.js.nft.json");
const files = JSON.parse(await readFile(trace, "utf8")).files.map(p => path.resolve(path.dirname(trace), p));
const normalized = files.map(p => p.replaceAll("\\", "/"));
for (const [label, predicate] of [
  ["PDF.js parser", p => p.endsWith("/pdfjs-dist/legacy/build/pdf.mjs")],
  ["PDF font assets", p => p.includes("/pdfjs-dist/standard_fonts/")],
  ["PDF cmap assets", p => p.includes("/pdfjs-dist/cmaps/")],
  ["PDF Node canvas polyfills", p => p.endsWith("/@napi-rs/canvas/package.json")],
  ["PDF native canvas binding", p => /\/@napi-rs\/canvas-[^/]+\/[^/]+\.node$/.test(p)],
  ["synthetic input A", p => p.endsWith("/public/samples/synthetic-A.txt")],
  ["synthetic input B", p => p.endsWith("/public/samples/synthetic-B.txt")],
  ["bachelor input A", p => p.endsWith("/public/samples/bachelor-synthetic-A.txt")],
  ["bachelor input B", p => p.endsWith("/public/samples/bachelor-synthetic-B.txt")],
]) {
  if (!normalized.some(predicate)) throw new Error(`Release trace is missing ${label}`);
}
if(files.some(p => path.relative(root,p).startsWith("..") || path.basename(p).startsWith(".env"))) throw new Error("Release trace escapes the project or contains an environment file");
let bytes=0;for(const file of files) bytes+=(await stat(file)).size;
console.log(`PASS: self-contained PDF trace with native polyfills, fonts and cmaps (${files.length} files, ${bytes} bytes). Hosted Linux behavior still needs deployment validation.`);
