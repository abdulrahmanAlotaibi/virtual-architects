# Install the virtual architecture team

Five AI architects (enterprise, solution, cloud and infra, security, research) and a
board command, for Claude Code and GitHub Copilot. They research, design and review.
You decide. Nothing in this kit is about any one project. Everything the architects know
about yours comes from one file you fill in, and they are only as good as that file.

It takes three steps: unzip, fill in one file, ask a question.

## Before you start

- **Claude Code**, or **GitHub Copilot Chat in VS Code**. You need one, not both. The
  Copilot files are generated from the Claude Code ones.
- **A plan you already pay for.** The kit brings the architects. Your Claude Code or
  Copilot plan brings the model.
- **The model.** Every agent asks for `model: opus` in its front matter
  (`.claude/agents/*.md`, line 4). If your plan does not include it, change or delete
  that line.
- **bash, awk and git** to run the sync script. On Windows, use WSL or Git Bash.
- **The sync workflow pushes a commit.** `.github/workflows/sync-copilot.yml` needs
  `contents: write` for Actions, and a branch it may push to. If branch protection blocks
  it, delete the workflow and run the script yourself after each change.

## 1. Unzip it at the root of your repository

```bash
unzip -n virtual-architects-kit.zip -d .
```

It adds `.claude/`, `.github/` and `docs/architecture/`. With `-n`, `unzip` never
overwrites a file you already have, so an existing `.github/workflows/` or
`docs/architecture/project.yaml` is safe. Delete this `INSTALL.md` afterwards if you
like.

## 2. Describe your project once

`docs/architecture/project.yaml` is already in place, blank. Let the team fill it:

```text
/arch-profile
```

It reads the repository for the stack, hosting and conventions, then asks a few questions
the code cannot answer: who decides, which rules apply, the data that matters most. Run it
again whenever those change, for example `/arch-profile we moved to AWS`.

You can also edit the file by hand. `project`, `stack` and `commands` are enough to start.
Leave the rest as `""` and the architects will ask for what they need and write the answers
back. Never write a secret value. Name the variable instead.

If you unzipped with `-n` over an existing profile, start a fresh one from the template:

```bash
cp docs/architecture/practice/templates/project.example.yaml docs/architecture/project.yaml
```

## 3. Ask your first question

In **Claude Code**, type it in the terminal session:

```
/arch-board should we add a second payment provider?
```

In **GitHub Copilot Chat** (VS Code, agent mode), reload the window once and type the
same command. The `/` menu lists the prompt files.

The kit already ships the Copilot copies. To keep them current after you edit an agent,
a command or the skill, have every commit regenerate them:

```bash
.claude/scripts/sync-copilot.sh --install-hook
```

Or regenerate them when you choose, with `/arch-sync` in Claude Code or the script with
no options.

## What you get

| Path | What it is |
|---|---|
| `.claude/agents/*-architect.md` | The five architects (edit these) |
| `.claude/commands/arch-*.md` | The slash commands for Claude Code, and `/arch-sync`, which regenerates the Copilot copies |
| `.claude/skills/solution-design/SKILL.md` | How the solution architect writes an HLD and the LLD, which is the Software Architecture Document (SAD) |
| `.claude/scripts/sync-copilot.sh` | Generates the Copilot copies; `--install-hook` makes every commit do it |
| `.github/agents`, `.github/skills`, `.github/prompts` | The Copilot copies (generated, don't edit) |
| `.github/workflows/sync-copilot.yml` | Runs the sync on every push that changes an architect |
| `.github/workflows/architecture-docs.yml` | Checks on every pull request that the architecture documents still export, with diagrams as code (optional) |
| `docs/architecture/README.md` | The team handbook: who does what, the workflow, the folders |
| `docs/architecture/project.yaml` | Your project profile: `/arch-profile` fills it in |
| `docs/architecture/practice/ea-playbook.md` | How the team practises enterprise architecture |
| `docs/architecture/practice/templates/` | The nine templates every architect writes from, the blank profile among them |
| `docs/architecture/tools/export.py` | Exports any architecture document to HTML, PDF or DOCX (optional) |
| `docs/architecture/practice/research/` | The research architect's memory: questions and sources |
| `docs/architecture/decisions/README.md` | The empty decision log |

## What it does not do

- It does not build your product. The architects design and review. The solution and
  security architects may edit docs and code, but none of them commits or pushes. You
  review and commit.
- It does not decide for you. Strategy, investment, technology and design decisions stay
  with the person named as `decision_maker` in the profile.
- It does not touch live systems. The cloud architect writes the plan, and you run the
  commands.

## No diagram pipeline? No problem

With `diagrams.pipeline` empty in the profile, the architects draw Mermaid in Markdown
inside their documents. Nothing else changes.

## Optional: export documents to HTML, PDF and DOCX

`docs/architecture/tools/export.py` turns any document the architects write into a file
you can send to someone who does not read Markdown. HTML needs only Python 3.9 or newer.
The rest is optional, and the exporter tells you what is missing:

- **Mermaid diagrams** need Node 20 or newer. The first render downloads mermaid-cli
  and a headless Chrome through `npx`, a few hundred megabytes, once.
- **PDF** needs `weasyprint`, or Google Chrome or Chromium on the machine.
- **DOCX** needs `pandoc`, and `rsvg-convert` (from librsvg) for the diagrams.

```bash
python3 docs/architecture/tools/export.py --tools          # what this machine can do
python3 docs/architecture/tools/export.py <doc.md> --to html,pdf,docx
```

The `Architecture documents` workflow runs `export.py --all --check` on pull requests
that touch `docs/architecture/`, so a diagram that does not parse or a missing image
fails the check. It sets up Node on the runner. Delete the workflow if you do not want
it. Details are in `docs/architecture/tools/README.md`.

## Updating the kit

Download it again, unzip it into an empty folder, and compare it with your copy. Your
`project.yaml` and the documents the architects wrote are yours, and a new kit never
needs to replace them.
