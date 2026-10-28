# Document export

[`export.py`](export.py) turns any architecture document (`docs/architecture/**/*.md`:
designs, ADRs, outlines, threat models, guidelines, research briefs) into HTML, PDF and
DOCX, with every diagram rendered. It is optional. The architects write Markdown either
way, and nothing else in the kit needs it.

Exports go to `docs/architecture/exports/`, which mirrors the source tree, so relative
links between documents keep working and no export ever lands beside a source where it
could be mistaken for one. The first time the exporter writes there it adds a
`.gitignore` to that folder, so an export is never committed and your own `.gitignore`
is left alone.

## Diagram as code, or no diagram

There is no hand drawn SVG in an export. A drawing is one of two things.

1. **A ```mermaid block in the Markdown.** Rendered to SVG by
   [mermaid-cli](https://github.com/mermaid-js/mermaid-cli), pinned to one exact version,
   and inlined. Give it an `%% id:` and a `%% caption:` comment and the export labels it.
2. **A view your diagram pipeline rendered** (`diagrams.pipeline` in the profile, if you
   have one). Reference its rendered SVG as an image and the export inlines it with its
   caption:

   ```markdown
   ![PV-08: Order checkout](../../landscapes/app/svg/pv-08-order-checkout.svg)
   ```

A diagram that will not render fails the export. A document never goes out with a code
fence where a picture belongs, and never with a figure silently missing.

## What it needs

HTML needs nothing but Python 3.9 or newer: `export.py` uses the standard library only.
Everything else is optional, and each format is produced if its tools are present.

| Format | Needs | Without it |
|---|---|---|
| HTML | Python 3.9+ | always works, if the document has no mermaid block |
| HTML with mermaid diagrams | Node 20 or newer, for `npx` | the export fails and names the install, rather than dropping the diagram |
| PDF | `weasyprint`, or Google Chrome or Chromium | the export fails and names the install; HTML and DOCX are still written |
| DOCX | `pandoc`, plus `rsvg-convert` for the diagrams | the export fails and names the install; HTML and PDF are still written |
| `--check` | `npx`, only if a document has a mermaid block | fails, so CI must have Node |

The first mermaid render downloads mermaid-cli and the headless Chrome it drives
(Puppeteer) through `npx`. That is a few hundred megabytes, it needs the network once, and
it is cached after that. Nothing is installed globally.

On macOS:

```bash
brew install node pandoc weasyprint librsvg
```

On Debian or Ubuntu (Node from [nodejs.org](https://nodejs.org) or your version manager,
since the distribution's Node is often older than 20):

```bash
sudo apt install pandoc weasyprint librsvg2-bin
```

If Chrome or Chromium is on the machine, PDF works without `weasyprint`: the exporter
drives it headless instead. On Windows, run it in WSL.

## Commands

```bash
# one document, HTML (the default)
python3 docs/architecture/tools/export.py docs/architecture/designs/solutions/<project>/hld.md

# one document, every format
python3 docs/architecture/tools/export.py docs/architecture/designs/solutions/<project>/hld.md --to html,pdf,docx

# a whole folder, recursively
python3 docs/architecture/tools/export.py docs/architecture/designs --to html,pdf

# every architecture document
python3 docs/architecture/tools/export.py --all --to html

# validate without exporting: this is what CI runs
python3 docs/architecture/tools/export.py --all --check

# what this machine can produce right now
python3 docs/architecture/tools/export.py --tools
```

Other options: `--out DIR` to export somewhere else, `-q` to quieten progress, and
`--ban-em-dash` to make `--check` fail on an em dash, for teams whose style rules ban
them.

## `--check`

`--check` writes no export and exits non-zero if any document would fail to export. It
keeps only its diagram cache, in `exports/_diagrams/`. It checks that

- every ```mermaid block parses (mermaid-cli renders it for real),
- every referenced image exists,
- with `--ban-em-dash`, the document holds no em dash.

It also prints warnings, which do not fail the run: a code fence that looks like a hand
drawn diagram, a mermaid diagram too tall to print well, a dead relative link, a document
with no title.

The [`Architecture documents`](../../../.github/workflows/architecture-docs.yml) workflow
runs `--all --check` on every pull request that touches `docs/architecture/`. When the `CI`
environment variable is set, as it is on GitHub Actions, the headless Chrome runs without
its sandbox, because hosted runners do not allow it.

## Conventions a document can use

| In the document | What the export does |
|---|---|
| Flat front matter (`title:`, `status:`, `template:`, ...) | kept, as a metadata table under the title |
| `%% caption: ...` inside a mermaid block | the figure's caption (mermaid treats `%%` as a comment, so the block still renders on GitHub) |
| `%% id: FIG-1` inside a mermaid block | the figure's label, shown in bold before the caption |
| `![PV-08: Order checkout](...)` | an `ID: text` alt is split into a bold label and a caption |
| `[the guide](../standards/guidelines/testing.md)` | points at the exported sibling when that document is exported too, and at the repo file otherwise |
| a Markdown table, including the `\| \| \|` document-control sheet | a table, with the sheet styled as a two-column control table |

## Style

The colors are tokens at the top of `export.py` (`TOKENS`); change them to your brand.
Fonts are system fonts, so an exported page makes no network request. To put your logo
above every title, save it as an HTML fragment (an `<img>` with a data URI, or an inline
`<svg>`) in `docs/architecture/tools/brand.html`. The eyebrow line names `project.name`
from the profile. Light only, because an export is read on paper or in a reader that has
no theme to follow. Print rules keep headings with their sections, tables and figures
whole, and scale a tall diagram to one page.

PDF is printed from the exporter's own HTML, so it keeps the same look: `weasyprint`
first, then headless Chrome. DOCX goes through pandoc, which reads the same HTML and gets
PNG copies of the diagrams, because an inline SVG does not survive the DOCX writer.

## Rules

- `export.py` imports nothing outside the Python standard library, so HTML always works.
- Never commit an export. The Markdown is the source; the export is a copy of it.
