import { test, expect } from "@playwright/test";
import { editorialReport, editorialSources } from "../fixtures/editorial";
import { mkdir } from "node:fs/promises";

test("editorial design: responsive inputs, keyboard degree choices, evidence-first review and email", async ({
  page,
}) => {
  await mkdir("test-results", { recursive: true });
  await page.route("**/*", (r) =>
    ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
  let requests = 0;
  await page.route("**/api/compare", async (route) => {
    requests++;
    const data = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(data)![1];
    const revision = Number(
      /name="inputRevision"\r\n\r\n([^\r]+)/.exec(data)![1],
    );
    await route.fulfill({
      contentType: "application/x-ndjson",
      body:
        [
          { type: "sources", sources: editorialSources },
          { type: "result", report: editorialReport(revision) },
        ]
          .map((e) => JSON.stringify({ ...e, requestId, revision }))
          .join("\n") + "\n",
    });
  });
  await page.goto("/");
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  const bachelor = page.getByRole("radio", { name: /^Bachelor's/ });
  await bachelor.focus();
  await expect(bachelor).toBeFocused();
  expect(
    await bachelor
      .locator("..")
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
  await bachelor.press("Space");
  await expect(page.getByLabel("Intended program")).toHaveAttribute(
    "placeholder",
    "e.g. BSc Computer Science",
  );
  await page.getByRole("radio", { name: /^Master's/ }).check();
  await expect(page.getByLabel("Intended program")).toHaveAttribute(
    "placeholder",
    "e.g. MSc Data Science",
  );
  // Capture the true empty initial state, not a preselected-degree preview.
  await page.reload();
  for (const width of [320, 375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if ([375, 1366].includes(width)) {
      await page.screenshot({
        path: `test-results/editorial-home-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `test-results/editorial-home-viewport-${width}.png`,
      });
    }
  }
  await page.getByRole("radio", { name: /^Master's/ }).check();
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await expect(page.getByLabel("Intended program")).toHaveValue(
    /Artificial Intelligence/,
  );
  await page
    .getByLabel("Intended program")
    .fill("MSc Computing · Offline visual fixture");
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View preliminary comparison", exact: true })
    .click();
  await expect(page).toHaveURL("/results");
  const first = page.locator(".finding").first();
  await expect(first.locator(".evidence")).toHaveAttribute("open", "");
  expect(
    await first.locator(".evidence blockquote pre").first().textContent(),
  ).toBe(editorialSources[0].passages[2].text);
  expect(
    await first
      .locator(".evidence-source")
      .first()
      .evaluate((el) => {
        const quote = el.querySelector("blockquote")!,
          interpretation = el.querySelector(".ai-interpretation")!;
        return !!(
          quote.compareDocumentPosition(interpretation) &
          Node.DOCUMENT_POSITION_FOLLOWING
        );
      }),
  ).toBe(true);
  await first.getByRole("button", { name: "Draft Email", exact: true }).click();
  await first
    .getByLabel("Email draft text")
    .fill("Edited offline draft. Please confirm the applicable policy.");
  await expect(
    first.getByRole("link", { name: "Open editable email draft" }),
  ).toHaveAttribute("href", /Edited%20offline/);
  for (const width of [320, 375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const layout = await page
      .locator(".evidence-grid")
      .first()
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(layout).toBe(width >= 1366 ? 2 : 1);
    for (const name of ["Accept", "Reject", "Uncertain"])
      expect(
        (await first.getByRole("button", { name, exact: true }).boundingBox())!
          .height,
      ).toBeGreaterThanOrEqual(44);
    if ([375, 1366].includes(width)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `test-results/editorial-findings-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `test-results/editorial-findings-overview-${width}.png`,
      });
      await first
        .locator(".evidence summary")
        .evaluate((el) =>
          el.scrollIntoView({ block: "start", behavior: "instant" }),
        );
      await page.screenshot({
        path: `test-results/editorial-findings-evidence-${width}.png`,
      });
    }
  }
  await page.setViewportSize({ width: 1366, height: 1000 });
  const pairs = await page
    .locator(
      ".hero-copy, .notice.preliminary, .source-title, .category-label, .primary-button:not(:disabled), .quote-source, .preliminary-label",
    )
    .evaluateAll((els) =>
      els.map((el) => {
        const color = getComputedStyle(el).color;
        let node: Element | null = el;
        let background = "";
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            background = bg;
            break;
          }
          node = node.parentElement;
        }
        return { color, background };
      }),
    );
  const luminance = (color: string) => {
    const rgb = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const pair of pairs) {
    const a = luminance(pair.color),
      b = luminance(pair.background);
    expect(
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      JSON.stringify(pair),
    ).toBeGreaterThanOrEqual(4.5);
  }
  await first.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(
    first.getByRole("button", { name: "Draft Email", exact: true }),
  ).toBeDisabled();
  await first.getByRole("button", { name: "Uncertain", exact: true }).click();
  await expect(
    first.getByRole("button", { name: "Draft Email", exact: true }),
  ).toBeEnabled();
  expect(requests).toBe(1); // One intercepted local POST; zero provider requests.
});

test("editorial loading, error and empty states remain readable and preserve source access", async ({
  page,
}) => {
  await page.route("**/*", (r) =>
    ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
  let release = () => {};
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  let attempts = 0;
  await page.route("**/api/compare", async (route) => {
    attempts++;
    const data = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(data)![1];
    const revision = Number(
      /name="inputRevision"\r\n\r\n([^\r]+)/.exec(data)![1],
    );
    await wait;
    const report = editorialReport(revision);
    report.findings = [];
    const events =
      attempts === 1
        ? [
            {
              type: "error",
              code: "PROVIDER_UNAVAILABLE",
              message:
                "OFFLINE UI TEST: no result was generated. Please try again later.",
            },
          ]
        : [
            { type: "sources", sources: editorialSources },
            { type: "result", report },
          ];
    await route.fulfill({
      contentType: "application/x-ndjson",
      body:
        events
          .map((e) => JSON.stringify({ ...e, requestId, revision }))
          .join("\n") + "\n",
    });
  });
  await page.goto("/");
  await page.getByRole("radio", { name: /^Master's/ }).check();
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await expect(page.getByLabel("Intended program")).toHaveValue(
    /Artificial Intelligence/,
  );
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Processing…" }),
  ).toBeDisabled();
  await expect(page.locator(".progress")).toContainText(
    "Reading uploaded documents",
  );
  for (const width of [320, 375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
  release();
  await expect(page.locator(".notice.error")).toContainText(
    "no result was generated",
  );
  await expect(page.getByLabel("Intended program")).toHaveValue(
    /Artificial Intelligence/,
  );
  await page
    .getByRole("button", { name: "Retry Analysis", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View preliminary comparison", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "AI suggested no relevant requirement topics.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Full extracted sources" }),
  ).toBeVisible();
  for (const width of [320, 375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
  expect(attempts).toBe(2); // Local intercepted UI attempts only; no upstream requests.
});
