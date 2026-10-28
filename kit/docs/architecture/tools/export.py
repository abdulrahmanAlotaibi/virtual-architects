#!/usr/bin/env python3
"""Export an architecture document to HTML, PDF and DOCX.

    python3 docs/architecture/tools/export.py <doc.md>                  HTML (the default)
    python3 docs/architecture/tools/export.py <doc.md> --to html,pdf,docx
    python3 docs/architecture/tools/export.py <folder> --to html        every .md under it
    python3 docs/architecture/tools/export.py --all --to html           every architecture doc
    python3 docs/architecture/tools/export.py <doc.md> --check          validate, write nothing
    python3 docs/architecture/tools/export.py --tools                   what is installed

Output goes to docs/architecture/exports/, mirroring the source path under
docs/architecture/, so relative links between documents keep working and no export ever
lands beside a source where it could be mistaken for one. The exporter puts a .gitignore
in that folder the first time it writes there, so an export is never committed.

Diagram as code only. A ```mermaid fence is rendered to SVG by mermaid-cli and inlined; an
image that points at an SVG your diagram pipeline rendered is inlined with its caption. A
diagram that cannot be rendered fails the export: no document goes out with a code fence
where a picture belongs.

Standard library only, so HTML needs nothing installed (the front matter here is flat
`key: value`, so PyYAML is not needed either). Optional, each reported when missing:
npx from Node 20 or newer (mermaid rendering), pandoc (DOCX), weasyprint or Chrome or
Chromium (PDF), rsvg-convert (the raster copies of diagrams that DOCX needs). Python 3.9 or
newer.
"""
import argparse
import base64
import hashlib
import html
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from datetime import date
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
ARCH = TOOLS.parent
REPO = next((p for p in ARCH.parents if (p / ".git").exists()), ARCH.parent.parent)
PROFILE = ARCH / "project.yaml"
# Optional: an HTML fragment (say, your logo as an <img> or inline <svg>) shown above the
# title of every export. Leave the file out and the header has no logo.
BRAND = TOOLS / "brand.html"
EXPORTS = ARCH / "exports"
CACHE = "_diagrams"

# mermaid-cli, pinned exactly. Run through npx so nothing has to be installed globally.
MERMAID = "@mermaid-js/mermaid-cli@11.17.0"
FORMATS = ("html", "pdf", "docx")
EXT = {"pandoc": "docx"}        # the pandoc pass renders HTML, but its output is a .docx
INSTALL = {
    "npx": "npx ships with Node 20 or newer (macOS `brew install node`, or nodejs.org)",
    "pandoc": "macOS `brew install pandoc`, Debian or Ubuntu `sudo apt install pandoc`",
    "weasyprint": "macOS `brew install weasyprint`, Debian or Ubuntu `sudo apt install weasyprint`",
    "rsvg-convert": "macOS `brew install librsvg`, Debian or Ubuntu `sudo apt install librsvg2-bin`",
}
# The look of an export. Change these to your brand. System fonts only, so an exported
# page makes no network request. Light only: an export is read on paper or in a reader
# that has no theme to follow.
TOKENS = {
    "bg": "#f6f6fa", "surface": "#ffffff", "fg": "#1c1d2b", "muted": "#5c5f76",
    "line": "#d4d5e2", "accent": "#4f46e5", "accent-soft": "#ecebfd", "warn": "#b42318",
    "note": "#f7f6ee", "ok": "#067647",
    "font-body": 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    "font-mono": 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
}
# Mermaid theme, so a rendered diagram reads like the rest of the page. htmlLabels must
# stay false: librsvg does not render foreignObject, so HTML labels vanish from PNG and PDF.
MERMAID_CONFIG = {
    "theme": "base",
    "themeVariables": {
        "fontFamily": TOKENS["font-body"], "fontSize": "15px",
        "primaryColor": TOKENS["accent-soft"], "primaryTextColor": TOKENS["fg"],
        "primaryBorderColor": TOKENS["accent"], "secondaryColor": TOKENS["surface"],
        "tertiaryColor": TOKENS["note"], "lineColor": TOKENS["muted"],
        "textColor": TOKENS["fg"], "mainBkg": TOKENS["surface"],
        "nodeBorder": TOKENS["accent"], "clusterBkg": TOKENS["bg"],
        "clusterBorder": TOKENS["line"], "edgeLabelBackground": TOKENS["surface"],
    },
    "htmlLabels": False,
    "flowchart": {"htmlLabels": False, "useMaxWidth": True, "curve": "linear"},
    "sequence": {"useMaxWidth": True},
    "themeCSS": ".edgeLabel rect { fill: #ffffff; } .nodeLabel, .edgeLabel { font-weight: 500; }",
}


# ─── small helpers ───────────────────────────────────────────────────────────

def sha(*parts):
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode() if isinstance(p, str) else p)
    return h.hexdigest()[:16]


def rel(path):
    """A path as the repo shows it, for messages."""
    try:
        return str(Path(path).resolve().relative_to(REPO))
    except ValueError:
        return str(path)


def slug(text):
    """GitHub's heading anchor: lowercase, punctuation dropped, spaces to hyphens."""
    text = unicodedata.normalize("NFKD", str(text)).lower()
    text = re.sub(r"[^\w\s\-\u0600-\u06ff]", "", text)
    return re.sub(r"[\s\-]+", "-", text).strip("-")


def have(cmd):
    return shutil.which(cmd)


def chrome():
    """Headless Chrome or Chromium, as a PDF engine when weasyprint is not installed."""
    for c in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        if have(c):
            return have(c)
    for app in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Applications/Chromium.app/Contents/MacOS/Chromium",
                str(Path.home()) + "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"):
        if Path(app).exists():
            return app
    return None


class ExportError(Exception):
    """Something the author has to fix in the document, or a tool to install."""


# ─── source: front matter, comments, em dashes ───────────────────────────────

FENCE_RE = re.compile(r"^(\s*)(```+|~~~+)\s*([^\s`]*)\s*$")
FM_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.S)


def read_source(path):
    """Return (front matter dict, body lines). Front matter here is flat `key: value`."""
    text = Path(path).read_text(encoding="utf-8")
    front = {}
    m = FM_RE.match(text)
    if m:
        for line in m.group(1).splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            key, _, value = line.partition(":")
            front[key.strip()] = value.strip().strip("'\"")
        text = text[m.end():]
    lines = strip_comments(text).replace("\r\n", "\n").split("\n")
    while lines and (not lines[0].strip() or is_hr(lines[0])):
        lines.pop(0)   # the templates separate their instructions from the body with a rule
    return front, lines


def strip_comments(text):
    """Drop HTML comments, which the templates use for their fill-in instructions.
    Fenced code is left alone, so a comment inside an example survives."""
    out, in_fence, fence, in_comment = [], False, "", False
    for line in text.replace("\r\n", "\n").split("\n"):
        m = FENCE_RE.match(line)
        if in_fence:
            out.append(line)
            if m and m.group(2)[0] == fence[0] and len(m.group(2)) >= len(fence):
                in_fence = False
            continue
        if m and not in_comment:
            in_fence, fence = True, m.group(2)
            out.append(line)
            continue
        if in_comment:
            end = line.find("-->")
            if end < 0:
                continue
            line, in_comment = line[end + 3:], False
        line = re.sub(r"<!--.*?-->", "", line)
        if "<!--" in line:
            line, in_comment = line[:line.index("<!--")], True
        out.append(line)
    return "\n".join(out)


def em_dashes(path):
    """Line numbers holding an em dash, for teams whose rules ban them (--ban-em-dash)."""
    text = Path(path).read_text(encoding="utf-8")
    return [i for i, line in enumerate(text.splitlines(), 1) if "\u2014" in line]


# ─── diagrams ────────────────────────────────────────────────────────────────

class Diagrams:
    """Renders and caches the diagrams of a run. One cache dir for every document, keyed by
    the diagram source, so a second run and a second format cost nothing."""

    def __init__(self, out_root, quiet=False):
        self.dir = Path(out_root) / CACHE
        self.quiet = quiet
        self.rendered = 0

    def mermaid(self, code):
        """Render one mermaid block to an SVG file and return (path, svg id)."""
        key = sha(code, json.dumps(MERMAID_CONFIG, sort_keys=True), MERMAID)
        svg_id = "mmd-" + key
        target = self.dir / f"mermaid-{key}.svg"
        if target.exists():
            return target, svg_id
        if not have("npx"):
            raise ExportError(
                "a mermaid diagram needs mermaid-cli, and npx was not found. "
                f"Install Node ({INSTALL['npx']}); the exporter then runs "
                f"`npx -y {MERMAID}` with no global install.")
        self.dir.mkdir(parents=True, exist_ok=True)
        src = self.dir / f"mermaid-{key}.mmd"
        cfg = self.dir / "mermaid-config.json"
        src.write_text(code if code.endswith("\n") else code + "\n", encoding="utf-8")
        cfg.write_text(json.dumps(MERMAID_CONFIG, indent=2), encoding="utf-8")
        if not self.quiet:
            print(f"  rendering mermaid diagram {key}", file=sys.stderr)
        cmd = ["npx", "-y", MERMAID, "-i", str(src), "-o", str(target), "-c", str(cfg),
               "-I", svg_id, "-b", "white", "-q"]
        if os.environ.get("CI"):
            # Hosted CI runners block Chrome's sandbox (unprivileged user namespaces), so
            # the headless browser mermaid-cli drives has to run without it there.
            pup = self.dir / "puppeteer-config.json"
            pup.write_text(json.dumps({"args": ["--no-sandbox"]}), encoding="utf-8")
            cmd += ["-p", str(pup)]
        run = subprocess.run(
            cmd,
            capture_output=True, text=True,
            env=dict(os.environ, PUPPETEER_DISABLE_HEADLESS_WARNING="true"))
        if run.returncode != 0 or not target.exists():
            # Keep mermaid's own message; drop puppeteer's stack, which helps nobody.
            detail = [l for l in (run.stderr or run.stdout or "").strip().splitlines()
                      if not re.match(r"\s*at ", l) and "node_modules" not in l]
            raise ExportError("mermaid could not parse this diagram:\n      "
                              + "\n      ".join(detail[:6] or ["no output from mermaid-cli"]))
        target.write_text(inline_svg(target), encoding="utf-8")   # sized, and spaces kept
        self.rendered += 1
        return target, svg_id

    def raster(self, svg_path):
        """A PNG of an SVG, for DOCX. Prefers a PNG your diagram pipeline already rendered
        beside it (an svg/ folder with a png/ sibling), so a view keeps its committed export."""
        svg_path = Path(svg_path)
        sibling = svg_path.parent.parent / "png" / (svg_path.stem + ".png")
        if svg_path.parent.name == "svg" and sibling.exists():
            return sibling
        target = self.dir / (svg_path.stem + ".png")
        if target.exists() and target.stat().st_mtime >= svg_path.stat().st_mtime:
            return target
        if not have("rsvg-convert"):
            raise ExportError("a diagram has to become a PNG for this format, and "
                              f"rsvg-convert was not found. Install it: {INSTALL['rsvg-convert']}")
        self.dir.mkdir(parents=True, exist_ok=True)
        subprocess.run(["rsvg-convert", "-z", "2", "-b", "white", "-o", str(target), str(svg_path)],
                       check=True)
        return target


VIEWBOX_RE = re.compile(r'viewBox="\s*([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)\s*"')


def svg_size(markup):
    """The drawing's width and height from its viewBox, or None."""
    m = VIEWBOX_RE.search(markup)
    return (float(m.group(3)), float(m.group(4))) if m else None


def inline_svg(path, class_=""):
    """An SVG file as markup that can sit in a single-file HTML page.

    mermaid writes `width="100%"` and an inline `max-width`, which gives the element no
    intrinsic size: it then prints as an empty box. Replace both with the viewBox size and
    let the stylesheet scale it. `xml:space` keeps the spaces between a label's words,
    which librsvg otherwise collapses, so PNG and PDF read the same as the page.
    """
    svg = Path(path).read_text(encoding="utf-8")
    svg = re.sub(r"<\?xml[^>]*\?>\s*", "", svg)
    svg = re.sub(r"<!DOCTYPE[^>]*>\s*", "", svg, flags=re.I)
    head = svg[:svg.index(">") + 1]
    attrs = dict(re.findall(r'([\w:.\-]+)="([^"]*)"', head))
    size = svg_size(head)
    for drop in ("width", "height", "style"):
        attrs.pop(drop, None)
    if size:
        attrs["width"] = f"{size[0]:.0f}"
        attrs["height"] = f"{size[1]:.0f}"
        attrs.setdefault("preserveAspectRatio", "xMidYMid meet")
    attrs.setdefault("role", "img")
    if class_:
        attrs["class"] = " ".join(filter(None, [class_, attrs.get("class", "")]))
    svg = "<svg " + " ".join(f'{k}="{v}"' for k, v in attrs.items()) + ">" + svg[len(head):]
    return re.sub(r"<text(?![\w-])(?![^>]*xml:space)", '<text xml:space="preserve"', svg)


def data_uri(path):
    kind = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return f"data:{kind};base64," + base64.b64encode(Path(path).read_bytes()).decode()


# ─── markdown: inline ────────────────────────────────────────────────────────

CODE_RE = re.compile(r"(`+)(.+?)\1", re.S)
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+\"([^\"]*)\")?\s*\)")
LINK_RE = re.compile(r"\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+\"([^\"]*)\")?\s*\)")
AUTOLINK_RE = re.compile(r"&lt;((?:https?|mailto):[^\s<>]+)&gt;")
SAFE_SCHEME_RE = re.compile(r"^(?:https?|mailto):", re.I)
BOLD_RE = re.compile(r"(?<!\w)\*\*(\S(?:.*?\S)?)\*\*(?!\w)|(?<!\w)__(\S(?:.*?\S)?)__(?!\w)", re.S)
EM_RE = re.compile(r"(?<![\w*])\*(\S(?:[^*]*?\S)?)\*(?![\w*])|(?<![\w_])_(\S(?:[^_]*?\S)?)_(?![\w_])", re.S)
DEL_RE = re.compile(r"~~(\S(?:.*?\S)?)~~", re.S)
ESCAPABLE = set("\\`*_{}[]()#+-.!|<>~\"'")


class Shelf:
    """Holds finished markup out of the way of the next inline pass."""

    def __init__(self):
        self.items = []

    def put(self, markup):
        self.items.append(markup)
        return f"\x00{len(self.items) - 1}\x00"

    def restore(self, text):
        return re.sub(r"\x00(\d+)\x00", lambda m: self.items[int(m.group(1))], text)


def inline(text, ctx):
    """Inline markdown: code, images, links, bold, emphasis, strikethrough, escapes."""
    shelf = Shelf()
    text = CODE_RE.sub(
        lambda m: shelf.put(f"<code>{html.escape(m.group(2).strip(), quote=False)}</code>"), text)
    text = re.sub(r"\\(.)", lambda m: shelf.put(html.escape(m.group(1), quote=False))
                  if m.group(1) in ESCAPABLE else m.group(0), text)
    text = html.escape(text, quote=False)
    text = IMAGE_RE.sub(lambda m: shelf.put(ctx.image(m.group(2), m.group(1), inline=True)), text)
    text = LINK_RE.sub(lambda m: shelf.put(ctx.anchor(m.group(2), shelf.restore(m.group(1)), m.group(3))), text)
    text = AUTOLINK_RE.sub(lambda m: shelf.put(ctx.anchor(m.group(1), m.group(1), None)), text)
    text = BOLD_RE.sub(lambda m: f"<strong>{m.group(1) or m.group(2)}</strong>", text)
    text = EM_RE.sub(lambda m: f"<em>{m.group(1) or m.group(2)}</em>", text)
    text = DEL_RE.sub(r"<del>\1</del>", text)
    return shelf.restore(text)


# ─── markdown: blocks ────────────────────────────────────────────────────────

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
HR_RE = re.compile(r"^ {0,3}((?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$")
LIST_RE = re.compile(r"^(\s*)([-*+]|\d{1,9}[.)])(\s+)(.*)$")
QUOTE_RE = re.compile(r"^ {0,3}>\s?(.*)$")
ASCII_ART_RE = re.compile(r"(--+>|<--+|[\u2500-\u257f]|\+--)")
# A directory tree also uses box characters, but only as leading connectors:
# "|-- name". A drawn diagram puts them around and between the content as well.
TREE_PREFIX_RE = re.compile(r"^[\s\u2502\u251c\u2514\u2500]*")


def looks_like_tree(body):
    """True for a file or folder listing, which is not a diagram to redraw."""
    connected = False
    for line in body.splitlines():
        rest = TREE_PREFIX_RE.sub("", line, count=1)
        if rest != line:
            connected = True
        if ASCII_ART_RE.search(rest):
            return False
    return connected


def is_hr(line):
    return bool(HR_RE.match(line))


def split_row(line):
    line = line.strip()
    line = line[1:] if line.startswith("|") else line
    line = line[:-1] if line.endswith("|") else line
    return [c.strip() for c in re.split(r"(?<!\\)\|", line)]


def alignments(line):
    """The cells of a table's delimiter row, or None if this is not one."""
    if "|" not in line:
        return None
    cells = split_row(line)
    out = []
    for cell in cells:
        if not re.fullmatch(r":?-{1,}:?", cell):
            return None
        out.append("center" if cell.startswith(":") and cell.endswith(":")
                   else "right" if cell.endswith(":")
                   else "left" if cell.startswith(":") else "")
    return out if len(out) > 1 else None


def render(lines, ctx):
    """Block-level markdown to HTML."""
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        fence = FENCE_RE.match(line)
        if fence:
            marker, lang = fence.group(2), fence.group(3).lower()
            body, i = [], i + 1
            while i < len(lines):
                close = FENCE_RE.match(lines[i])
                if close and close.group(2)[0] == marker[0] and len(close.group(2)) >= len(marker):
                    i += 1
                    break
                body.append(lines[i])
                i += 1
            out.append(ctx.fence(lang, "\n".join(body)))
            continue
        if is_hr(line):
            out.append("<hr>")
            i += 1
            continue
        heading = HEADING_RE.match(line)
        if heading:
            level = len(heading.group(1))
            text = inline(heading.group(2), ctx)
            out.append(f'<h{level} id="{slug(heading.group(2))}">{text}</h{level}>')
            i += 1
            continue
        if "|" in line and i + 1 < len(lines) and alignments(lines[i + 1]):
            block, i = table(lines, i, ctx)
            out.append(block)
            continue
        if QUOTE_RE.match(line):
            inner, i = [], i
            while i < len(lines) and (QUOTE_RE.match(lines[i]) or
                                      (lines[i].strip() and not is_hr(lines[i]) and inner)):
                m = QUOTE_RE.match(lines[i])
                inner.append(m.group(1) if m else lines[i])
                i += 1
            out.append(f'<blockquote>{render(inner, ctx)}</blockquote>')
            continue
        if LIST_RE.match(line):
            block, i = bullets(lines, i, ctx)
            out.append(block)
            continue
        para, i = [], i
        while i < len(lines) and lines[i].strip() and not (
                HEADING_RE.match(lines[i]) or FENCE_RE.match(lines[i]) or is_hr(lines[i])
                or QUOTE_RE.match(lines[i]) or LIST_RE.match(lines[i])
                or ("|" in lines[i] and i + 1 < len(lines) and alignments(lines[i + 1]))):
            para.append(lines[i].strip())
            i += 1
        out.append(ctx.paragraph(" ".join(para)))
    return "\n".join(b for b in out if b)


def table(lines, i, ctx):
    header = split_row(lines[i])
    aligns = alignments(lines[i + 1])
    i += 2
    body = []
    while i < len(lines) and lines[i].strip() and "|" in lines[i]:
        body.append(split_row(lines[i]))
        i += 1
    width = len(aligns)

    def cells(row, tag):
        row = (row + [""] * width)[:width]
        out = []
        for n, cell in enumerate(row):
            a = f' style="text-align:{aligns[n]}"' if aligns[n] else ""
            out.append(f"<{tag}{a}>{inline(cell, ctx)}</{tag}>")
        return "<tr>" + "".join(out) + "</tr>"

    # `| | |` with an empty header is the document-control sheet the templates use: no
    # header row, first column a row label.
    sheet = not any(c.strip() for c in header)
    if sheet:
        rows = "".join("<tr>" + "".join(
            f'<th scope="row">{inline(c, ctx)}</th>' if n == 0 else f"<td>{inline(c, ctx)}</td>"
            for n, c in enumerate((r + [""] * width)[:width])) + "</tr>" for r in body)
        return f'<div class="table-wrap"><table class="sheet"><tbody>{rows}</tbody></table></div>', i
    head = cells(header, "th")
    rows = "".join(cells(r, "td") for r in body)
    return (f'<div class="table-wrap"><table><thead>{head}</thead>'
            f"<tbody>{rows}</tbody></table></div>", i)


def bullets(lines, i, ctx):
    """One list, nested lists included. Items keep their own indented content."""
    first = LIST_RE.match(lines[i])
    base = len(first.group(1))
    ordered = first.group(2)[0].isdigit()
    start = first.group(2)[:-1] if ordered else ""
    items, current, loose, blanks = [], None, False, 0
    while i < len(lines):
        line = lines[i]
        m = LIST_RE.match(line)
        if not line.strip():
            blanks += 1
            if current is not None:
                current.append("")
            i += 1
            continue
        indent = len(line) - len(line.lstrip())
        if m and indent <= base + 1 and m.group(2)[0].isdigit() == ordered:
            if current is not None:
                loose = loose or blanks > 0
                items.append(current)
            current = [m.group(4)]
            offset = len(m.group(1)) + len(m.group(2)) + len(m.group(3))
            blanks = 0
            i += 1
            continue
        if current is not None and indent > base:
            current.append(line[min(offset, indent):])
            blanks = 0
            i += 1
            continue
        break
    if current is not None:
        items.append(current)
    rendered = []
    for item in items:
        while item and not item[-1].strip():
            item.pop()
        single = len(item) == 1 or not any(
            FENCE_RE.match(x) or LIST_RE.match(x) or not x.strip() or
            ("|" in x and alignments(x)) for x in item[1:])
        if single and not loose:
            rendered.append(f"<li>{inline(' '.join(x.strip() for x in item), ctx)}</li>")
        else:
            rendered.append(f"<li>{render(item, ctx)}</li>")
    tag = "ol" if ordered else "ul"
    attr = f' start="{start}"' if ordered and start not in ("1", "") else ""
    return f"<{tag}{attr}>" + "".join(rendered) + f"</{tag}>", i


# ─── one document ────────────────────────────────────────────────────────────

class Document:
    """One Markdown source, rendered for one target format.

    Both formats are HTML; only the diagrams differ. "html" inlines every drawing, so the
    page is one self-contained file. "pandoc" points at PNG files on disk instead, because
    pandoc cannot carry an inline <svg> into DOCX.
    """

    def __init__(self, source, out_root, diagrams, fmt="html", siblings=(), strict=True):
        self.source = Path(source).resolve()
        self.out_root = Path(out_root)
        self.diagrams = diagrams
        self.fmt = fmt
        self.siblings = set(siblings)
        self.strict = strict
        self.front, self.lines = read_source(self.source)
        self.problems, self.warnings = [], []
        self.figures = self.mermaid_blocks = 0
        self.title = self.front.get("title") or self.first_heading() or self.source.stem

    # paths ---------------------------------------------------------------
    def output(self, fmt=None):
        fmt = fmt or self.fmt
        inside = self.source.relative_to(ARCH) if self.source.is_relative_to(ARCH) \
            else Path(self.source.name)
        return self.out_root / inside.with_suffix("." + EXT.get(fmt, fmt))

    def first_heading(self):
        for line in self.lines:
            m = HEADING_RE.match(line)
            if m:
                return re.sub(r"[*`_]", "", m.group(2)).strip()
        return None

    # blocks --------------------------------------------------------------
    def fence(self, lang, body):
        if lang == "mermaid":
            return self.mermaid_figure(body)
        if lang in ("", "text", "txt") and len(body.splitlines()) > 2 \
                and ASCII_ART_RE.search(body) and not looks_like_tree(body):
            self.warnings.append(
                f"a `{lang or 'plain'}` code fence looks like a hand drawn diagram. "
                "Diagram as code comes first: make it a ```mermaid block or a view in the "
                "diagram pipeline, so it exports as a picture")
        return (f'<pre><code{f" class=\"language-{lang}\"" if lang else ""}>'
                f"{html.escape(body, quote=False)}</code></pre>")

    def mermaid_figure(self, body):
        caption, label, code = mermaid_meta(body)
        self.mermaid_blocks += 1
        where = label or f"mermaid block {self.mermaid_blocks}"
        if not code.strip():
            self.problems.append(f"{where} is empty")
            return ""
        try:
            svg, svg_id = self.diagrams.mermaid(code)
        except ExportError as e:
            self.problems.append(f"{where}: {e}")
            return ""
        size = svg_size(Path(svg).read_text(encoding="utf-8")[:400])
        if size and size[1] > size[0] * 1.8:
            self.warnings.append(
                f"a mermaid diagram is {size[1] / size[0]:.1f} times taller than it is wide, so "
                "it prints small on A4. Lay it out with `flowchart LR`, or split it in two")
        self.figures += 1
        return self.figure(svg, caption, label, mermaid=True)

    def paragraph(self, text):
        only = IMAGE_RE.fullmatch(text.strip())
        if only:                                  # an image alone is a figure, not a run of text
            return self.image(only.group(2), only.group(1), inline=False)
        return f'<p class="prose">{inline(text, self)}</p>'

    def figure(self, path, caption, label, mermaid=False):
        path = Path(path)
        alt = html.escape(caption or label or "diagram", quote=True)
        if self.fmt == "pandoc":
            png = self.diagrams.raster(path) if path.suffix == ".svg" else path
            art = f'<img src="{png}" alt="{alt}">'
        elif path.suffix == ".svg":
            art = inline_svg(path, "diagram")
        else:
            art = f'<img src="{data_uri(path)}" alt="{alt}">'
        cap = ""
        if caption or label:
            lead = f'<strong>{html.escape(label, quote=False)}.</strong> ' if label else ""
            cap = f"<figcaption><p>{lead}{inline(caption, self) if caption else ''}</p></figcaption>"
        kind = " mermaid" if mermaid else ""
        return f'<figure class="diagram{kind}"><div class="frame">{art}</div>{cap}</figure>'

    # references ----------------------------------------------------------
    def resolve(self, href):
        """A local target as an absolute path, or None for a URL or a bare fragment."""
        if re.match(r"^[a-z][a-z0-9+.\-]*:", href, re.I) or href.startswith("#"):
            return None
        path, _, _ = href.partition("#")
        if not path:
            return None
        return (self.source.parent / path).resolve()

    def image(self, src, alt, inline=False):
        target = self.resolve(src)
        if target is None:
            return f'<img src="{html.escape(src, quote=True)}" alt="{html.escape(alt, quote=True)}">'
        if not target.exists():
            self.problems.append(f"image not found: {src} (looked in {rel(target)})")
            return ""
        caption, label = split_caption(alt)
        if inline:
            if self.fmt == "pandoc":
                src = self.diagrams.raster(target) if target.suffix == ".svg" else target
                return f'<img src="{html.escape(str(src), quote=True)}" alt="{html.escape(alt, quote=True)}">'
            if target.suffix == ".svg":
                return f'<span class="inline-svg">{inline_svg(target)}</span>'
            return f'<img src="{data_uri(target)}" alt="{html.escape(alt, quote=True)}">'
        self.figures += 1
        return self.figure(target, caption, label)

    def anchor(self, href, text, title):
        target = self.resolve(href)
        attr = f' title="{html.escape(title, quote=True)}"' if title else ""
        if target is None:
            # A brief can quote a link from a page someone else wrote: javascript:, data:
            # and the like would run when a reader clicks the export, so only these pass.
            if not href.startswith("#") and not SAFE_SCHEME_RE.match(href):
                self.problems.append(f"link with a scheme other than http, https or mailto: {href}")
                return text
            return f'<a href="{html.escape(href, quote=True)}"{attr}>{text}</a>'
        path, _, frag = href.partition("#")
        frag = "#" + frag if frag else ""
        if not target.exists():
            self.warnings.append(f"link target does not exist: {href}")
        if target.suffix == ".md" and target in self.siblings:
            kin = EXT.get(self.fmt, self.fmt)
            dest = os.path.relpath(sibling_output(target, self.out_root, kin),
                                   self.output(kin).parent)
            return f'<a href="{html.escape(dest + frag, quote=True)}"{attr}>{text}</a>'
        # Anything else in the repo (a view's YAML, a source file): keep it reachable from
        # where the export sits, which is inside the repo.
        dest = os.path.relpath(target, self.output(self.fmt).parent)
        return f'<a href="{html.escape(dest + frag, quote=True)}"{attr}>{text}</a>'

    # render --------------------------------------------------------------
    def body(self):
        return render(self.lines, self)

    def check(self, ban_em_dash=False):
        """Validate without writing. Returns (problems, warnings)."""
        self.body()
        dashes = em_dashes(self.source) if ban_em_dash else []
        if dashes:
            self.problems.append("em dash on line(s) " + ", ".join(map(str, dashes))
                                 + "; --ban-em-dash is on")
        if not self.first_heading():
            self.warnings.append("no level-1 heading, so the export has no title of its own")
        return self.problems, self.warnings


def sibling_output(source, out_root, fmt):
    source = Path(source).resolve()
    inside = source.relative_to(ARCH) if source.is_relative_to(ARCH) else Path(source.name)
    return Path(out_root) / inside.with_suffix("." + EXT.get(fmt, fmt))


def mermaid_meta(body):
    """`%% caption:` and `%% id:` lines in a mermaid block are the figure's caption and
    label. Mermaid treats `%%` as a comment, so the block still renders on GitHub."""
    caption, label, code = "", "", []
    for line in body.split("\n"):
        m = re.match(r"^\s*%%\s*(caption|id)\s*:\s*(.*?)\s*$", line, re.I)
        if m:
            if m.group(1).lower() == "caption":
                caption = m.group(2)
            else:
                label = m.group(2)
            continue
        code.append(line)
    return caption, label, "\n".join(code)


def split_caption(alt):
    """`![PV-08: how a thing flows](...)` gives label PV-08 and the rest as the caption."""
    m = re.match(r"^\s*([A-Z]{2,5}-\d{1,3}|Figure\s+\d+)\s*[:.]\s*(.*)$", alt)
    return (m.group(2), m.group(1)) if m else (alt, "")


# ─── the HTML page ───────────────────────────────────────────────────────────

CSS = """
:root {{
  --bg: {bg}; --surface: {surface}; --fg: {fg}; --muted: {muted}; --line: {line};
  --accent: {accent}; --accent-soft: {accent-soft}; --warn: {warn}; --note: {note};
  --ok: {ok}; --font-body: {font-body}; --font-mono: {font-mono};
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--fg); font-family: var(--font-body);
  font-size: 16px; line-height: 1.6; }}
main {{ max-width: 880px; margin: 0 auto; padding: 44px 28px 80px; background: var(--surface);
  border-inline: 1px solid var(--line); }}
header {{ display: grid; gap: 10px; margin-block-end: 36px; }}
.brand {{ display: flex; align-items: center; margin-block-end: 6px; }}
.logo {{ height: 64px; width: auto; display: block; }}
.logo-on-dark {{ display: none; }}
.eyebrow {{ font-family: var(--font-mono); font-size: 12px; letter-spacing: .04em;
  color: var(--muted); margin: 0; }}
h1 {{ font-size: 32px; line-height: 1.15; font-weight: 700; margin: 0; letter-spacing: -.01em; }}
h2 {{ font-size: 22px; line-height: 1.25; font-weight: 650; margin: 40px 0 14px;
  padding-block-start: 14px; border-block-start: 1px solid var(--line); }}
h3 {{ font-size: 17.5px; font-weight: 650; margin: 28px 0 10px; }}
h4, h5, h6 {{ font-size: 15.5px; font-weight: 650; margin: 22px 0 8px; color: var(--muted); }}
p {{ margin: 0 0 12px; }}
p, li {{ max-width: 76ch; }}
a {{ color: var(--accent); }}
strong {{ font-weight: 650; }}
code {{ font-family: var(--font-mono); font-size: .86em; background: #eff0f7;
  padding: 1px 5px; border-radius: 4px; overflow-wrap: anywhere; }}
pre {{ background: #1d1e2a; color: #e8e8f4; padding: 15px 18px; border-radius: 9px;
  overflow-x: auto; font-size: 12.8px; line-height: 1.5; }}
pre code {{ background: none; padding: 0; color: inherit; font-size: 12.8px; }}
ul, ol {{ margin: 0 0 14px; padding-inline-start: 24px; }}
li {{ margin-block-end: 5px; }}
li > ul, li > ol {{ margin-block: 5px 0; }}
blockquote {{ margin: 16px 0; padding: 12px 18px; background: var(--note);
  border: 1px solid var(--line); border-inline-start: 3px solid var(--accent);
  border-radius: 8px; }}
blockquote p:last-child {{ margin-block-end: 0; }}
hr {{ border: 0; border-block-start: 1px solid var(--line); margin: 28px 0; }}
/* The guidelines separate sections with a rule, and h2 draws its own: show one line. */
hr + h2 {{ border-block-start: 0; padding-block-start: 0; margin-block-start: 0; }}
.table-wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 9px;
  margin: 0 0 16px; background: var(--surface); }}
table {{ border-collapse: collapse; width: 100%; font-size: 14px; }}
th, td {{ text-align: start; vertical-align: top; padding: 9px 13px;
  border-block-end: 1px solid var(--line); }}
tr:last-child td, tr:last-child th {{ border-block-end: 0; }}
thead th {{ font-size: 11.5px; letter-spacing: .05em; text-transform: uppercase;
  color: var(--muted); font-weight: 600; background: var(--accent-soft); }}
.sheet th {{ width: 24%; font-size: 13px; color: var(--muted); font-weight: 600; }}
figure {{ margin: 22px 0; display: grid; gap: 10px; }}
.frame {{ overflow-x: auto; background: var(--surface); border: 1px solid var(--line);
  border-radius: 10px; padding: 16px; }}
.frame svg, .frame img {{ display: block; max-width: 100%; width: auto; height: auto;
  margin: 0 auto; }}
figcaption {{ color: var(--muted); font-size: 14px; max-width: 74ch; }}
figcaption strong {{ color: var(--fg); font-weight: 600; }}
figcaption p {{ margin: 0; }}
.inline-svg svg {{ height: 1.1em; width: auto; vertical-align: -.15em; }}
footer {{ margin-block-start: 48px; padding-block-start: 14px;
  border-block-start: 1px solid var(--line); color: var(--muted); font-size: 12.5px;
  font-family: var(--font-mono); }}
@page {{ size: A4; margin: 16mm 14mm; }}
@media print {{
  body {{ background: #fff; font-size: 11.5pt; }}
  main {{ max-width: none; padding: 0; border: 0; }}
  .logo {{ height: 46px; }}
  pre {{ white-space: pre-wrap; background: #f4f4fa; color: #1d1e2a; border: 1px solid var(--line); }}
  pre code {{ color: inherit; }}
  h1, h2, h3, h4 {{ break-after: avoid; }}
  figure, .table-wrap, tr {{ break-inside: avoid; }}
  .frame {{ padding: 8px; }}
  /* A drawing taller than the text area is scaled to fit one page rather than clipped. */
  .frame svg, .frame img {{ max-height: 215mm; }}
  a {{ text-decoration: none; }}
}}
"""

PAGE = """<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>{css}</style>
<main>
<header>{brand}<p class="eyebrow">{eyebrow}</p>{heading}{meta}</header>
{body}
<footer>{footer}</footer>
</main>
</html>
"""


def brand_markup():
    """Your logo block from tools/brand.html, if you added one."""
    if not BRAND.exists():
        return ""
    return BRAND.read_text(encoding="utf-8").strip()


def project_name():
    """`project.name` from the profile, read with a regex so no YAML library is needed."""
    try:
        text = PROFILE.read_text(encoding="utf-8")
    except OSError:
        return ""
    m = re.search(r"^project:[ \t]*\n(?:[ \t]+.*\n|[ \t]*\n)*?[ \t]+name:[ \t]*(.*)$", text, re.M)
    if not m:
        return ""
    value = re.sub(r"\s+#.*$", "", m.group(1)).strip().strip("'\"")
    return value


def front_matter_table(front):
    if not front:
        return ""
    rows = "".join(f'<tr><th scope="row">{html.escape(k, quote=False)}</th>'
                   f"<td>{html.escape(v, quote=False)}</td></tr>" for k, v in front.items())
    return f'<div class="table-wrap"><table class="sheet"><tbody>{rows}</tbody></table></div>'


def page_html(doc):
    body = doc.body()
    heading = f"<h1>{html.escape(doc.title, quote=False)}</h1>" if doc.title else ""
    # The document's own first heading is already the title in the header.
    body = re.sub(r'^<h1[^>]*>.*?</h1>\s*', "", body, count=1, flags=re.S) if heading else body
    eyebrow = " · ".join(filter(None, [
        f"{project_name()} architecture" if project_name() else "Architecture",
        doc.front.get("template", "").upper() or None,
        f"exported {date.today().isoformat()}"]))
    return PAGE.format(
        title=html.escape(doc.title, quote=False), css=CSS.format(**TOKENS),
        brand=brand_markup(), eyebrow=html.escape(eyebrow, quote=False), heading=heading,
        meta=front_matter_table(doc.front), body=body,
        footer=html.escape(f"Source: {rel(doc.source)} · Exported by "
                           "docs/architecture/tools/export.py", quote=False))


PANDOC_PAGE = """<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>{title}</title>
<body>
<h1>{heading}</h1>
{meta}
{body}
</body>
</html>
"""


def page_for_pandoc(doc):
    """What pandoc converts. HTML, not Markdown: one renderer serves every format, and
    pandoc's HTML reader carries tables, lists and figure captions into DOCX. Diagrams are
    PNG files on disk, because an inline <svg> does not survive the DOCX writer."""
    body = doc.body()
    body = re.sub(r"^<h1[^>]*>.*?</h1>\s*", "", body, count=1, flags=re.S)
    return PANDOC_PAGE.format(title=html.escape(doc.title, quote=False),
                              heading=html.escape(doc.title, quote=False),
                              meta=front_matter_table(doc.front), body=body)


# ─── formats ─────────────────────────────────────────────────────────────────

def write_docx(source, out_root, diagrams, siblings):
    if not have("pandoc"):
        raise ExportError(f"DOCX needs pandoc, which was not found. Install it: {INSTALL['pandoc']}")
    doc = Document(source, out_root, diagrams, fmt="pandoc", siblings=siblings)
    target = doc.output("docx")
    target.parent.mkdir(parents=True, exist_ok=True)
    text = page_for_pandoc(doc)                  # diagrams are already PNGs on disk here
    if doc.problems:
        raise ExportError("; ".join(dict.fromkeys(doc.problems)))
    staging = Path(out_root) / CACHE / "staging"
    staging.mkdir(parents=True, exist_ok=True)
    intermediate = staging / (target.stem + ".html")
    intermediate.write_text(text, encoding="utf-8")
    try:
        subprocess.run(
            ["pandoc", "--from=html", "--to=docx", "--standalone",
             f"--metadata=title:{doc.title}", f"--resource-path={REPO}:{staging}",
             "-o", str(target), str(intermediate)],
            check=True, capture_output=True, text=True)
    finally:
        if not os.environ.get("EXPORT_KEEP_STAGING"):
            intermediate.unlink(missing_ok=True)
    return target, doc


def write_pdf(doc, html_path):
    """PDF from our own HTML, so it carries the brand. weasyprint first, then any Chrome on
    the machine. pandoc with a TeX engine is the last resort and loses the CSS."""
    target = doc.output("pdf")
    target.parent.mkdir(parents=True, exist_ok=True)
    if have("weasyprint"):
        subprocess.run(["weasyprint", "-e", "utf-8", str(html_path), str(target)],
                       check=True, capture_output=True, text=True)
        return target, "weasyprint"
    browser = chrome()
    if browser:
        subprocess.run(
            [browser, "--headless", "--disable-gpu", "--no-first-run", "--no-pdf-header-footer",
             "--virtual-time-budget=8000", f"--print-to-pdf={target}", html_path.as_uri()],
            check=True, capture_output=True, text=True)
        if target.exists():
            return target, Path(browser).name
    raise ExportError(
        "PDF needs an HTML to PDF engine and none was found. Install weasyprint "
        f"({INSTALL['weasyprint']}), or install Google Chrome, which the exporter will "
        "drive headless.")


# ─── CLI ─────────────────────────────────────────────────────────────────────

def ignore_exports(root):
    """Keep exports out of git without touching the repo's own .gitignore."""
    root.mkdir(parents=True, exist_ok=True)
    marker = root / ".gitignore"
    if not marker.exists():
        marker.write_text("# Written by docs/architecture/tools/export.py. Exports are copies; "
                          "the Markdown is the source.\n*\n", encoding="utf-8")


def collect(targets, all_docs):
    """Every Markdown source named, directories walked. READMEs of a folder export too."""
    found = []
    if all_docs:
        targets = list(targets) + [ARCH]
    for t in targets:
        p = Path(t).resolve()
        if p.is_dir():
            found += sorted(x for x in p.rglob("*.md") if EXPORTS not in x.parents)
        elif p.suffix == ".md":
            found.append(p)
        else:
            raise SystemExit(f"not a Markdown document or a folder: {t}")
    seen, out = set(), []
    for p in found:
        if p not in seen and p.exists():
            seen.add(p)
            out.append(p)
    if not out:
        raise SystemExit("nothing to export")
    return out


def tool_table():
    rows = [
        ("HTML", "nothing", "ready"),
        ("Mermaid diagrams", "npx (Node)", "ready" if have("npx") else "missing: " + INSTALL["npx"]),
        ("PDF", "weasyprint or Chrome",
         f"ready ({'weasyprint' if have('weasyprint') else Path(chrome()).name})"
         if have("weasyprint") or chrome() else "missing: " + INSTALL["weasyprint"]),
        ("DOCX", "pandoc", "ready" if have("pandoc") else "missing: " + INSTALL["pandoc"]),
        ("Raster diagrams (DOCX)", "rsvg-convert",
         "ready" if have("rsvg-convert") else "missing: " + INSTALL["rsvg-convert"]),
    ]
    width = max(len(r[0]) for r in rows)
    return "\n".join(f"  {name:<{width}}  {need:<22}  {state}" for name, need, state in rows)


def main(argv):
    ap = argparse.ArgumentParser(
        prog="export.py", description="Export architecture documents to HTML, PDF and DOCX.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Output goes to docs/architecture/exports/, which the exporter gitignores.")
    ap.add_argument("targets", nargs="*", help="Markdown documents, or folders of them")
    ap.add_argument("--to", default="html", help="comma separated: html,pdf,docx (default html)")
    ap.add_argument("--all", action="store_true", help="every document under docs/architecture/")
    ap.add_argument("--out", default=str(EXPORTS), help=f"output folder (default {rel(EXPORTS)})")
    ap.add_argument("--check", action="store_true",
                    help="validate only: diagrams render, images exist, links resolve")
    ap.add_argument("--ban-em-dash", action="store_true",
                    help="with --check, fail a document that holds an em dash")
    ap.add_argument("--tools", action="store_true", help="show which formats this machine can produce")
    ap.add_argument("-q", "--quiet", action="store_true")
    args = ap.parse_args(argv)

    if args.tools:
        print("Export toolchain on this machine:")
        print(tool_table())
        return 0
    if not args.targets and not args.all:
        ap.error("name a document or a folder, or pass --all")

    formats = [f.strip().lower() for f in args.to.split(",") if f.strip()]
    unknown = [f for f in formats if f not in FORMATS]
    if unknown:
        raise SystemExit(f"unknown format(s): {', '.join(unknown)}. Known: {', '.join(FORMATS)}")

    sources = collect(args.targets, args.all)
    out_root = Path(args.out).resolve()
    if out_root == EXPORTS.resolve():
        ignore_exports(out_root)
    diagrams = Diagrams(out_root, quiet=args.quiet)
    siblings = set(sources)
    failed = False

    if args.check:
        total_warnings = 0
        for source in sources:
            doc = Document(source, out_root, diagrams, fmt="html", siblings=siblings)
            problems, warnings = doc.check(ban_em_dash=args.ban_em_dash)
            total_warnings += len(warnings)
            if problems:
                failed = True
                print(f"FAIL {rel(source)}")
                for p in problems:
                    print(f"    - {p}")
            else:
                print(f"ok   {rel(source)}"
                      + (f" ({doc.figures} diagram{'s' if doc.figures != 1 else ''})"
                         if doc.figures else ""))
            for w in warnings:
                print(f"    ! {w}")
        print(f"\n{len(sources)} document(s) checked, "
              f"{'1 or more failed' if failed else 'all exportable'}, {total_warnings} warning(s).")
        return 1 if failed else 0

    for source in sources:
        if not args.quiet:
            print(rel(source))
        doc = Document(source, out_root, diagrams, fmt="html", siblings=siblings)
        html_path = None
        made = []
        try:
            page = page_html(doc)
            if doc.problems:
                raise ExportError("; ".join(dict.fromkeys(doc.problems)))
            if "html" in formats or "pdf" in formats:
                html_path = doc.output("html")
                html_path.parent.mkdir(parents=True, exist_ok=True)
                html_path.write_text(page, encoding="utf-8")
                if "html" in formats:
                    made.append(("html", html_path))
        except ExportError as e:
            failed = True
            print(f"  html failed: {e}", file=sys.stderr)
        for fmt in formats:
            if fmt == "html":
                continue
            try:
                if fmt == "pdf":
                    if html_path is None:
                        raise ExportError("the HTML the PDF is printed from could not be built")
                    target, engine = write_pdf(doc, html_path)
                    made.append((f"pdf via {engine}", target))
                elif fmt == "docx":
                    target, _ = write_docx(source, out_root, diagrams, siblings)
                    made.append(("docx", target))
            except ExportError as e:
                failed = True
                print(f"  {fmt} failed: {e}", file=sys.stderr)
            except subprocess.CalledProcessError as e:
                failed = True
                detail = (e.stderr or e.stdout or "").strip().splitlines()[-4:]
                print(f"  {fmt} failed: {' / '.join(detail) or e}", file=sys.stderr)
        if "html" not in formats and html_path and html_path.exists():
            html_path.unlink()                      # it was only the PDF's input
        for label, target in made:
            if not args.quiet:
                print(f"  {label}: {rel(target)}")
        for w in dict.fromkeys(doc.warnings):
            print(f"  ! {w}", file=sys.stderr)
    if failed:
        print("\nSomething did not export. What this machine can do:\n" + tool_table(), file=sys.stderr)
    elif not args.quiet:
        print(f"\n{len(sources)} document(s) exported to {rel(out_root)}"
              + (f", {diagrams.rendered} diagram(s) rendered" if diagrams.rendered else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
