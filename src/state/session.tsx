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
  Applicability,
  Event,
  Report,
  ProviderProgress,
  Review,
  Source,
} from "@/shared/contracts";
import { LIMITS } from "@/shared/limits";
import { canReveal } from "@/shared/applicability";
type WorkError = {
  message: string;
  code?: string;
  diagnosticCode?: string;
  retryAfter?: number;
  analysisFailed?: boolean;
};
function useWork() {
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const builtInFiles = useRef<File[] | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>(["", ""]);
  const [applicant, setApplicant] = useState<
    Omit<Applicant, "degree"> & { degree: Applicant["degree"] | "" }
  >({
    degree: "",
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
  const [pendingReport, setPendingReport] = useState<Report | null>(null);
  const [applicability, setApplicability] = useState<Applicability | null>(
    null,
  );
  const [degreeAcknowledged, setDegreeAcknowledged] = useState(false);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [processing, setProcessing] = useState(false);
  const busy = useRef(false);
  const [stage, setStage] = useState(-1);
  const [providerProgress, setProviderProgress] = useState<ProviderProgress | null>(null);
  const [error, setError] = useState<WorkError | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const current = useRef("");
  const [activeSource, setActiveSource] = useState("A");
  const change = () => {
    revisionRef.current++;
    setRevision(revisionRef.current);
    setError(null);
    setInfo(null);
    setPendingReport(null);
    setApplicability(null);
    setDegreeAcknowledged(false);
    setReviews({});
  };
  const setField = (key: keyof Applicant, value: string) => {
    if (key === "degree" && !["", "Bachelor's", "Master's"].includes(value))
      return;
    change();
    setApplicant((a) => ({ ...a, [key]: value }));
  };
  const setFile = (index: number, file: File | null, error = "") => {
    builtInFiles.current = null;
    change();
    setFiles((f) => f.map((v, i) => (i === index ? file : v)));
    setFileErrors((f) => f.map((v, i) => (i === index ? error : v)));
  };
  async function compare(example?: { files: File[]; applicant: Applicant }) {
    if (busy.current) return false;
    // Use the same snapshot for the form and request; React state updates are batched.
    const inputFiles = example?.files ?? files;
    const inputApplicant = example?.applicant ?? applicant;
    const inputConsent = example ? true : consent;
    const builtInExample = !!example || (!!builtInFiles.current &&
      inputFiles.every((file, i) => file === builtInFiles.current![i]));
    if (example) {
      builtInFiles.current = inputFiles as File[];
      change();
      setFiles(inputFiles);
      setFileErrors(["", ""]);
      setApplicant(inputApplicant);
      setConsent(true);
    }
    if (
      !inputFiles.every(Boolean) ||
      !inputApplicant.degree ||
      (!example && fileErrors.some(Boolean)) ||
      !inputApplicant.program.trim() ||
      !inputConsent
    ) {
      setError({
        message:
          "Select a degree, add both supported documents, enter the intended program and acknowledge the privacy notice.",
      });
      return false;
    }
    busy.current = true;
    setProcessing(true);
    setError(null);
    setInfo(null);
    setDegreeAcknowledged(false);
    setStage(0);
    setProviderProgress(null);
    const id = crypto.randomUUID();
    current.current = id;
    const rev = revisionRef.current;
    const form = new FormData();
    if (builtInExample) form.append("exampleOrigin", "built-in-synthetic");
    inputFiles.forEach((file, i) =>
      form.append(i === 0 ? "documentA" : "documentB", file!),
    );
    form.append(
      "context",
      JSON.stringify({
        ...inputApplicant,
        program: inputApplicant.program.trim(),
        intake: inputApplicant.intake.trim() || "Not sure",
        category: inputApplicant.category.trim() || "Not sure",
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
    let terminal = false;
    const completion: {
      event: Extract<Event, { type: "result" | "applicability" }> | null;
    } = { event: null };
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
        if (terminal)
          throw new Error(
            "The response contained conflicting completion events. No new report was created.",
          );
        if (e.type === "stage") {
          setStage(e.stage);
          setProviderProgress(null);
        }
        if (e.type === "provider_progress") setProviderProgress(e.progress);
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
          if (
            !e.report.applicability ||
            e.report.applicability.assessments.length !== 2
          )
            throw new Error(
              "The document degree assessments were incomplete. No findings were opened.",
            );
          completion.event = e;
          terminal = true;
        }
        if (e.type === "applicability") {
          completion.event = e;
          terminal = true;
        }
        if (e.type === "error") {
          setError({ ...e, analysisFailed: true });
          terminal = true;
        }
        if (e.type === "info") {
          setInfo(e.message);
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
      // Commit only after a clean terminal transfer. A trailing/truncated frame
      // must never leave a revealable report behind an error message.
      if (
        completion.event &&
        current.current === id &&
        revisionRef.current === rev
      ) {
        const outcome = completion.event;
        if (
          example &&
          outcome.type === "result" &&
          canReveal(outcome.report.applicability, false)
        ) {
          setReport(outcome.report);
          setReportSources(latestSources.current);
          setPendingReport(null);
          setApplicability(outcome.report.applicability);
          setReviews({});
          return true;
        }
        setPendingReport(outcome.type === "result" ? outcome.report : null);
        setApplicability(
          outcome.type === "result"
            ? outcome.report.applicability
            : outcome.applicability,
        );
        setReport(null);
        setReviews({});
        setDegreeAcknowledged(false);
      }
    } catch (e) {
      setError({
        analysisFailed: true,
        message:
          e instanceof Error
            ? e.message
            : "The comparison could not be completed. Your inputs are retained.",
      });
    } finally {
      busy.current = false;
      setProcessing(false);
      setStage(-1);
      setProviderProgress(null);
    }
    return false;
  }
  function revealComparison() {
    if (
      processing ||
      !pendingReport ||
      pendingReport.revision !== revisionRef.current ||
      !canReveal(pendingReport.applicability, degreeAcknowledged)
    )
      return false;
    setReport(pendingReport);
    setReportSources(latestSources.current);
    setPendingReport(null);
    setReviews({});
    return true;
  }
  const review = (findingId: string, value: Review) => {
    if (report?.revision !== revision) return;
    setReviews((r) => ({ ...r, [`${report.id}:${findingId}`]: value }));
  };
  const reviewOf = (findingId: string): Review =>
    reviews[`${report?.id}:${findingId}`] ?? "Pending";
  return {
    reportSources,
    applicability,
    degreeAcknowledged,
    setDegreeAcknowledged,
    revealComparison,
    hasPendingComparison: !!pendingReport,
    files,
    fileErrors,
    setFile,
    markBuiltInFiles: (sampleFiles: File[]) => { builtInFiles.current = sampleFiles; },
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
    providerProgress,
    error,
    info,
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
