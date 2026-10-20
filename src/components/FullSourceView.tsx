"use client";
import { useSession } from "@/state/session";
import { Icon } from "./Icons";
export function FullSourceView({ forReport = false }: { forReport?: boolean }) {
  const s = useSession();
  const sources = forReport ? s.reportSources : s.sources;
  if (!sources.length) return null;
  const source = sources.find((d) => d.id === s.activeSource) ?? sources[0];
  return (
    <section className="panel sources" id="sources">
      <div className="section-heading">
        <span className="section-icon">
          <Icon name="eye" />
        </span>
        <div>
          <h2>Full extracted sources</h2>
          <p>Including passages the AI did not cite.</p>
        </div>
        {(forReport ? s.report?.revision : s.sourceRevision) !== s.revision && (
          <span className="tag warning">Outdated sources</span>
        )}
      </div>
      <p className="source-disclaimer">
        This is the extracted text, not the original PDF layout. Extraction may
        lose wording, ordering or conditions. Review the original document when
        in doubt. Source matching does not verify AI reasoning.
      </p>
      <div className="source-tabs" role="group" aria-label="Choose source">
        {sources.map((d) => (
          <button
            key={d.id}
            className={d.id === source.id ? "active" : ""}
            aria-pressed={d.id === source.id}
            onClick={() => s.setActiveSource(d.id)}
          >
            <Icon name="file" />
            Document {d.id}
            <small>{d.name}</small>
          </button>
        ))}
      </div>
      <div className="source-toolbar">
        <span>
          {source.kind === "PDF"
            ? `${source.pages.length} PDF pages`
            : "TXT · line references"}
        </span>
        <span>{source.passages.length} source passages</span>
      </div>
      <div className="source-scroll">
        {source.pages.map((page) => (
          <section key={page.number} className="source-page">
            <h3>
              {source.kind === "PDF" ? `PDF page ${page.number}` : source.name}
            </h3>
            {source.passages
              .filter((p) => source.kind === "TXT" || p.page === page.number)
              .map((p) => (
                <div className="passage" key={p.id} id={p.id}>
                  <span className="passage-id">
                    {p.id}
                    {source.kind === "TXT"
                      ? ` · Lines ${p.lineStart}–${p.lineEnd}`
                      : ""}
                  </span>
                  <pre>{p.text}</pre>
                </div>
              ))}
          </section>
        ))}
      </div>
    </section>
  );
}
