import { createHash } from "node:crypto";
import path from "node:path";
import { LIMITS } from "@/shared/limits";
import type { Source } from "@/shared/contracts";
import { AppError } from "./errors";

export async function extractDocument(file: File, id: string): Promise<Source> {
  if (!file.size || file.size > LIMITS.fileBytes)
    throw new AppError(
      "FILE_TOO_LARGE",
      `${file.name}: choose a nonempty file up to 2 MB (2,000,000 bytes).`,
    );
  if (file.name.length > 160 || !/\.(pdf|txt)$/i.test(file.name))
    throw new AppError(
      "UNREADABLE_DOCUMENT",
      "Choose a PDF or UTF-8 TXT file with a filename under 160 characters.",
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const kind = file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "TXT";
  const pages: Source["pages"] = [];
  if (kind === "PDF") {
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
      throw new AppError(
        "UNREADABLE_DOCUMENT",
        `${file.name}: this is not a valid PDF.`,
      );
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const assets = path.join(process.cwd(), "node_modules/pdfjs-dist");
    const task = getDocument({
      data: bytes,
      verbosity: 0, // Parser diagnostics must not echo untrusted document data.
      useSystemFonts: false,
      standardFontDataUrl:
        path.join(assets, "standard_fonts").replaceAll("\\", "/") + "/",
      cMapUrl: path.join(assets, "cmaps").replaceAll("\\", "/") + "/",
      cMapPacked: true,
    });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > LIMITS.pdfPages)
        throw new AppError(
          "PDF_PAGE_LIMIT",
          `${file.name}: ${pdf.numPages} pages exceeds the 15-page limit. No pages have been silently omitted.`,
        );
      for (let number = 1; number <= pdf.numPages; number++) {
        const content = await (await pdf.getPage(number)).getTextContent();
        let text = "";
        for (const item of content.items)
          if ("str" in item) text += item.str + (item.hasEOL ? "\n" : " ");
        if (!text.trim() || /\uFFFD|\u0000/.test(text))
          throw new AppError(
            "UNREADABLE_DOCUMENT",
            `${file.name}, page ${number}: reliable readable text is unavailable. Try a text-based source; OCR is not supported.`,
          );
        pages.push({ number, text });
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError(
        "UNREADABLE_DOCUMENT",
        `${file.name}: the PDF could not be read. It may be corrupt, encrypted or unsupported.`,
      );
    } finally {
      await task.destroy();
    }
  } else {
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true })
        .decode(bytes)
        .replace(/\r\n?/g, "\n");
    } catch {
      throw new AppError(
        "UNREADABLE_DOCUMENT",
        `${file.name}: save this text as UTF-8 and try again.`,
      );
    }
    if (!text.trim() || text.includes("\0"))
      throw new AppError(
        "UNREADABLE_DOCUMENT",
        `${file.name}: no usable text was found.`,
      );
    pages.push({ number: 1, text });
  }
  const source: Source = {
    id,
    hash,
    name: file.name,
    kind,
    bytes: file.size,
    pages,
    passages: [],
  };
  for (const page of pages) {
    const lines = page.text.split("\n");
    let text = "",
      start = 1;
    function append(end: number) {
      if (text) {
        source.passages.push({
          id: `${id}-${hash.slice(0, 16)}-p${page.number}-${source.passages.length + 1}`,
          sourceId: id,
          page: kind === "PDF" ? page.number : null,
          lineStart: start,
          lineEnd: end,
          text,
        });
        text = "";
      }
    }
    lines.forEach((line, i) => {
      if (text.length + line.length > 900) {
        append(i);
        start = i + 1;
      }
      text += line + (i < lines.length - 1 ? "\n" : "");
    });
    append(lines.length);
  }
  if (
    source.pages.reduce((n, p) => n + p.text.length, 0) > LIMITS.textCharacters
  )
    throw new AppError(
      "TEXT_CAPACITY",
      "The complete extracted text exceeds this preview’s processing capacity. No content was truncated. Choose a smaller complete document.",
    );
  return source;
}
