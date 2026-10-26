"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/state/session";
import { LIMITS, PRIVACY, STAGES } from "@/shared/limits";
import { Icon } from "./Icons";
import { FullSourceView } from "./FullSourceView";
import Link from "next/link";
import { ApplicabilityReview } from "./DegreeApplicability";

function fileSizeLabel(bytes: number) {
  return bytes < 1000
    ? `${bytes} ${bytes === 1 ? "byte" : "bytes"}`
    : `${(bytes / 1000).toFixed(0)} KB`;
}

async function validateFile(file: File) {
  if (!file.size || file.size > LIMITS.fileBytes)
    throw Error("Choose a nonempty file up to 2 MB (2,000,000 bytes).");
  if (!/\.(pdf|txt)$/i.test(file.name) || file.name.length > 160)
    throw Error("Choose a PDF or UTF-8 TXT file with a shorter filename.");
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const task = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > LIMITS.pdfPages)
        throw Error(
          `This PDF has ${pdf.numPages} pages. The limit is 15; no pages will be omitted.`,
        );
    } finally {
      await task.destroy();
    }
  }
}
function Upload({ index }: { index: number }) {
  const s = useSession();
  const [checking, setChecking] = useState(false);
  const selection = useRef(0);
  const file = s.files[index];
  async function select(candidate: File | undefined) {
    if (!candidate) return;
    const ticket = ++selection.current;
    s.setFile(index, null, "Checking document…");
    setChecking(true);
    try {
      await validateFile(candidate);
      if (ticket === selection.current) s.setFile(index, candidate);
    } catch (e) {
      if (ticket === selection.current)
        s.setFile(
          index,
          null,
          e instanceof Error ? e.message : "This document could not be read.",
        );
    } finally {
      if (ticket === selection.current) setChecking(false);
    }
  }
  return (
    <div className="upload-block">
      <div className="upload-title">
        <label htmlFor={"file-" + index}>
          Document {index === 0 ? "A" : "B"}
        </label>
        <span>{index === 0 ? "First source" : "Second source"}</span>
      </div>
      <label
        className={`upload-zone ${file ? "has-file" : ""} ${s.fileErrors[index] ? "invalid" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!s.processing && s.applicant.degree)
            void select(e.dataTransfer.files[0]);
        }}
      >
        <input
          id={"file-" + index}
          type="file"
          accept=".pdf,.txt"
          disabled={s.processing || checking || !s.applicant.degree}
          onChange={(e) => void select(e.target.files?.[0])}
        />
        <span className="upload-icon">
          <Icon name={file ? "file" : "upload"} size={25} />
        </span>
        <strong>
          {checking
            ? "Checking document…"
            : file
              ? file.name
              : "Choose a document"}
        </strong>
        <span>
          {file
            ? `${fileSizeLabel(file.size)} · Click to replace`
            : "Click to browse or drag a file here"}
        </span>
        <small>PDF or TXT · Up to 2 MB · 15 PDF pages</small>
      </label>
      {s.fileErrors[index] && (
        <p className="field-error" role="alert">
          {s.fileErrors[index]}
        </p>
      )}
    </div>
  );
}
export function CompareForm() {
  const s = useSession();
  const router = useRouter();
  const [sampleError, setSampleError] = useState("");
  const [loadingExample, setLoadingExample] = useState(false);
  const exampleBusy = useRef(false);
  async function tryLiveExample() {
    if (exampleBusy.current || s.processing) return;
    exampleBusy.current = true;
    setLoadingExample(true);
    setSampleError("");
    try {
      const files = await Promise.all(
        ["A", "B"].map(async (id) => {
          const response = await fetch(`/samples/synthetic-${id}.txt`);
          if (!response.ok) throw Error("Sample unavailable");
          const file = new File([await response.text()], `Synthetic-policy-${id}.txt`, {
            type: "text/plain",
          });
          await validateFile(file);
          return file;
        }),
      );
      if (await s.compare({
        files,
        applicant: {
          degree: "Master's",
          program: "Artificial Intelligence",
          intake: "September 2026",
          category: "International applicant",
        },
      })) router.push("/results");
    } catch {
      setSampleError("Sample documents could not be loaded. Please try again or use the sample links below.");
    } finally {
      exampleBusy.current = false;
      setLoadingExample(false);
    }
  }
  async function loadSample() {
    setSampleError("");
    if (!s.applicant.degree) {
      setSampleError(
        "Select a degree first to load accurately labeled samples.",
      );
      return;
    }
    try {
      const results = await Promise.all(
        ["A", "B"].map(async (id) => {
          const prefix = s.applicant.degree === "Bachelor's" ? "bachelor-" : "";
          const r = await fetch(`/samples/${prefix}synthetic-${id}.txt`);
          if (!r.ok) throw Error();
          return new File(
            [await r.text()],
            `${prefix}Synthetic-policy-${id}.txt`,
            {
              type: "text/plain",
            },
          );
        }),
      );
      results.forEach((f, i) => s.setFile(i, f));
      s.markBuiltInFiles(results);
      s.setField("program", `${s.applicant.degree} in Artificial Intelligence`);
      s.setField("intake", "September 2026");
      s.setField("category", "International applicant");
    } catch {
      setSampleError(
        "Sample documents could not be loaded. Please upload your own public or synthetic sources.",
      );
    }
  }
  return (
    <>
      <div className="page-kicker">A LITTLE CLARITY FOR A BIG DECISION</div>
      <div className="hero-row">
        <div>
          <h1>
            Compare the policies.
            <br />
            <span>See the evidence.</span>
          </h1>
        </div>
        <div className="hero-aside">
          <p className="hero-copy">
            AI-assisted requirement review for Bachelor&apos;s and Master&apos;s
            applicants. Check document relevance, explore cited evidence, and
            decide what needs clarification.
          </p>
          <p className="hero-caption">
            Two sources. Your context. Human judgment.
          </p>
          <button
            type="button"
            className="primary-button"
            disabled={loadingExample || s.processing}
            onClick={() => void tryLiveExample()}
          >
            {loadingExample ? "Starting live example…" : "Try a live example"}
            <Icon name="arrow" />
          </button>
          <p className="hero-caption">
            Runs AI analysis on fictional synthetic policies and acknowledges
            the data handling notice below.
          </p>
        </div>
      </div>
      <div className="journey-line">
        <span className="current">
          <b>1</b>Select degree
        </span>
        <i />
        <span>
          <b>2</b>Upload and context
        </span>
        <i />
        <span>
          <b>3</b>Applicability and comparison
        </span>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (await s.compare()) router.push("/results");
        }}
      >
        <section className="panel degree-selection">
          <div className="section-heading">
            <span className="section-number" aria-hidden="true">
              01
            </span>
            <div>
              <h2>Start with your degree</h2>
              <p>
                Document scope is assessed for this selection before findings
                are shown.
              </p>
            </div>
          </div>
          <fieldset className="degree-options" disabled={s.processing}>
            <legend>
              Degree level <span className="required">Required</span>
            </legend>
            {(["Bachelor's", "Master's"] as const).map((degree) => (
              <label
                className={`degree-option ${s.applicant.degree === degree ? "is-selected" : ""}`}
                key={degree}
              >
                <input
                  type="radio"
                  name="degree"
                  value={degree}
                  required
                  checked={s.applicant.degree === degree}
                  onChange={() => s.setField("degree", degree)}
                />
                <span>
                  <strong>{degree}</strong>
                  <small>
                    {degree === "Bachelor's" ? "Undergraduate" : "Postgraduate"}
                  </small>
                </span>
                <span className="radio-indicator" aria-hidden="true" />
              </label>
            ))}
          </fieldset>
        </section>
        <section className="panel upload-panel">
          <div className="section-heading">
            <span className="section-number" aria-hidden="true">
              02
            </span>
            <div>
              <h2>Your source documents</h2>
              <p>
                Public university documents or clearly labeled synthetic
                examples.
              </p>
            </div>
          </div>
          <div className="upload-grid">
            <Upload index={0} />
            <Upload index={1} />
          </div>
          <div className="sample-row">
            <span>Start with a labeled example?</span>
            <button
              type="button"
              className="text-button"
              disabled={s.processing || !s.applicant.degree}
              onClick={() => void loadSample()}
            >
              Use synthetic samples <Icon name="arrow" size={16} />
            </button>
            <a href="/samples/README.txt" target="_blank" rel="noreferrer">
              View sample notes
            </a>
          </div>
          {sampleError && (
            <p role="alert" className="field-error">
              {sampleError}
            </p>
          )}
        </section>
        <section className="panel context-panel">
          <div className="section-heading">
            <span className="section-number" aria-hidden="true">
              03
            </span>
            <div>
              <h2>The applicant context</h2>
              <p>
                The same rule can mean something different for another
                applicant.
              </p>
            </div>
          </div>
          <div className="form-grid">
            <label className="program-field">
              Intended program <span className="required">Required</span>
              <input
                value={s.applicant.program}
                maxLength={120}
                required
                placeholder={
                  s.applicant.degree === "Bachelor's"
                    ? "e.g. BSc Computer Science"
                    : s.applicant.degree === "Master's"
                      ? "e.g. MSc Data Science"
                      : "Select your degree level first"
                }
                disabled={s.processing}
                onChange={(e) => s.setField("program", e.target.value)}
              />
            </label>
            <label>
              Intake
              <input
                value={s.applicant.intake}
                maxLength={80}
                placeholder="Not sure"
                disabled={s.processing}
                onChange={(e) => s.setField("intake", e.target.value)}
              />
            </label>
            <label>
              Applicant category
              <input
                value={s.applicant.category}
                maxLength={120}
                placeholder="Not sure"
                disabled={s.processing}
                onChange={(e) => s.setField("category", e.target.value)}
              />
            </label>
          </div>
          <p className="form-helper">
            Not sure? Leave that value as “Not sure.” We won&apos;t assume which
            conditions apply.
          </p>
        </section>
        <ApplicabilityReview
          onContinue={() => {
            if (s.revealComparison()) router.push("/results");
          }}
        />
        <section className="privacy">
          <div className="privacy-heading">
            <strong>Before you compare</strong>
          </div>
          <p>{PRIVACY}</p>
          <div className="privacy-links">
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noreferrer"
            >
              Google Gemini terms <span aria-hidden="true">↗</span>
            </a>
            <span>No permanent document storage in this application.</span>
          </div>
          <label className="consent">
            <input
              type="checkbox"
              checked={s.consent}
              disabled={s.processing}
              onChange={(e) => s.setConsent(e.target.checked)}
            />
            <span>
              I&apos;m using public or synthetic documents and nonsensitive
              context, and understand the data handling above.
            </span>
          </label>
        </section>
        {s.outdated && (
          <div className="notice warning">
            <Icon name="alert" />
            <div>
              <strong>Outdated — Reanalysis Required</strong>
              <p>
                Your previous report and review choices belong to earlier
                inputs. <Link href="/results">View outdated report</Link>
              </p>
            </div>
          </div>
        )}
        {s.info && (
          <div className="notice info" role="status">
            <div>
              <strong>Your sources are ready to inspect</strong>
              <p>{s.info}</p>
            </div>
          </div>
        )}
        {s.error && (
          <div className="notice error" role="alert">
            <Icon name="alert" />
            <div>
              <strong>
                Comparison could not be completed
              </strong>
              <p>{s.error.message}</p>
              {s.error.diagnosticCode && (
                <p>Diagnostic code: {s.error.diagnosticCode}</p>
              )}
              {s.error.retryAfter && (
                <p>Retry in at least {s.error.retryAfter} seconds.</p>
              )}
              <span>
                Your documents and applicant context remain in this session.
              </span>
            </div>
          </div>
        )}
        {s.processing && (
          <section className="progress" aria-live="polite">
            <p>
              <span className="spinner" />{" "}
              {s.providerProgress
                ? s.providerProgress.phase === "fallback"
                  ? "The AI service is busy, trying the configured fallback..."
                  : "The AI service is busy, retrying..."
                : STAGES[s.stage] ?? "Preparing analysis"}
            </p>
            {s.providerProgress && (
              <small>
                {s.providerProgress.phase === "retry"
                  ? `Retry ${s.providerProgress.attempt} of 3`
                  : "Fallback attempt 1 of 1"}
                {s.providerProgress.delayMs > 0 &&
                  ` · Waiting at least ${Math.ceil(s.providerProgress.delayMs / 1000)} seconds`}
              </small>
            )}
            {s.stage === 1 && (
              <small>
                Each analysis attempt examines requirements, conditions and comparisons together.
              </small>
            )}
            <ol>
              {STAGES.map((label, i) => (
                <li
                  key={label}
                  className={
                    i === s.stage ? "active" : i < s.stage ? "done" : ""
                  }
                >
                  {i < s.stage ? "✓" : i + 1} {label}
                </li>
              ))}
            </ol>
          </section>
        )}
        <div className="submit-row">
          <p>
            <Icon name="spark" size={17} />
            Preliminary AI findings. Your review matters.
          </p>
          <button
            className="primary-button"
            type="submit"
            disabled={s.processing}
          >
            {s.processing
              ? "Processing…"
              : s.outdated
                ? "Run Comparison Again"
                : s.error?.analysisFailed
                  ? "Retry Analysis"
                  : "Compare Requirements"}
            <Icon name="arrow" />
          </button>
        </div>
      </form>
      <FullSourceView />
      <section className="trust-row">
        <div>
          <strong>Trace the evidence</strong>
          <p>Inspect source text and page references.</p>
        </div>
        <div>
          <strong>Review every suggestion</strong>
          <p>Accept, reject or mark it uncertain.</p>
        </div>
        <div>
          <strong>Ask a clearer question</strong>
          <p>Prepare a draft for official clarification.</p>
        </div>
      </section>
    </>
  );
}
