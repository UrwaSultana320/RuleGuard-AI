"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/state/session";
import { Icon } from "./Icons";
export function Shell({ children }: { children: ReactNode }) {
  const s = useSession();
  const path = usePathname();
  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brandmark" aria-hidden="true">
            r<span>g</span>
          </span>
          <span>
            RuleGuard<span className="brand-ai"> AI</span>
          </span>
        </Link>
        <nav aria-label="Workspace">
          <Link
            className={path === "/" ? "nav-item selected" : "nav-item"}
            aria-current={path === "/" ? "page" : undefined}
            href="/"
          >
            Compare
          </Link>
          {s.report ? (
            <Link
              className={path === "/results" ? "nav-item selected" : "nav-item"}
              href="/results"
              aria-current={path === "/results" ? "page" : undefined}
            >
              Findings
            </Link>
          ) : (
            <span className="nav-item unavailable" aria-disabled="true">
              Findings
            </span>
          )}
        </nav>
        <span className="header-note">An informed next step.</span>
      </header>
      <div className="session-strip">
        <Icon name="clock" />
        <p>
          <strong>Just this session.</strong> Refreshing or closing this page
          clears all your work.
        </p>
      </div>
      <div className="workspace">
        <main id="main">{children}</main>
      </div>
      <footer className="app-footer">
        <span>RuleGuard AI · An independent admissions research tool</span>
        <span>Preliminary findings. Official confirmation matters.</span>
      </footer>
    </>
  );
}
