"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Applicant,
  Event,
  Report,
  Review,
  Source,
} from "@/shared/contracts";
import { LIMITS } from "@/shared/limits";
type WorkError = {
  message: string;
  code?: string;
  diagnosticCode?: string;
  retryAfter?: number;
};
function useWork() {
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const [fileErrors, setFileErrors] = useState<string[]>(["", ""]);
  const [applicant, setApplicant] = useState<Applicant>({
    degree: "Master's",
    program: "",
    intake: "Not sure",
    category: "Not sure",
  });
  const [consent, setConsent] = useState(false);
  const [revision, setRevision] = useState(0);
  const revisionRef = useRef(0);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceRevision, setSourceRevision] = useState(-1);
  const [reportSources, setReportSources] = useState<Source[]>([]);
  const latestSources = useRef<Source[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [processing, setProcessing] = useState(false);
  const busy = useRef(false);
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState<WorkError | null>(null);
  const current = useRef("");
  const [activeSource, setActiveSource] = useState("A");
  const change = () => {
    revisionRef.current++;
    setRevision(revisionRef.current);
    setError(null);
  };
  const setField = (key: keyof Applicant, value: string) => {
    change();
    setApplicant((a) => ({ ...a, [key]: value }));
  };
  const setFile = (index: number, file: File | null, error = "") => {
    change();
    setFiles((f) => f.map((v, i) => (i === index ? file : v)));
    setFileErrors((f) => f.map((v, i) => (i === index ? error : v)));
  };
  async function compare() {
    if (busy.current) return false;
    if (
      !files.every(Boolean) ||
      fileErrors.some(Boolean) ||
      !applicant.program.trim() ||
      !consent
    ) {
      setError({
        message:
          "Add both supported documents, enter the intended program and acknowledge the privacy notice.",
      });
      return false;
    }
    busy.current = true;
    setProcessing(true);
    setError(null);
    setStage(0);
    const id = crypto.randomUUID();
    current.current = id;
    const rev = revisionRef.current;
    const form = new FormData();
    files.forEach((file, i) =>
      form.append(i === 0 ? "documentA" : "documentB", file!),
    );
    form.append(
      "context",
      JSON.stringify({
        ...applicant,
        program: applicant.program.trim(),
        intake: applicant.intake.trim() || "Not sure",
        category: applicant.category.trim() || "Not sure",
      }),
    );
    form.append("inputRevision", String(rev));
    form.append("requestId", id);
    form.append("privacyAcknowledged", "true");
    if (
      new Blob(
        Array.from(form.values()).map((v) => (typeof v === "string" ? v : v)),
      ).size >
      LIMITS.bodyBytes - 10_000
    ) {
      setError({
        message: "The combined upload is too large. Choose smaller documents.",
      });
      busy.current = false;
      setProcessing(false);
      return false;
    }
    let completed = false,
      terminal = false;
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        body: form,
        cache: "no-store",
      });
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.message || "The upload could not be processed.");
      }
      if (!response.body)
        throw new Error("The analysis connection could not be opened.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      function apply(e: Event) {
        if (
          e.requestId !== current.current ||
          e.revision !== revisionRef.current
        )
          return;
        if (e.type === "stage") setStage(e.stage);
        if (e.type === "sources") {
          if (
            e.sources.length !== 2 ||
            e.sources.some((s) => !s.pages.length || !s.passages.length)
          )
            throw new Error("The full source transfer was incomplete.");
          setSources(e.sources);
          latestSources.current = e.sources;
          setSourceRevision(rev);
        }
        if (e.type === "result") {
          if (e.report.revision !== rev)
            throw new Error("The report belongs to older inputs.");
          setReport(e.report);
          setReportSources(latestSources.current);
          setReviews({});
          completed = true;
          terminal = true;
        }
        if (e.type === "error") {
          setError(e);
          terminal = true;
        }
      }
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) apply(JSON.parse(line));
        if (done) break;
      }
      if (buffer.trim() || !terminal)
        throw new Error(
          "The connection ended before analysis completed. Your inputs are retained; please retry.",
        );
    } catch (e) {
      setError({
        message:
          e instanceof Error
            ? e.message
            : "The comparison could not be completed. Your inputs are retained.",
      });
    } finally {
      busy.current = false;
      setProcessing(false);
      setStage(-1);
    }
    return completed;
  }
  const review = (findingId: string, value: Review) => {
    if (report?.revision !== revision) return;
    setReviews((r) => ({ ...r, [`${report.id}:${findingId}`]: value }));
  };
  const reviewOf = (findingId: string): Review =>
    reviews[`${report?.id}:${findingId}`] ?? "Pending";
  return {
    reportSources,
    files,
    fileErrors,
    setFile,
    applicant,
    setField,
    consent,
    setConsent,
    revision,
    sources,
    sourceRevision,
    report,
    processing,
    stage,
    error,
    compare,
    review,
    reviewOf,
    activeSource,
    setActiveSource,
    outdated: !!report && report.revision !== revision,
  };
}
type Work = ReturnType<typeof useWork>;
const Context = createContext<Work | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const work = useWork();
  return <Context.Provider value={work}>{children}</Context.Provider>;
}
export function useSession() {
  const s = useContext(Context);
  if (!s) throw Error("Session provider is required");
  return s;
}
