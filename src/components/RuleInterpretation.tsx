import type { Finding, Rule } from "@/shared/contracts";

// Presentation safeguards, not a semantic classifier or a repair of the model response.
export function RuleInterpretation({ rule: r }: { rule: Rule }) {
  return (
    <>
      <p className="rule-context">
        <strong>AI-proposed scope:</strong> {r.scope}
        <br />
        <strong>Applicability:</strong>{" "}
        {r.scopeMatch === "matches"
          ? "AI suggests scope matches"
          : r.scopeMatch === "unknown"
            ? "Uncertain applicability"
            : "AI suggests a different scope"}
        <br />
        <strong>AI assessment of condition satisfaction:</strong>{" "}
        {r.conditionStatus.replaceAll("_", " ")}
      </p>
      <div className="structure-review">
        <span className="structure-status">
          Review required · structure unverified
        </span>
        <h4>
          {r.conditions.length
            ? "AI-proposed conditions"
            : "Conditions: not established"}
        </h4>
        {r.conditions.length ? (
          <ul>
            {r.conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : (
          <p>
            No separate condition clauses were supplied by the AI. Conditions
            may remain in its summary or the source; an empty list does not mean
            there are none.
          </p>
        )}
        <h4>
          {r.exceptions.length
            ? "AI-proposed exception grouping"
            : "Exceptions: not established"}
        </h4>
        {r.exceptions.length ? (
          <>
            <p>
              A prohibition is not an exception. Check whether each statement
              actually permits a departure from a rule; this AI grouping may be
              incorrect.
            </p>
            <ul>
              {r.exceptions.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            No separate exception clauses were supplied by the AI. Review the
            full source before assuming that no exceptions apply.
          </p>
        )}
        <p className="structure-footer">
          Compare every proposed clause with the exact quotations and full
          extracted source. Source matching does not verify this organization or
          prove complete coverage.
        </p>
      </div>
    </>
  );
}
export function UncertaintyNotes({ finding: f }: { finding: Finding }) {
  const unknownSatisfaction = f.rules.some(
    (r) => r.conditionStatus === "unknown",
  );
  if (!unknownSatisfaction && !f.unknowns.length) return null;
  return (
    <div className="unknowns">
      {unknownSatisfaction && (
        <>
          <strong>Applicant evidence not established</strong>
          <p>
            The AI has not established whether the applicant holds any required
            certificate or qualification, achieved required results, completed
            required study, or obtained required approval. Check which facts
            this source requires. A matching policy scope does not establish
            possession, satisfaction or eligibility.
          </p>
        </>
      )}
      {f.unknowns.length > 0 && (
        <>
          <strong>AI uncertainty notes · review required</strong>
          <p>
            These notes may misstate what is missing. Check them against the
            applicant facts and source conditions.
          </p>
          <ul>
            {f.unknowns.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
