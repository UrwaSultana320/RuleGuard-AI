"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Finding, Review } from "@/shared/contracts";
import { CATEGORIES } from "@/shared/limits";
import { useSession } from "@/state/session";
import { FullSourceView } from "./FullSourceView";
import { Icon } from "./Icons";
import { RuleInterpretation, UncertaintyNotes } from "./RuleInterpretation";
import { DegreeAssessments } from "./DegreeApplicability";
export function emailText(f: Finding, program: string) {
  const refs = Array.from(
    new Set(
      f.rules.flatMap((r) =>
        r.evidence.map(
          (e) =>
            `${e.sourceName} — ${e.page ? `PDF page ${e.page}` : `lines ${e.lineStart}–${e.lineEnd}`}`,
        ),
      ),
    ),
  );
  return `Dear Admissions Team,\n\nI am reviewing English-language requirements for ${program}. I would appreciate clarification on the following preliminary question:\n\n${f.clarificationQuestion}\n\nSources I am reviewing:\n${refs.map((r) => "- " + r).join("\n")}\n\nCould you confirm the applicable conditions and any relevant exceptions? I am seeking official guidance rather than assuming an exemption or a conflict.\n\nThank you.`;
}
function FindingCard({
  finding: f,
  index,
}: {
  finding: Finding;
  index: number;
}) {
  const s = useSession();
  const review = s.reviewOf(f.id);
  const [copyState, setCopyState] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const canClarify = [
    "Potential Contradiction",
    "Insufficient Evidence",
  ].includes(f.classification);
  const disabled = review === "Rejected" || s.outdated;
  const [email, setEmail] = useState(() =>
    emailText(f, s.report!.applicant.program),
  );
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(label);
    } catch {
      setCopyState(
        "Copy is unavailable. Select and copy the visible text instead.",
      );
    }
  }
  function jump(id: string, sourceId: string) {
    s.setActiveSource(sourceId);
    setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      0,
    );
  }
  return (
    <article
      className={`finding category-${CATEGORIES.indexOf(f.classification)} ${review === "Rejected" ? "rejected" : ""}`}
    >
      <div className="finding-top">
        <div>
          <span className="finding-number">
            Finding {String(index + 1).padStart(2, "0")}
          </span>
          <span className="category-label">{f.classification}</span>
          <span className="preliminary-label">Preliminary AI finding</span>
          <h3>{f.topic}</h3>
        </div>
        <span className={`review-badge review-${review.toLowerCase()}`}>
          {review === "Pending" ? "Pending review" : `${review} by you`}
        </span>
      </div>
      <p>{f.explanation}</p>
      {f.guardNotes.length > 0 && (
        <div className="guard-note">
          <strong>Evidence/applicability safeguard</strong>
          <p>
            The model suggested {f.modelClassification}; the system retained
            this topic as Insufficient Evidence. This does not repair the AI
            reasoning.
          </p>
          <ul>
            {f.guardNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      <details className="evidence" open={index === 0}>
        <summary>
          <Icon name="eye" size={17} />
          View Evidence<span>Source text & conditions</span>
        </summary>
        <div className="evidence-grid">
          {["A", "B"].map((sourceId) => {
            const rules = f.rules.filter((r) => r.sourceId === sourceId);
            return (
              <div className="evidence-source" key={sourceId}>
                <div className="source-title">Document {sourceId}</div>
                {!rules.length ? (
                  <p>
                    No supporting rule was identified in this source. Do not
                    assume agreement or absence.
                  </p>
                ) : (
                  rules.map((r) => (
                    <section key={r.id}>
                      {r.evidence.map((e) => (
                        <blockquote key={e.id}>
                          <div className="quote-source">
                            <Icon name="file" size={15} />
                            <span>
                              {e.sourceName} ·{" "}
                              {e.page
                                ? `PDF page ${e.page}`
                                : `Lines ${e.lineStart}–${e.lineEnd}`}
                            </span>
                          </div>
                          <pre>{e.text}</pre>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => jump(e.id, e.sourceId)}
                          >
                            View full extracted source{" "}
                            <Icon name="arrow" size={14} />
                          </button>
                          <small>
                            Source match verified · reasoning remains
                            preliminary
                          </small>
                        </blockquote>
                      ))}
                      <div className="ai-interpretation">
                        <h4>AI interpretation · check against source</h4>
                        <p>{r.description}</p>
                        <RuleInterpretation rule={r} />
                      </div>
                    </section>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </details>
      <UncertaintyNotes finding={f} />
      <fieldset className="review-controls" disabled={s.outdated}>
        <legend>Your review · not independent verification</legend>
        {(["Accepted", "Rejected", "Uncertain"] as Review[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={review === value}
            onClick={() => s.review(f.id, value)}
          >
            <Icon
              name={
                value === "Accepted"
                  ? "check"
                  : value === "Rejected"
                    ? "close"
                    : "alert"
              }
              size={16}
            />
            {value === "Accepted"
              ? "Accept"
              : value === "Rejected"
                ? "Reject"
                : "Uncertain"}
          </button>
        ))}
        {review !== "Pending" && (
          <button
            type="button"
            className="text-button"
            onClick={() => s.review(f.id, "Pending")}
          >
            Return to pending
          </button>
        )}
      </fieldset>
      {canClarify && (
        <div className="clarification">
          <div className="privacy-heading">
            <Icon name="mail" />
            <strong>A question for official clarification</strong>
          </div>
          <p>{f.clarificationQuestion}</p>
          <small>
            Preliminary draft — review every assertion before use. No email is
            sent automatically.
          </small>
          <div className="action-row">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                void copy(f.clarificationQuestion, "Question copied.")
              }
            >
              <Icon name="file" size={16} />
              Copy Question
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setDraftOpen((v) => !v)}
            >
              <Icon name="mail" size={16} />
              Draft Email
            </button>
          </div>
          {review === "Rejected" && (
            <p>Clarification actions are disabled for a rejected finding.</p>
          )}
          {draftOpen && !disabled && (
            <div className="email-draft">
              <textarea
                aria-label="Email draft text"
                rows={12}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p>
                <a
                  className="secondary-button"
                  href={`mailto:?subject=${encodeURIComponent(`Clarification of English-language requirements — ${s.report!.applicant.program}`)}&body=${encodeURIComponent(email)}`}
                >
                  Open editable email draft
                </a>
                <button
                  type="button"
                  onClick={() => void copy(email, "Email text copied.")}
                >
                  Copy email text
                </button>
              </p>
            </div>
          )}
          <p className="copy-status" role="status">
            {copyState}
          </p>
        </div>
      )}
    </article>
  );
}
export function ResultsDashboard() {
  const s = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!s.report) router.replace("/");
  }, [s.report, router]);
  if (!s.report) return <p>Open a comparison to view findings.</p>;
  const report = s.report;
  const unresolved = report.findings.filter(
    (f) => f.classification === "Insufficient Evidence",
  ).length;
  return (
    <>
      <div className="page-kicker">YOUR DOCUMENT REVIEW</div>
      <div className="results-heading">
        <div>
          <h1>
            Your evidence, <span>side by side.</span>
          </h1>
          <p className="hero-copy">
            {report.applicant.program} · {report.applicant.degree} ·{" "}
            {report.applicant.intake}
          </p>
        </div>
        <Link className="secondary-button" href="/">
          Edit inputs <Icon name="arrow" size={16} />
        </Link>
      </div>
      {s.outdated && (
        <div className="notice warning">
          <Icon name="alert" />
          <div>
            <strong>Outdated — Reanalysis Required</strong>
            <p>
              These findings and review choices apply to older inputs.{" "}
              <Link href="/">Run Comparison Again</Link>
            </p>
          </div>
        </div>
      )}
      <div className="notice preliminary">
        <Icon name="spark" />
        <div>
          <strong>AI suggestions — human review required.</strong>
          <p>
            Findings may be incorrect or incomplete. Check conditions and
            exceptions in the full extracted sources. Accepting a finding does
            not confirm accuracy or admissions eligibility.
          </p>
        </div>
      </div>
      <section className="panel report-applicability">
        <div className="report-section-label">01 / DOCUMENT RELEVANCE</div>
        <h2>
          {report.degreeVerification === "unverified"
            ? "Degree applicability unverified"
            : "Degree applicability — preliminary AI assessment"}
        </h2>
        <p>
          These scope interpretations require human review. Traceable quotations
          do not guarantee correct degree identification.
        </p>
        <DegreeAssessments assessments={report.applicability.assessments} />
      </section>
      <div className="report-section-heading">
        <div>
          <div className="report-section-label">
            02 / PRELIMINARY COMPARISON
          </div>
          <h2>What the AI identified</h2>
        </div>
        <a className="text-link" href="#sources">
          Inspect full sources <Icon name="arrow" size={16} />
        </a>
      </div>
      <div className="metrics">
        <div>
          <span>AI-suggested requirements compared</span>
          <strong>{report.findings.length - unresolved}</strong>
          <small>Consistent + contradictions + different conditions</small>
        </div>
        <div>
          <span>AI-suggested unresolved findings</span>
          <strong>{unresolved}</strong>
          <small>Topics with insufficient evidence</small>
        </div>
        <div>
          <span>AI-suggested topics assessed</span>
          <strong>{report.findings.length}</strong>
          <small>Compared + unresolved findings</small>
        </div>
      </div>
      <p className="metrics-note">
        Totals include all displayed suggestions, including rejected ones. They
        do not represent every requirement in the documents or human agreement.
      </p>
      <div className="review-summary" aria-label="Review progress">
        Your review
        {(["Pending", "Accepted", "Uncertain", "Rejected"] as Review[]).map(
          (value) => (
            <span key={value}>
              {value}{" "}
              <b>
                {
                  report.findings.filter((f) => s.reviewOf(f.id) === value)
                    .length
                }
              </b>
            </span>
          ),
        )}
      </div>
      <div className="category-summary">
        {CATEGORIES.map((category, i) => (
          <div key={category} className={"category-" + i}>
            <span>{category}</span>
            <strong>
              {
                report.findings.filter((f) => f.classification === category)
                  .length
              }
            </strong>
          </div>
        ))}
      </div>
      {!report.findings.length && (
        <div className="panel empty-state">
          <Icon name="eye" size={30} />
          <h2>AI suggested no relevant requirement topics.</h2>
          <p>
            Review the full extracted sources; relevant requirements may have
            been missed. This does not establish agreement or absence of
            requirements.
          </p>
          <Link href="/">Return to your retained inputs</Link>
        </div>
      )}
      <div className="findings-list">
        {[...report.findings]
          .sort(
            (a, b) =>
              Number(b.classification === "Potential Contradiction") -
              Number(a.classification === "Potential Contradiction"),
          )
          .map((f, index) => (
            <FindingCard key={report.id + f.id} finding={f} index={index} />
          ))}
      </div>
      {report.limitations.length > 0 && (
        <details className="limitations">
          <summary>Analysis limitations</summary>
          <ul>
            {report.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </details>
      )}
      <FullSourceView forReport />
      <p className="report-footer">
        Generated with {report.model}. Source references are reconstructed by
        RuleGuard; conclusions remain preliminary.
      </p>
    </>
  );
}
