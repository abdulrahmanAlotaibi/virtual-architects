# Architecture research

Working memory of the `research-architect` subagent (`.claude/agents/research-architect.md`,
and its Copilot copy in `.github/agents/`). It reads sources, summarizes them for the four
architects, and records what was asked and answered, so the same question is researched once.

| File | What it holds |
|---|---|
| `sources.yaml` | The curated reading list: the repo's own standards and the outside sources the team trusts, with the date each was last checked |
| `questions.yaml` | The question bank: every architecture question, its owner, status, answer and sources |
| `YYYY-MM-DD-topic.md` | One research brief per piece of research, from `../templates/research-brief.md` |

## Use it

Hand the research architect a link, a pasted document, or a question:

```
/arch-research <url, file or question>     # Claude Code and Copilot
/arch-board <question>                     # research first, then the relevant architects
```

It checks the question bank first, reads the source, writes a brief here, adds new questions
with one owner each, and stops. The owning architect makes the decision (an ADR in
`docs/architecture/decisions/`, a view, a policy).

## Rules

- Every fact cites a source, and web sources carry the date they were read.
- No secrets, credentials, people's names, pricing experiments or unreleased plans.
- Weaknesses in the project's own systems never go here; they go to the security architect.
