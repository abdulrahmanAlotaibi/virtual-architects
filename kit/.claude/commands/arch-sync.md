---
description: Regenerate the Copilot copies of the architects from the Claude Code sources
argument-hint: [hook | unhook]
---
Keep GitHub Copilot's architects in step with Claude Code's. The `.github/agents/`,
`.github/skills/arch-*` and `.github/prompts/arch-*` files are generated from `.claude/`,
so never edit them by hand.

Request: $ARGUMENTS

- With no request, run `.claude/scripts/sync-copilot.sh`, then run `git status --short .github`
  and report which generated files changed, or say they were already current.
- With `hook`, run `.claude/scripts/sync-copilot.sh --install-hook`. From then on every
  commit that changes an architect, command or the solution-design skill regenerates and
  stages the Copilot copies. Say what the script printed; if a pre-commit hook already
  exists it refuses and tells you the line to add, so pass that on and do not edit the hook.
- With `unhook`, run `.claude/scripts/sync-copilot.sh --remove-hook`.

Do not commit. Leave the regenerated files for review.
