import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("both synthetic samples load their nonempty contents and display exact byte sizes", async ({ page }) => {
  await page.route("**/*", (route) =>
    ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
  await page.goto("/");
  await page.getByRole("radio", { name: /^Master's/ }).check();
  const responses = ["A", "B"].map(id =>
    page.waitForResponse(response => response.url().endsWith(`/samples/synthetic-${id}.txt`)),
  );
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  for (const [index, response] of (await Promise.all(responses)).entries()) {
    const id = index === 0 ? "A" : "B";
    const expected = await readFile(`public/samples/synthetic-${id}.txt`);
    expect(response.ok()).toBe(true);
    const body = await response.body();
    expect(body.length).toBeGreaterThan(0);
    expect(body).toEqual(expected);
    const text = body.toString("utf8");
    expect(text).toContain("SYNTHETIC TEST DOCUMENT - NOT OFFICIAL UNIVERSITY GUIDANCE");
    expect(text).toContain("Fictional institution: RuleGuard Example University");
    expect(text).toContain(`Fixture: S01-contradiction; Source: ${id}`);
    if (id === "B") {
      expect(text).toContain("All international applicants must submit IELTS Academic or TOEFL iBT.");
      expect(text).toContain("An MOI certificate is not accepted as a substitute.");
      expect(text).toContain("There are no waivers or exceptions");
    }
    const upload = page.locator(".upload-zone").nth(index);
    await expect(upload).toContainText(`Synthetic-policy-${id}.txt`);
    await expect(upload).toContainText(`${body.length} bytes · Click to replace`);
    await expect(upload).not.toContainText("0 KB");
  }
});
