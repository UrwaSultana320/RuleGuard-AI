"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { Report, Review, Source } from "@/shared/contracts";
import {
  generateClarificationEmail, prepareEmailInput, EMAIL_EMPTY_STATE, EMAIL_FAILURE,
  EMAIL_LABELS, emailCopyText, emailMailto, type EmailDraft,
} from "@/shared/clarification-email";

function EmailEditor({ draft, recipient, edit }: {
  draft: EmailDraft; recipient: string; edit: (field: keyof EmailDraft, value: string) => void;
}) {
  const [status, setStatus] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const fields = [bodyRef.current, subjectRef.current].filter((field): field is HTMLTextAreaElement => field !== null);
    const fit = () => fields.forEach(field => {
      field.style.height = "auto"; field.style.height = `${field.scrollHeight + 2}px`;
    });
    fit();
    const widths = new Map(fields.map(field => [field, field.clientWidth]));
    const observer = new ResizeObserver(() => {
      if (fields.every(field => widths.get(field) === field.clientWidth)) return;
      fields.forEach(field => widths.set(field, field.clientWidth));
      fit();
    });
    fields.forEach(field => observer.observe(field));
    return () => observer.disconnect();
  }, [draft.body, draft.subject]);
  const mailto = emailMailto(draft, recipient);
  async function copy() {
    try { await navigator.clipboard.writeText(emailCopyText(draft)); setStatus("Email copied."); }
    catch { setStatus("Copy is unavailable. Select and copy the subject and body below."); }
  }
  return <>
    <div className="action-row email-actions">
      <button type="button" onClick={() => void copy()}>Copy email</button>
      {mailto.href ? <a className="secondary-button" href={mailto.href}>Open in mail app</a> : <button type="button" disabled>Open in mail app</button>}
    </div>
    {mailto.reason === "recipient" && <p role="alert">Enter a valid recipient email address, or leave it blank.</p>}
    {mailto.reason === "length" && <p className="form-helper">This email is too long to open reliably in a mail app. Use Copy email and paste it into your mail app.</p>}
    <p role="status" className="copy-status">{status}</p>
    <label htmlFor="email-subject">Email subject</label>
    <textarea ref={subjectRef} id="email-subject" rows={2} value={draft.subject} onChange={event => { edit("subject", event.target.value.replace(/[\r\n]+/g, " ")); setStatus(""); }} />
    <label htmlFor="email-body">Email body</label>
    <textarea ref={bodyRef} id="email-body" rows={12} value={draft.body} onChange={event => { edit("body", event.target.value); setStatus(""); }} />
    <p className="form-helper">Replace [Your full name] and [if you have one]. Review any edits and check quotations before sending.</p>
    <details className="email-preview"><summary>Formatted preview</summary>
      <div aria-label="Formatted email preview">{draft.body.split("\n").map((line, i) => <div key={i}>{EMAIL_LABELS.some(label => label === line) ? <strong>{line}</strong> : line || <br />}</div>)}</div>
    </details>
  </>;
}

export function ClarificationEmail({ report, reviewOf, outdated, sources = [], currentRevision = report.revision }: {
  report: Report; reviewOf: (id: string) => Review; outdated: boolean;
  sources?: Source[]; currentRevision?: number;
}) {
  const [includeUncertain, setIncludeUncertain] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [saved, setSaved] = useState<{ draft: EmailDraft; signature: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [replace, setReplace] = useState(false);
  const [message, setMessage] = useState("");
  const reviews = Object.fromEntries(report.findings.map(f => [f.id, reviewOf(f.id)]));
  const context = { report, reviews, sources, includeUncertain, currentRevision, outdated };
  const signature = JSON.stringify(context);
  const stale = !!saved && saved.signature !== signature;
  let eligible = false;
  try { eligible = prepareEmailInput(context).findings.length > 0; }
  catch { eligible = report.findings.some(f => reviews[f.id] === "Accepted" || (includeUncertain && reviews[f.id] === "Uncertain")); }
  function generate() {
    if (dirty && !replace) { setReplace(true); return; }
    const result = generateClarificationEmail(context);
    // Diagnostics contain only fixed categories. Never log source/user content.
    for (const code of result.diagnostics) console.warn(code);
    setMessage(result.mode === "failed" ? EMAIL_FAILURE : result.mode === "empty" ? EMAIL_EMPTY_STATE : "");
    setSaved(result.draft ? { draft: result.draft, signature } : null);
    setDirty(false); setReplace(false);
  }
  return <section className="panel clarification-email" id="clarification-email" aria-labelledby="clarification-email-heading">
    <h2 id="clarification-email-heading" tabIndex={-1}>Your email to the university</h2>
    <p>Review the findings, then draft one email using exact source passages. Nothing is sent automatically.</p>
    <label className="consent">
      <input type="checkbox" checked={includeUncertain} disabled={outdated} onChange={event => { setIncludeUncertain(event.target.checked); setReplace(false); setMessage(""); }} />
      <span>Include uncertain findings</span>
    </label>
    {outdated && <p role="status">Run comparison again before drafting an email from these outdated findings.</p>}
    {!eligible && !outdated && <p>{EMAIL_EMPTY_STATE} Only findings that require clarification qualify; uncertain findings need explicit opt-in.</p>}
    {stale && <p role="status">Your review choices or inputs changed. The previous draft is outdated; generate a new draft before copying or opening it.</p>}
    <div className="action-row"><button type="button" disabled={outdated || !eligible} onClick={generate}>{replace ? "Replace edited draft" : "Draft Clarification Email"}</button>
      {replace && <button type="button" onClick={() => setReplace(false)}>Keep previous draft</button>}
    </div>
    {replace && <p role="status">You edited the previous draft. Replacing it will discard those edits. You can keep it below for reference.</p>}
    {message && <p role="alert">{message}</p>}
    {saved && (stale || outdated) && <details><summary>Previous draft — outdated, for reference only</summary><pre className="previous-email">{emailCopyText(saved.draft)}</pre></details>}
    {saved && !stale && !outdated && <>
      <label htmlFor="email-recipient">Recipient email (optional)</label>
      <input id="email-recipient" type="email" value={recipient} onChange={event => setRecipient(event.target.value)} />
      <EmailEditor draft={saved.draft} recipient={recipient} edit={(field, value) => {
        setSaved({ ...saved, draft: { ...saved.draft, [field]: value } }); setDirty(true); setReplace(false);
      }} />
    </>}
  </section>;
}
