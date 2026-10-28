---
name: arch-profile
description: Write or update the project profile (docs/architecture/project.yaml) from the repository and a few questions
---
<!-- GENERATED from .claude/commands/arch-profile.md by .claude/scripts/sync-copilot.sh. Do not edit. -->
Write the project profile, `docs/architecture/project.yaml`. Every architect reads it, and
everything they know about this project comes from it. The blank template, with a comment
on every field, is `docs/architecture/practice/templates/project.example.yaml`. Keep its
keys, order and comments.

The request is the text after the slash command, if any.

1. **Read before you ask.** Fill what the repository already answers, and note where each
   answer came from: `package.json` and other manifests for the stack, Dockerfiles, CI
   files and IaC for hosting and delivery, `CLAUDE.md`, `README.md` and `CONTRIBUTING.md`
   for conventions and naming rules, the test setup, the logger, the env var names (never
   their values). If a `project.yaml` already exists, start from it and change only what the
   request names or what is now wrong.
2. **Ask only what the code cannot tell you**, in one short message, at most six questions,
   starting with these if still blank: what the product is for and who uses it, who decides,
   which laws, licences or standards apply, the most sensitive data, and anyone among the
   users who cannot consent for themselves. Offer your best guess for each so the user can
   just say yes. Then stop and wait.
3. **Write the file.** Fill what you know; leave `""` where nobody knows yet, since the
   architects ask later and write the answers back. Put a `# guess:` comment on any value
   you inferred and the user did not confirm. Never write a secret value, only the name of
   the variable or secret that holds it. If the file exists, show the changes as a diff and
   write only after the user agrees.
4. **Report** in a few lines: what you filled from the code, what the user told you, what is
   still blank and which architect will need it first. Do not commit.
