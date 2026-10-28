#!/usr/bin/env python3
"""Build the downloadable architect kit from kit/.

Runs before every `npm run build` (the "prebuild" script). It:

1. checks that no kit file, and no file of the site's own source, carries project-specific
   text (the build fails if one does),
2. writes public/downloads/virtual-architects-kit.zip, deterministically: sorted entries,
   fixed timestamps, unix permissions kept (so the sync script stays executable),
3. copies every kit file to public/kit/<same path>, so each one can be viewed or
   downloaded on its own,
4. writes content/kit-manifest.json, which the page reads for sizes, hashes, the file
   tree and the template gallery,
5. writes public/install.sh and public/install.ps1 from scripts/installers/, with the
   address they download from (INSTALL_BASE_URL, by default this repository's public/
   folder on GitHub) and the zip's SHA-256 filled in,

Standard library only.
"""
from __future__ import annotations

import hashlib
import os
import json
import re
import shutil
import stat
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / "kit"
PUBLIC = ROOT / "public"
ZIP_PATH = PUBLIC / "downloads" / "virtual-architects-kit.zip"
FILES_DIR = PUBLIC / "kit"
MANIFEST = ROOT / "content" / "kit-manifest.json"

# Text that must never ship.
FORBIDDEN = re.compile("—")

# The site ships too, so its source is checked with the same list.
SITE_DIRS = ["app", "components", "content"]
SITE_TEXT = {".ts", ".tsx", ".css", ".json", ".md", ".svg"}

FIXED_TIME = (1980, 1, 1, 0, 0, 0)

GITHUB_REPO = "abdulrahmanAlotaibi/virtual-architects"

GROUPS = [
    ("start", "Start here", lambda p: p in {"INSTALL.md", "docs/architecture/README.md", "docs/architecture/project.yaml"}),
    ("claude", "Claude Code", lambda p: p.startswith(".claude/") and not p.startswith(".claude/scripts/")),
    ("copilot", "GitHub Copilot (generated)", lambda p: p.startswith(".github/") and not p.startswith(".github/workflows/")),
    ("automation", "Automation", lambda p: p.startswith((".claude/scripts/", ".github/workflows/", "docs/architecture/tools/"))),
    ("templates", "Templates", lambda p: p.startswith("docs/architecture/practice/templates/")),
    ("practice", "Practice and records", lambda p: p.startswith("docs/architecture/")),
]


def group_of(path: str) -> str:
    for gid, _label, test in GROUPS:
        if test(path):
            return gid
    return "start"


def is_exec(f: Path) -> bool:
    # Shell scripts ship executable even from a checkout that lost the bit.
    return f.suffix == ".sh" or bool(f.stat().st_mode & stat.S_IXUSR)


def kit_files() -> list[Path]:
    # Only what git would commit: a git-ignored file in kit/ (an export, a local .env) must
    # never reach the public zip.
    try:
        out = subprocess.run(["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "kit"],
                             cwd=ROOT, capture_output=True, check=True).stdout.decode("utf-8")
        files = [p for p in (ROOT / r for r in out.split("\0") if r) if p.is_file()]
    except (OSError, subprocess.CalledProcessError):
        print("build-kit: note: git is unavailable, so every file in kit/ is packed, ignored ones too.",
              file=sys.stderr)
        files = [p for p in KIT.rglob("*") if p.is_file()]
    return sorted(files, key=lambda p: p.relative_to(KIT).as_posix())


def site_files() -> list[Path]:
    return sorted(p for d in SITE_DIRS for p in (ROOT / d).rglob("*") if p.is_file() and p.suffix in SITE_TEXT)


def check_generic(files: list[Path]) -> None:
    problems = []
    for f in files + site_files():
        text = f.read_text(encoding="utf-8")
        for n, line in enumerate(text.splitlines(), 1):
            m = FORBIDDEN.search(line)
            if m:
                problems.append(f"{f.relative_to(ROOT).as_posix()}:{n}: {m.group(0)!r}")
    if problems:
        print("build-kit: em dash found in the kit or the site:", file=sys.stderr)
        for p in problems:
            print("  " + p, file=sys.stderr)
        sys.exit(1)


def write_zip(files: list[Path]) -> None:
    ZIP_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = ZIP_PATH.with_suffix(".zip.tmp")
    with zipfile.ZipFile(tmp, "w") as z:
        for f in files:
            rel = f.relative_to(KIT).as_posix()
            info = zipfile.ZipInfo(rel, date_time=FIXED_TIME)
            info.create_system = 3  # unix, so external_attr carries the mode
            mode = 0o755 if is_exec(f) else 0o644
            info.external_attr = (stat.S_IFREG | mode) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, f.read_bytes(), compresslevel=9)
    tmp.replace(ZIP_PATH)


def copy_files(files: list[Path]) -> None:
    if FILES_DIR.exists():
        shutil.rmtree(FILES_DIR)
    for f in files:
        dest = FILES_DIR / f.relative_to(KIT)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(f, dest)


def front_matter(text: str) -> dict[str, str]:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---", 4)
    out = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            out[k.strip()] = v.strip()
    return out


def template_body(text: str) -> str:
    """The part a user copies: everything after the comment block's closing --- line."""
    lines = text.splitlines()
    seps = [i for i, l in enumerate(lines) if l.strip() == "---"]
    start = seps[2] + 1 if len(seps) >= 3 else 0
    # A body that opens with its own front matter (title, status, ...) keeps its opening
    # rule, so the preview shows it as the block the user copies.
    if start and start < len(lines) and re.match(r"^[a-z_]+: ", lines[start]):
        start -= 1
    body = lines[start:]
    while body and not body[0].strip():
        body.pop(0)
    return "\n".join(body)


def templates() -> list[dict]:
    """Rows of the templates README table, plus version and a preview from each file."""
    tdir = KIT / "docs/architecture/practice/templates"
    readme = (tdir / "README.md").read_text(encoding="utf-8")
    rows = []
    for line in readme.splitlines():
        m = re.match(r"\| \[`([^`]+)`\]\([^)]+\) \| ([^|]+) \| (.+) \| ([^|]+) \|$", line)
        if not m:
            continue
        name, owner, use, saved = (s.strip() for s in m.groups())
        text = (tdir / name).read_text(encoding="utf-8")
        fm = front_matter(text)
        use = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", use).replace("`", "").replace("**", "")
        if name.endswith(".yaml"):
            preview_lines = text.splitlines()
            version = None
        else:
            preview_lines = template_body(text).splitlines()
            version = fm.get("version")
        rows.append({
            "name": name,
            "path": f"docs/architecture/practice/templates/{name}",
            "owner": owner,
            "use": use,
            "savedTo": saved.replace("`", ""),
            "version": version,
            "scoped": name in {"hld.md", "lld.md"},
            "lines": len(text.splitlines()),
            "preview": "\n".join(preview_lines[:40]),
            "more": max(0, len(preview_lines) - 40),
        })
    return rows


# The installers download from the committed public/ folder on GitHub, so they work without a
# deployed site. INSTALL_BASE_URL points them at another copy, such as the deployed site.
INSTALL_BASE_URL = f"https://raw.githubusercontent.com/{GITHUB_REPO}/main/public"


def install_base() -> str:
    return (os.environ.get("INSTALL_BASE_URL") or INSTALL_BASE_URL).rstrip("/")


def write_installers(zip_sha256: str) -> None:
    guide = f"https://github.com/{GITHUB_REPO}#install-the-team"
    for name in ("install.sh", "install.ps1"):
        text = (ROOT / "scripts" / "installers" / name).read_text(encoding="utf-8")
        text = (text.replace("@BASE_URL@", install_base()).replace("@SHA256@", zip_sha256)
                .replace("@GUIDE_URL@", guide))
        out = PUBLIC / name
        out.write_text(text, encoding="utf-8", newline="\n" if name.endswith(".sh") else "\r\n")
        if name.endswith(".sh"):
            out.chmod(0o755)


def main() -> None:
    files = kit_files()
    check_generic(files)
    write_zip(files)
    copy_files(files)
    zip_bytes = ZIP_PATH.read_bytes()
    manifest = {
        "zip": {
            "href": "/downloads/virtual-architects-kit.zip",
            "bytes": len(zip_bytes),
            "sha256": hashlib.sha256(zip_bytes).hexdigest(),
        },
        "install": {"sh": install_base() + "/install.sh", "ps1": install_base() + "/install.ps1"},
        "groups": [{"id": gid, "label": label} for gid, label, _ in GROUPS],
        "files": [
            {
                "path": f.relative_to(KIT).as_posix(),
                "href": "/kit/" + f.relative_to(KIT).as_posix(),
                "group": group_of(f.relative_to(KIT).as_posix()),
                "bytes": f.stat().st_size,
                "sha256": hashlib.sha256(f.read_bytes()).hexdigest(),
                "executable": is_exec(f),
            }
            for f in files
        ],
        "templates": templates(),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    write_installers(manifest["zip"]["sha256"])
    print(f"build-kit: {len(files)} files, zip {len(zip_bytes)} bytes, sha256 {manifest['zip']['sha256'][:12]}")


if __name__ == "__main__":
    main()
