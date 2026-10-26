import { expect, it } from "vitest";
import { extractDocument } from "@/server/documents";
import { POST } from "@/app/api/compare/route";
import { LIMITS } from "@/shared/limits";

it("rejects a complete 16-page PDF on the server before attempting extraction", async () => {
  const pages = Array.from({ length: 16 }, (_, i) => `${i + 3} 0 R`);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.join(" ")}] /Count 16 >>`,
    ...pages.map(() => "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << >> >>"),
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  await expect(extractDocument(new File([pdf], "synthetic-16-pages.pdf"), "A"))
    .rejects.toMatchObject({ code: "PDF_PAGE_LIMIT" });
});

it("enforces the combined streamed request cap even without Content-Length", async () => {
  const body = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(LIMITS.bodyBytes + 1));
    controller.close();
  } });
  const request = new Request("http://localhost/api/compare", {
    method: "POST", body, duplex: "half",
  } as RequestInit & { duplex: string });
  expect(request.headers.has("content-length")).toBe(false);
  expect((await POST(request)).status).toBe(413);
});
