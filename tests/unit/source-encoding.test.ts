import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

it("keeps every src and tests file valid UTF-8 without BOM or mojibake", () => {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const issues: string[] = [];
  for (const file of ["src", "tests"].flatMap(filesIn)) {
    const bytes = readFileSync(file);
    if (bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) {
      issues.push(`${file}: UTF-8 BOM`);
    }
    try {
      const text = decoder.decode(bytes);
      text.split(/\r?\n/).forEach((line, index) => {
        if (/[\u00c2\u00c3\ufffd]|\u00e2\u20ac/.test(line)) {
          issues.push(`${file}:${index + 1}: mojibake or replacement character`);
        }
      });
    } catch {
      issues.push(`${file}: invalid UTF-8`);
    }
  }
  expect(issues).toEqual([]);
});
