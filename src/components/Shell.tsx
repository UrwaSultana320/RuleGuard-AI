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
          <span className="brandmark">
            <Icon name="shield" size={25} />
          </span>
          <span>
            RuleGuard<span className="brand-ai"> AI</span>
            <small>CONTEXT. EVIDENCE. CLARITY.</small>
          </span>
        </Link>
        <span className="header-note">
          <span className="dot" />
          Evidence-led. Human-reviewed.
        </span>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="nav-label">YOUR WORKSPACE</div>
          <nav aria-label="Workspace">
            <Link
              className={path === "/" ? "nav-item selected" : "nav-item"}
              href="/"
            >
              <Icon name="file" />
              Compare documents<small>01</small>
            </Link>
            {s.report ? (
              <Link
                className={
                  path === "/results" ? "nav-item selected" : "nav-item"
                }
                href="/results"
              >
                <Icon name="spark" />
                Findings<small>02</small>
              </Link>
            ) : (
              <span className="nav-item unavailable">
                <Icon name="spark" />
                Findings<small>02</small>
              </span>
            )}
          </nav>
          <div className="sidebar-guide">
            <Icon name="shield" size={27} />
            <h3>Evidence before assumptions.</h3>
            <p>
              Two sources. Your context. Preliminary findings you can inspect
              and review.
            </p>
            <span className="subtle-label">BUILT FOR A CAREFUL NEXT STEP</span>
          </div>
          <div className="session-note">
            <Icon name="clock" />
            <p>
              <strong>Temporary session</strong>
              <br />
              Refreshing or closing this page clears all your work.
            </p>
          </div>
        </aside>
        <main id="main">{children}</main>
      </div>
      <footer className="app-footer">
        <span>RuleGuard AI · An independent admissions research tool</span>
        <span>Preliminary findings. Official confirmation matters.</span>
      </footer>
    </>
  );
}
