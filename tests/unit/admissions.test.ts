import { describe, expect, it } from "vitest";
import { buildReport } from "@/server/evidence";
import { instructions } from "@/server/prompt";
import { requestContents } from "@/server/gemini";
import { generateClarificationEmail, prepareEmailInput } from "@/shared/clarification-email";
import { admissionsCases, admissionsFixture } from "../fixtures/admissions";
import { readFile } from "node:fs/promises";
import { extractDocument } from "@/server/documents";

describe("admissions-wide offline contracts (authored model output, not Gemini reasoning)", () => {
  it.each(admissionsCases)("retains source-backed $topic", async scenario => {
    const { raw, sources, applicant } = await admissionsFixture([scenario]);
    const report = buildReport(raw, sources, applicant, 1);
    expect(report.findings[0].classification).toBe(scenario.classification);
    expect(report.findings[0].rules[0].evidence.some(e => e.text.includes(scenario.a))).toBe(true);
    expect(report.findings[0].rules.flatMap(r => r.evidence).every(e => e.sourceVerified)).toBe(true);
    expect(report.applicability.gate).toBe("allowed");
  });

  it("preserves many independent topics, complete extraction and full request passages", async () => {
    const { raw, sources, applicant } = await admissionsFixture();
    const report = buildReport(raw, sources, applicant, 3);
    expect(report.findings).toHaveLength(admissionsCases.length);
    for (const c of admissionsCases) expect(sources[0].pages[0].text).toContain(c.a);
    const request = JSON.parse(requestContents(sources, applicant)[0].parts[0].text);
    expect(request.sources.map((s: { passages: unknown[] }) => s.passages.length)).toEqual(sources.map(s => s.passages.length));
    expect(raw.coverage).toHaveLength(sources.flatMap(s => s.passages).length);
    // The prompt hash already participates in cache identity; changing scope
    // invalidates cached English-only outputs without changing quota behavior.
    expect(instructions).toContain("NOT an exhaustive list");
    expect(instructions).toContain("distinct stages");
    expect(instructions).toContain("never convert scales");
    expect(instructions).not.toContain("Compare English-language proficiency");
  });

  it.each(["Bachelor's", "Master's"] as const)("retains selected %s scope and rejects other-degree findings", async degree => {
    const { raw, sources, applicant } = await admissionsFixture([admissionsCases[2]], degree);
    expect(buildReport(raw, sources, applicant, 1).findings[0].rules[0].degreeMatch).toBe("selected");
    raw.rules[0].degreeMatch = "other";
    expect(() => buildReport(raw, sources, applicant, 1)).toThrow();
  });

  it("keeps a mixed-degree GPA section out of selected-degree findings", async () => {
    const { raw, sources, applicant } = await admissionsFixture([admissionsCases[2]]);
    const text = sources[0].pages[0].text + "\nThis separate section applies only to Bachelor's applicants: the minimum cumulative GPA is 2.5 on a 4.0 scale.";
    // Re-extract first so registry identity and all references use the new bytes.
    const mixed = await extractDocument(new File([text], sources[0].name), "A");
    const oldId = sources[0].passages[0].id;
    const newId = mixed.passages[0].id;
    const revised = JSON.parse(JSON.stringify(raw).replaceAll(oldId, newId)) as typeof raw;
    sources[0] = mixed;
    revised.documentAssessments[0].status = "multiple";
    revised.rules.push({ ...structuredClone(revised.rules[0]), ruleId: "A-other-degree", degreeMatch: "other",
      requirement: { text: "Bachelor's GPA 2.5 on a 4.0 scale.", passageIds: [newId] },
      degreeEvidence: { text: "This separate section applies only to Bachelor's applicants.", passageIds: [newId] } });
    revised.coverage.find(c => c.passageId === newId)!.ruleIds.push("A-other-degree");
    expect(buildReport(revised, sources, applicant, 1).findings[0].rules.map(r => r.description)).toEqual([admissionsCases[2].a, admissionsCases[2].b]);
    revised.findings[0].ruleIds.push("A-other-degree");
    expect(() => buildReport(revised, sources, applicant, 1)).toThrow();
  });

  it("extracts the separate admissions-wide public samples without changing built-in English examples", async () => {
    const sources = await Promise.all(["A", "B"].map(async id => extractDocument(
      new File([await readFile(`public/samples/admissions-${id}.txt`)], `admissions-${id}.txt`), id,
    )));
    for (const source of sources) {
      expect(source.pages[0].text).toContain("SYNTHETIC TEST DOCUMENT");
      expect(source.pages[0].text).toContain("apostille");
      expect(source.pages[0].text).toContain("GPA");
      expect(source.pages[0].text).toContain("application fee");
    }
  });

  it("downgrades a proposed contradiction when the response discloses different stage applicability", async () => {
    const { raw, sources, applicant } = await admissionsFixture([admissionsCases[1]]);
    raw.findings[0].classification = "Potential Contradiction";
    raw.rules[1].scopeMatch = "does_not_match";
    const finding = buildReport(raw, sources, applicant, 1).findings[0];
    expect(finding.classification).toBe("Insufficient Evidence");
    expect(finding.guardNotes).toContain("A shared applicant scope has not been established.");
    // This is a structural guard, not an independent stage-language interpreter.
  });

  it("downgrades conflicting claims with unknown applicability and never turns silence into agreement", async () => {
    for (const index of [6, 7]) {
      const { raw, sources, applicant } = await admissionsFixture([admissionsCases[index]]);
      raw.findings[0].classification = "Consistent";
      expect(buildReport(raw, sources, applicant, 1).findings[0].classification).toBe("Insufficient Evidence");
    }
  });

  it("rejects forged citations and incomplete passage accounting across admissions categories", async () => {
    const { raw, sources, applicant } = await admissionsFixture();
    const forged = structuredClone(raw);
    forged.rules[0].requirement.passageIds = [sources[1].passages[0].id];
    expect(() => buildReport(forged, sources, applicant, 1)).toThrow();
    raw.coverage.pop();
    expect(() => buildReport(raw, sources, applicant, 1)).toThrow();
  });

  it("drafts accepted non-English issues, includes uncertainty only by opt-in, excludes compatible stages", async () => {
    const { raw, sources, applicant } = await admissionsFixture(admissionsCases.slice(0, 8));
    const report = buildReport(raw, sources, applicant, 1);
    const reviews = Object.fromEntries(report.findings.map(f => [f.id, f.classification === "Insufficient Evidence" ? "Uncertain" as const : "Accepted" as const]));
    const context = { report, sources, reviews, currentRevision: 1 };
    const draft = generateClarificationEmail(context).draft;
    expect(draft).not.toBeNull();
    expect(draft!.body).toContain(admissionsCases[0].a);
    expect(draft!.body).toContain(admissionsCases[2].a);
    expect(prepareEmailInput(context).findings.map(f => f.topic)).not.toContain(admissionsCases[1].topic);
    expect(prepareEmailInput(context).findings.map(f => f.topic)).not.toContain(admissionsCases[7].topic);
    // Exact evidence is passage-sized and may contain neighbouring requirements;
    // exclusion controls selected issues, not deletion of words from quotations.
    const uncertain = generateClarificationEmail({ ...context, includeUncertain: true }).draft;
    expect(uncertain!.body).toContain(admissionsCases[7].a);
    expect(uncertain!.body).toContain("I may have misread this; please correct me if so.");
  });
});
