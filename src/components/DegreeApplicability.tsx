"use client";
import { useEffect } from "react";
import type { DegreeAssessment } from "@/shared/contracts";
import { degreeLabels } from "@/shared/applicability";
import { useSession } from "@/state/session";

export function DegreeAssessments({
  assessments,
}: {
  assessments: DegreeAssessment[];
}) {
  return (
    <div className="degree-assessments">
      {assessments.map((a) => (
        <article className={`degree-card degree-${a.status}`} key={a.sourceId}>
          <span className="preliminary-label">
            Preliminary AI scope assessment
          </span>
          <h3>Document {a.sourceId}</h3>
          <strong>{degreeLabels[a.status]}</strong>
          <p>{a.explanation}</p>
          {a.guardNotes.length > 0 && (
            <div className="guard-note">
              <p>
                AI proposed: {degreeLabels[a.modelStatus]}. Scope remains
                uncertain.
              </p>
              <ul>
                {a.guardNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          {a.missingInformation.length > 0 && (
            <>
              <h4>Information to confirm</h4>
              <ul>
                {a.missingInformation.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
          <details className="degree-evidence">
            <summary>
              View applicability evidence{" "}
              <span>
                {a.evidence.length} cited passage
                {a.evidence.length === 1 ? "" : "s"}
              </span>
            </summary>
            {a.evidence.length ? (
              a.evidence.map((e) => (
                <blockquote key={e.id}>
                  <p className="source-ref">
                    {e.sourceName} ·{" "}
                    {e.page === null
                      ? `lines ${e.lineStart}–${e.lineEnd}`
                      : `PDF page ${e.page}`}{" "}
                    · {e.id}
                  </p>
                  <pre>{e.text}</pre>
                </blockquote>
              ))
            ) : (
              <p>
                No supporting degree-scope passage was identified. Inspect the
                full sources.
              </p>
            )}
          </details>
        </article>
      ))}
    </div>
  );
}

export function ApplicabilityReview({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const s = useSession();
  const a = s.applicability;
  useEffect(() => {
    if (a) document.getElementById("degree-review-heading")?.focus();
  }, [a]);
  if (!a) return null;
  return (
    <section
      className="panel applicability-review"
      aria-labelledby="degree-review-heading"
      aria-live="polite"
    >
      <div className="section-heading">
        <div>
          <h2 id="degree-review-heading" tabIndex={-1}>
            Review document applicability
          </h2>
          <p>
            Selected degree: {s.applicant.degree}. Source matching does not
            verify the AI&apos;s interpretation.
          </p>
        </div>
      </div>
      <DegreeAssessments assessments={a.assessments} />
      <p className="form-helper">
        Inspect the full extracted sources below, including uncited conditions
        and exceptions. Degree identification and extraction may be incomplete
        or incorrect. Official status, authenticity and publication currency are
        not verified.
      </p>
      {a.gate === "blocked" ? (
        <div className="notice error">
          <div>
            <strong>
              Comparison blocked — replace the mismatching document
            </strong>
            <p>
              A supported exclusive other-degree assessment cannot be overridden
              by acknowledgment. Replace the identified document and run
              comparison again.
            </p>
          </div>
        </div>
      ) : s.hasPendingComparison ? (
        <>
          {a.gate === "uncertain" && (
            <div className="notice warning">
              <div>
                <strong>Degree applicability could not be confirmed</strong>
                <p>
                  Continuing does not establish applicability. Findings remain
                  preliminary and degree applicability unverified.
                </p>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={s.degreeAcknowledged}
                    disabled={s.processing}
                    onChange={(e) => s.setDegreeAcknowledged(e.target.checked)}
                  />
                  <span>
                    I acknowledge the unresolved degree applicability and choose
                    to review the preliminary comparison.
                  </span>
                </label>
              </div>
            </div>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={onContinue}
            disabled={
              s.processing || (a.gate === "uncertain" && !s.degreeAcknowledged)
            }
          >
            {a.gate === "uncertain"
              ? "Continue to preliminary comparison"
              : "View preliminary comparison"}
          </button>
          <p className="form-helper">
            Uses this analysis response; continuing makes no additional AI
            request.
          </p>
        </>
      ) : (
        <p>
          Applicability reviewed. Your comparison is available in this session.
        </p>
      )}
    </section>
  );
}
