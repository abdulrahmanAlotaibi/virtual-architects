#!/usr/bin/env bash
# Generates GitHub Copilot custom agents (.github/agents/*.agent.md) and slash
# commands (.github/skills/arch-*/SKILL.md and .github/prompts/arch-*.prompt.md) from the Claude Code subagents in this
# folder, so both tools run the same architects.
# Edit the .md files here, then run: .claude/scripts/sync-copilot.sh
# (.github/workflows/sync-copilot.yml also runs it on every push that touches them.)
#
#   .claude/scripts/sync-copilot.sh                regenerate the copies
#   .claude/scripts/sync-copilot.sh --install-hook  run it on every commit from now on
#   .claude/scripts/sync-copilot.sh --remove-hook   undo that
# In Claude Code, /arch-sync does the same as the first line.
set -euo pipefail

root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

# A git pre-commit hook: when a commit stages an architect source, regenerate the Copilot
# copies and stage them too, so the two never drift. It only touches a hook this script wrote.
hook="$(git -C "$root" rev-parse --git-path hooks/pre-commit)"
case "$hook" in /*) ;; *) hook="$root/$hook" ;; esac
marker="# sync-copilot.sh managed hook"
case "${1:-}" in
  --install-hook)
    if [ -e "$hook" ] && ! grep -q "$marker" "$hook"; then
      echo "A pre-commit hook already exists at $hook. Add this line to it yourself:" >&2
      echo "  .claude/scripts/sync-copilot.sh --staged" >&2
      exit 1
    fi
    mkdir -p "$(dirname "$hook")"
    printf '#!/bin/sh\n%s\nexec "$(git rev-parse --show-toplevel)/.claude/scripts/sync-copilot.sh" --staged\n' "$marker" > "$hook"
    chmod +x "$hook"
    echo "Installed $hook. Commits that change .claude/agents, commands or skills now regenerate .github/."
    exit 0 ;;
  --remove-hook)
    if [ -e "$hook" ] && grep -q "$marker" "$hook"; then rm "$hook"; echo "Removed $hook."; else echo "No managed hook to remove."; fi
    exit 0 ;;
  --staged)
    git -C "$root" diff --cached --name-only | grep -Eq '^\.claude/(agents|commands|skills/solution-design|scripts/sync-copilot\.sh)' || exit 0
    "$0" > /dev/null
    git -C "$root" add .github/agents .github/skills .github/prompts
    echo "sync-copilot: regenerated the Copilot copies and staged them."
    exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac

src="$root/.claude/agents"
out="$root/.github/agents"
skills="$root/.github/skills"
prompts="$root/.github/prompts"
# Run from the wrong repository, the loop below would write a file named "*.agent.md".
if ! ls "$src"/*.md >/dev/null 2>&1; then
  echo "No architects in $src. Run this from the repository the kit is installed in." >&2
  exit 1
fi
mkdir -p "$out" "$skills" "$prompts"

for f in "$src"/*.md; do
  name="$(basename "$f" .md)"
  # Keep name and description; drop Claude-only keys (model, color). Copilot
  # grants all tools when the tools key is absent.
  awk -v src=".claude/agents/$name.md" '
    NR == 1 && $0 == "---" { fm = 1; print; next }
    fm && $0 == "---" {
      fm = 0
      print
      print "<!-- GENERATED from " src " by .claude/scripts/sync-copilot.sh. Do not edit. -->"
      next
    }
    fm && !/^(name|description):/ { next }
    { print }
  ' "$f" > "$out/$name.agent.md"
  echo "wrote .github/agents/$name.agent.md"

  # Slash command for Copilot: a project skill, /arch-<role>, that runs the same
  # instructions in the current session (Claude Code's are .claude/commands/arch-*.md).
  short="arch-${name%-architect}"
  mkdir -p "$skills/$short"
  awk -v name="$short" -v src=".claude/agents/$(basename "$f")" '
    NR == 1 && $0 == "---" { fm = 1; print; print "name: " name; next }
    fm && $0 == "---" {
      fm = 0
      print
      print "<!-- GENERATED from " src " by .claude/scripts/sync-copilot.sh. Do not edit. -->"
      print ""
      print "The request is the text after the slash command. If there is none, ask in one line"
      print "what to bring to this architect, then stop. Answer the request in the role below."
      print ""
      next
    }
    fm && !/^description:/ { next }
    { print }
  ' "$f" > "$skills/$short/SKILL.md"
  echo "wrote .github/skills/$short/SKILL.md"

  # The skill above is picked up by relevance; the / menu in VS Code Copilot Chat
  # lists prompt files, so /arch-<role> also exists as one that runs the agent.
  desc="$(awk 'NR > 1 && /^---$/ { exit } /^description:/ { sub(/^description: */, ""); print }' "$f")"
  cat > "$prompts/$short.prompt.md" <<PROMPT
---
description: ${desc}
agent: ${name}
argument-hint: What to bring to the ${name%-architect} architect
---
<!-- GENERATED from .claude/agents/$name.md by .claude/scripts/sync-copilot.sh. Do not edit. -->

Answer the request that follows the slash command, in your role. If there is none, ask in
one line what to bring to you, then stop.
PROMPT
  echo "wrote .github/prompts/$short.prompt.md"
done

# Project skills shared with Copilot. Copied with a GENERATED marker under the front matter.
for dir in "$root"/.claude/skills/solution-design; do
  skill="$(basename "$dir")"
  mkdir -p "$skills/$skill"
  awk -v src=".claude/skills/$skill/SKILL.md" '
    { print }
    NR > 1 && $0 == "---" && !done { print "<!-- GENERATED from " src " by .claude/scripts/sync-copilot.sh. Do not edit. -->"; done = 1 }
  ' "$dir/SKILL.md" > "$skills/$skill/SKILL.md"
  echo "wrote .github/skills/$skill/SKILL.md"
done

mkdir -p "$skills/arch-doc"
cat > "$skills/arch-doc/SKILL.md" <<'DOC'
---
name: arch-doc
description: Write the high-level design (HLD) and low-level design (LLD) for a feature (business demand), integration, or the full system, as the solution architect.
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

The request is the text after the slash command. If there is none, ask in one line what
to design (a feature, an integration, or the full system), then stop.

Act as the solution architect (`.github/agents/solution-architect.agent.md`) and follow
the `solution-design` skill (`.github/skills/solution-design/SKILL.md`). Do not commit.
DOC
echo "wrote .github/skills/arch-doc/SKILL.md"

cat > "$prompts/arch-doc.prompt.md" <<'DOC'
---
description: Write the HLD and LLD for a feature, an integration, or the full system (solution architect)
agent: solution-architect
argument-hint: feature | integration | system, then what to design
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

Follow the `solution-design` skill (`.github/skills/solution-design/SKILL.md`) for the
request that follows the slash command. If there is no request, ask in one line what to
design (a feature, an integration, or the full system), then stop. Do not commit.
DOC
echo "wrote .github/prompts/arch-doc.prompt.md"

mkdir -p "$skills/arch-conform"
cat > "$skills/arch-conform/SKILL.md" <<'CONFORM'
---
name: arch-conform
description: Check code (a branch, a diff, a folder or a file) against the project's guidelines, patterns and technology reference model, report each breach with file and line and rule number, and fix the ones asked for, as the solution architect.
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

The request is the text after the slash command. If it names no branch, folder or file,
check the current branch against the default branch; if there is no difference, ask in one line which
folder or file to check, then stop.

Act as the solution architect (`.github/agents/solution-architect.agent.md`) and follow
its "Checking code against the Standards" section. Fix breaches only when the request
says `fix` or names which ones. Do not commit.
CONFORM
echo "wrote .github/skills/arch-conform/SKILL.md"

cat > "$prompts/arch-conform.prompt.md" <<'CONFORM'
---
description: Check code against the Standards and fix the breaches (solution architect)
agent: solution-architect
argument-hint: A branch, diff, folder or file, and "fix" to apply the fixes
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

Run a conformance check, as your "Checking code against the Standards" section describes,
on the request that follows the slash command. If it names no branch, folder or file,
check the current branch against the default branch. Fix breaches only when the request says `fix` or names which
ones. Do not commit.
CONFORM
echo "wrote .github/prompts/arch-conform.prompt.md"

mkdir -p "$skills/arch-board"
cat > "$skills/arch-board/SKILL.md" <<'BOARD'
---
name: arch-board
description: Convene the architecture board (enterprise, solution, cloud and infra, security, with research first when a source is given) on an idea, decision or change that crosses lanes, and merge their answers into one recommendation.
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

The request is the text after the slash command. If there is none, ask in one line what
to bring to the board, then stop.

1. If the request includes a link, document or video, first act as the research architect
   (`.github/agents/research-architect.agent.md`) and write its brief.
2. Pick the architects whose lane it touches from `.github/agents/`: enterprise, solution,
   cloud-infra, security. Say which and why in one line. For each, read its `.agent.md`
   and answer in that role. If you can run custom agents as subagents, run them in
   parallel instead.
3. Merge the answers: the recommendation, where they disagree and why, the decision this
   needs (strategy, investment, technology or design, per
   the EA playbook named in `docs/architecture/project.yaml`), and the next step with its
   owner.
4. Record open questions in `docs/architecture/practice/research/questions.yaml`. Do not commit.
BOARD
echo "wrote .github/skills/arch-board/SKILL.md"

cat > "$prompts/arch-board.prompt.md" <<'BOARD'
---
description: Convene the architecture board on an idea, decision or change that crosses lanes, and merge their answers into one recommendation.
agent: agent
argument-hint: The idea, decision or change to bring to the board
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

Follow `.github/skills/arch-board/SKILL.md` for the request that follows the slash command.
BOARD
echo "wrote .github/prompts/arch-board.prompt.md"

# /arch-profile: the command file is plain instructions, so Copilot gets the same text as a
# skill and a prompt, with the GENERATED marker and the Claude-only $ARGUMENTS line rewritten.
mkdir -p "$skills/arch-profile"
awk '
  NR == 1 && $0 == "---" { fm = 1; print; print "name: arch-profile"; next }
  fm && $0 == "---" { fm = 0; print; print "<!-- GENERATED from .claude/commands/arch-profile.md by .claude/scripts/sync-copilot.sh. Do not edit. -->"; next }
  fm && !/^description:/ { next }
  /^Request: \$ARGUMENTS$/ { print "The request is the text after the slash command, if any."; next }
  { print }
' "$root/.claude/commands/arch-profile.md" > "$skills/arch-profile/SKILL.md"
echo "wrote .github/skills/arch-profile/SKILL.md"

cat > "$prompts/arch-profile.prompt.md" <<'PROFILE'
---
description: Write or update the project profile (docs/architecture/project.yaml) from the repository and a few questions
agent: agent
argument-hint: Section to update, or anything you want to tell it
---
<!-- GENERATED by .claude/scripts/sync-copilot.sh. Do not edit. -->

Follow `.github/skills/arch-profile/SKILL.md` for the request that follows the slash command.
PROFILE
echo "wrote .github/prompts/arch-profile.prompt.md"
