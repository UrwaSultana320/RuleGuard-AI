# Third-party software and source documents

The root MIT license covers original RuleGuard AI code and documentation. It does
not relicense dependencies, university publications, provider services or trademarks.

## Direct runtime dependencies

- Next.js 16.4.2, React 19.3.1, React DOM 19.3.1 and Zod 4.6.6: MIT.
- PDF.js (`pdfjs-dist` 6.4.299): Apache-2.0.

`npm ci` runs `scripts/copy-pdf-worker.mjs`, which distributes the PDF.js worker
alongside its complete LICENSE and notices for Next.js, React, React DOM, SWC
helpers, PDF.js, Zod and caniuse-lite at `/licenses/`. Keep those generated notices with browser
distributions. Installed packages retain their own license files.

The lockfile inventory, including optional platform variants and development
tools, is [devpost/release/dependency-licenses.json](devpost/release/dependency-licenses.json).
It records package metadata, not a legal determination. Optional Sharp binary
packages declare `Apache-2.0 AND LGPL-3.0-or-later`; their bundled native components
retain separate obligations. This app has no image-optimization feature and does
not modify native libraries. Do not describe the complete dependency graph as MIT.
If redistributing native binaries outside normal npm/Vercel installation, preserve
the package notices and corresponding source/relinking information required by the
supplied licenses. The release trace check reports the actual Function files.

`caniuse-lite` compatibility data is CC-BY-4.0, from the
[caniuse-lite project](https://github.com/browserslist/caniuse-lite) and its upstream
[Can I use data](https://github.com/Fyrd/caniuse); preserve its supplied attribution
and license when redistributing that data. No upstream data changes are made here.
Development dependencies also include MPL-2.0 (axe-core/lightningcss), Python-2.0
and BlueOak-1.0.0 components. No vendor source is modified by this release.

## Documents and examples

Bundled TXT examples are clearly labeled synthetic test material. They are not
university policies or admissions advice. Real university PDFs are not bundled:
official download links and provenance notes are in `public/samples/README.txt`.
Public availability does not transfer copyright or imply university endorsement.
Keep research copies, private applicant documents and full model responses out of Git.

## Development tools

The project used Codex and the [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics)
for planning and implementation guidance. Skill sources and the personal learner
profile are excluded from publication. Standard open-source frameworks and tools
are disclosed in `package.json`, the lockfile and the inventory above.
