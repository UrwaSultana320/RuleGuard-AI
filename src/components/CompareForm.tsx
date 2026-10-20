"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/state/session";
import { LIMITS, PRIVACY, STAGES } from "@/shared/limits";
import { Icon } from "./Icons";
import { FullSourceView } from "./FullSourceView";
import Link from "next/link";
import { ApplicabilityReview } from "./DegreeApplicability";

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
            ? `${(file.size / 1000).toFixed(0)} KB · Click to replace`
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
      <div className="page-kicker">
        <span className="dot" /> DOCUMENT COMPARISON
      </div>
      <div className="hero-row">
        <div>
          <h1>
            Compare the rules.
            <br />
            <span>Keep the context.</span>
          </h1>
          <p className="hero-copy">
            Explore English-language requirements across two sources.
            <br className="desktop-break" />
            Find the conditions, inspect the evidence, decide what to clarify.
          </p>
        </div>
        <div className="hero-emblem" aria-hidden="true">
          <Icon name="shield" size={70} />
          <span className="orbit-dot" />
          <span className="orbit-dot second" />
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
            <div>
              <h2>Start with your degree</h2>
              <p>
                Document scope is assessed for this selection before findings
                are shown.
              </p>
            </div>
          </div>
          <label>
            Degree level <span className="required">Required</span>
            <select
              value={s.applicant.degree}
              required
              disabled={s.processing}
              onChange={(e) => s.setField("degree", e.target.value)}
            >
              <option value="">Select a degree level</option>
              <option value="Bachelor's">
                Bachelor&apos;s / Undergraduate
              </option>
              <option value="Master's">Master&apos;s / Postgraduate</option>
            </select>
          </label>
        </section>
        <section className="panel">
          <div className="section-heading">
            <span className="section-icon">
              <Icon name="file" />
            </span>
            <div>
              <h2>Your source documents</h2>
              <p>
                Public university documents or clearly labeled synthetic
                examples.
              </p>
            </div>
            <span className="tag">2 sources</span>
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
        <section className="panel">
          <div className="section-heading">
            <span className="section-icon cyan">
              <Icon name="shield" />
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
            <label>
              Intended program <span className="required">Required</span>
              <input
                value={s.applicant.program}
                maxLength={120}
                required
                placeholder="e.g. MSc Data Science"
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
            <Icon name="shield" />
            <strong>A quick privacy check</strong>
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
        {s.error && (
          <div className="notice error" role="alert">
            <Icon name="alert" />
            <div>
              <strong>
                {s.error.code === "AI_NOT_ENABLED"
                  ? "Your sources are ready to inspect"
                  : "Comparison could not be completed"}
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
              {STAGES[s.stage] ?? "Preparing analysis"}
            </p>
            {s.stage === 1 && (
              <small>
                One AI request examines requirements, conditions and comparisons
                together.
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
                : s.error
                  ? "Retry Analysis"
                  : "Compare Requirements"}
            <Icon name="arrow" />
          </button>
        </div>
      </form>
      <FullSourceView />
      <section className="trust-row">
        <div>
          <Icon name="eye" />
          <strong>Trace the evidence</strong>
          <p>Inspect source text and page references.</p>
        </div>
        <div>
          <Icon name="shield" />
          <strong>Review every suggestion</strong>
          <p>Accept, reject or mark it uncertain.</p>
        </div>
        <div>
          <Icon name="mail" />
          <strong>Ask a clearer question</strong>
          <p>Prepare a draft for official clarification.</p>
        </div>
      </section>
    </>
  );
}
