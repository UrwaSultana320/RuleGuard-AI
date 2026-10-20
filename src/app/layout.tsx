import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionProvider } from "@/state/session";
import { Shell } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "RuleGuard AI — Context. Evidence. Clarity.",
  description:
    "Compare English-language admission requirements with traceable evidence and human review.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SessionProvider>
          <Shell>{children}</Shell>
        </SessionProvider>
      </body>
    </html>
  );
}
