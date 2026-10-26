"use client";
import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Finding, Review } from "@/shared/contracts";
import { findingSummary, quoteDisplay } from "@/shared/finding-display";
import { resultsVerdict } from "@/shared/results-verdict";
import { emailIssueType } from "@/shared/clarification-email";
import { CATEGORIES } from "@/shared/limits";
import { useSession } from "@/state/session";
import { FullSourceView } from "./FullSourceView";
import { Icon } from "./Icons";
import { RuleInterpretation, UncertaintyNotes } from "./RuleInterpretation";
import { DegreeAssessments } from "./DegreeApplicability";
import { ClarificationEmail } from "./ClarificationEmail";
const findingTypes = {
  Consistent: { label: "Consistent", icon: "check" },
  "Potential Contradiction": { label: "Contradiction", icon: "alert" },
  "Different Applicable Conditions": { label: "Exception", icon: "arrow" },
  "Insufficient Evidence": { label: "Missing information", icon: "eye" },
} as const;
const countLabels = {
  Consistent: ["consistent finding", "consistent findings"],
  "Potential Contradiction": ["contradiction", "contradictions"],
  "Different Applicable Conditions": ["exception", "exceptions"],
  "Insufficient Evidence": ["missing information finding", "missing information findings"],
} as const;

function focusEmail(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("clarification-email")?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("clarification-email-heading")?.focus({ preventScroll: true });
}

function reference(e: Finding["rules"][number]["evidence"][number]) {
  return e.page ? `PDF page ${e.page}` : `Lines ${e.lineStart}–${e.lineEnd}`;
}

function FindingCard({
  finding: f,
  index,
  onAccept,
}: {
  finding: Finding;
  index: number;
  onAccept: () => void;
}) {
  const s = useSession();
  const review = s.reviewOf(f.id);
  const type = findingTypes[f.classification];
  const [copyState, setCopyState] = useState("");
  const canClarify = [
    "Potential Contradiction",
    "Insufficient Evidence",
  ].includes(f.classification);
  const disabled = review === "Rejected" || s.outdated;
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
    const disclosure = document.getElementById("full-source-disclosure") as HTMLDetailsElement | null;
    if (disclosure) disclosure.open = true;
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
      aria-labelledby={`title-${f.id}`}
      className={`finding category-${CATEGORIES.indexOf(f.classification)} ${review === "Rejected" ? "rejected" : ""}`}
    >
      <div className="finding-top">
        <div>
          <span className="finding-number">
            Finding {String(index + 1).padStart(2, "0")}
          </span>
          <span className="category-label">
            <Icon name={type.icon} size={16} /> {type.label}
          </span>
          <span className="preliminary-label">AI interpretation, check against source</span>
          <h3 id={`title-${f.id}`}>{f.topic}</h3>
        </div>
        <span className={`review-badge review-${review.toLowerCase()}`}>
          {review === "Pending" ? "Pending review" : `${review} by you`}
        </span>
      </div>
      <p className="finding-explanation">{findingSummary(f)}</p>
      <div className="evidence" aria-label="Source quotations">
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
                      {r.evidence.map((e) => {
                        const quote = quoteDisplay(e.text, `${f.topic} ${r.description}`);
                        return (
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
                            <pre>{quote.before}<mark>{quote.highlight}</mark>{quote.after}</pre>
                            {quote.trimmed && <small>Header omitted from display; citation covers the full cited passage.</small>}
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => jump(e.id, e.sourceId)}
                            >
                              View full extracted source{" "}
                              <Icon name="arrow" size={14} />
                            </button>
                            {e.sourceVerified === true ? (
                              <span className="source-verified">
                                <Icon name="check" size={16} />
                                Source verified · {reference(e)}
                              </span>
                            ) : (
                              <span className="source-unverified">
                                <Icon name="alert" size={16} />
                                Source not verified · {reference(e)}
                              </span>
                            )}
                          </blockquote>
                        );
                      })}
                    </section>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
      <details className="finding-details">
        <summary>Show details</summary>
        <h4>Full AI explanation · {f.classification}</h4>
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
        {f.rules.map(r => (
          <section className="ai-interpretation" key={r.id}>
            <h4>Document {r.sourceId} · AI interpretation</h4>
            <p>{r.description}</p>
            <RuleInterpretation rule={r} />
            {r.evidence.filter(e => quoteDisplay(e.text, `${f.topic} ${r.description}`).trimmed).map(e => (
              <div className="original-quotation" key={e.id}>
                <h4>Full cited passage · {e.sourceName} · {reference(e)}</h4>
                <pre>{e.text}</pre>
              </div>
            ))}
          </section>
        ))}
        <UncertaintyNotes finding={f} />
      </details>
      <fieldset className="review-controls" disabled={s.outdated}>
        <legend>Your review · not independent verification</legend>
        {(["Accepted", "Rejected", "Uncertain"] as Review[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={review === value}
            onClick={() => {
              s.review(f.id, value);
              if (value === "Accepted") onAccept();
            }}
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
        <details className="clarification">
          <summary>Official clarification</summary>
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
          </div>
          {review === "Rejected" && (
            <p>Clarification actions are disabled for a rejected finding.</p>
          )}
          <p className="copy-status" role="status">
            {copyState}
          </p>
        </details>
      )}
    </article>
  );
}
export function ResultsDashboard() {
  const s = useSession();
  const router = useRouter();
  const [emailRevealRequest, setEmailRevealRequest] = useState(0);
  useEffect(() => {
    if (!s.report) router.replace("/");
  }, [s.report, router]);
  useEffect(() => {
    if (!emailRevealRequest) return;
    document.getElementById("clarification-email")?.scrollIntoView({ behavior: "instant", block: "start" });
    document.getElementById("clarification-email-heading")?.focus({ preventScroll: true });
  }, [emailRevealRequest]);
  if (!s.report) return <p>Open a comparison to view findings.</p>;
  const report = s.report;
  const quotes = report.findings.flatMap((f) => f.rules.flatMap((r) => r.evidence));
  const verifiedQuotes = quotes.filter((e) => e.sourceVerified === true).length;
  const verdict = resultsVerdict(report.findings);
  const counts = CATEGORIES.map((category, index) => ({
    category, index, count: report.findings.filter(f => f.classification === category).length,
  }));
  const emailReady = !s.outdated && report.findings.some(f => s.reviewOf(f.id) === "Accepted" && emailIssueType(f));
  return (
    <>
      <section className={`results-verdict verdict-${verdict.kind}`} aria-labelledby="verdict-heading">
        <Icon name={verdict.kind === "clear" ? "check" : "alert"} size={28} />
        <div>
          <h2 id="verdict-heading">{verdict.title}</h2>
          {verdict.summary && <p className="verdict-summary">{verdict.summary}</p>}
          <p className="verdict-context">Based on source-verified evidence · AI interpretation requires review.</p>
          {verdict.unverified && <p>Some finding evidence is not source-verified; a direct conflict is not established for those findings.</p>}
          {s.outdated && <p>These results apply to earlier inputs. Run comparison again before relying on them.</p>}
          <a className="primary-button" href="#clarification-email" onClick={focusEmail}>
            Review and send email <Icon name="mail" size={18} />
          </a>
        </div>
      </section>
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
      {report.savedExample && (
        <p className="saved-example-notice" role="status">
          <Icon name="clock" size={16} /> Showing a saved result for this example.
        </p>
      )}
      <section className="results-summary" aria-label="Finding summary">
        <div className="summary-types">
          {counts.filter(item => item.count > 0).map(({ category, index, count }) => (
            <div key={category} className={`summary-type summary-chip category-${index}`}>
              <Icon name={findingTypes[category].icon} size={18} />
              <strong>{count}</strong> <span>{countLabels[category][count === 1 ? 0 : 1]}</span>
            </div>
          ))}
          {counts.filter(item => item.count === 0).map(({ category }) => (
            <small key={category} className="summary-zero">0 {countLabels[category][1]}</small>
          ))}
        </div>
        <div className="summary-verification">
          <Icon name="shield" size={20} />
          <div>
            <strong>
              {verifiedQuotes} of {quotes.length} quotes verified
            </strong>
            <p>Counts describe displayed AI suggestions; source matching does not verify conclusions.</p>
          </div>
        </div>
      </section>
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
            not confirm accuracy or admissions eligibility. Source matching verifies quoted text, not AI reasoning, structure, authenticity or completeness.
          </p>
        </div>
      </div>
      <div className="report-section-heading">
        <div>
          <div className="report-section-label">
            01 / PRELIMINARY COMPARISON
          </div>
          <h2>What the AI identified</h2>
        </div>
        <a className="text-link" href="#full-source-disclosure" onClick={() => {
          const details = document.getElementById("full-source-disclosure") as HTMLDetailsElement | null;
          if (details) details.open = true;
        }}>
          Inspect full sources <Icon name="arrow" size={16} />
        </a>
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
      {!report.findings.length && (
        <div className="panel empty-state">
          <Icon name="eye" size={30} />
          <h2>No contradictions found. Check the original documents.</h2>
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
            <FindingCard key={report.id + f.id} finding={f} index={index}
              onAccept={() => setEmailRevealRequest(request => request + 1)} />
          ))}
      </div>
      <ClarificationEmail key={report.id} report={report} reviewOf={s.reviewOf} outdated={s.outdated} sources={s.reportSources} currentRevision={s.revision} />
      {emailReady && (
        <div className="email-ready-prompt" role="status">
          <Icon name="mail" size={20} />
          <strong>Ready to draft</strong>
          <a href="#clarification-email" onClick={focusEmail}>Review email <Icon name="arrow" size={16} /></a>
        </div>
      )}
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
      <section className="panel report-applicability">
        <div className="report-section-label">02 / DOCUMENT RELEVANCE</div>
        <h2>
          {report.degreeVerification === "unverified"
            ? "Degree applicability unverified"
            : "Degree applicability — preliminary AI assessment"}
        </h2>
        <p>
          These scope interpretations require human review. Traceable quotations
          do not guarantee correct degree identification.
        </p>
        <DegreeAssessments assessments={report.applicability.assessments} compact />
      </section>
      <details className="full-source-disclosure" id="full-source-disclosure">
        <summary>View full extracted source</summary>
        <FullSourceView forReport />
      </details>
      <p className="report-footer">
        Generated with {report.model}. Source references are reconstructed by
        RuleGuard; conclusions remain preliminary.
      </p>
    </>
  );
}
