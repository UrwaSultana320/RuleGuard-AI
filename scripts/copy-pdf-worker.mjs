import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
await mkdir("public", { recursive: true });
await copyFile("node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs");
// Preserve full license texts alongside browser-distributed third-party code.
await mkdir("public/licenses", { recursive: true });
await copyFile("node_modules/pdfjs-dist/LICENSE", "public/licenses/pdfjs-LICENSE.txt");
const notices = [];
for (const [name, licenseFile] of [
  ["next", "license.md"], ["react", "LICENSE"], ["react-dom", "LICENSE"],
  ["@swc/helpers", "LICENSE"], ["pdfjs-dist", "LICENSE"],
]) {
  const root = `node_modules/${name}`;
  const metadata = JSON.parse(await readFile(`${root}/package.json`, "utf8"));
  const license = await readFile(`${root}/${licenseFile}`, "utf8");
  notices.push(`${name} ${metadata.version} — ${metadata.license}\n\n${license}`);
}
await writeFile("public/licenses/third-party-notices.txt", notices.join("\n\n--------------------\n\n"));
