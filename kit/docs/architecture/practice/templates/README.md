# Architecture templates

Every architect writes from these, so the team's documents look alike and get better in
one place. The team and its workflow are in [`docs/architecture/README.md`](../../README.md).

| File | Owner | Use | Saved to |
|---|---|---|---|
| [`outline.md`](outline.md) | enterprise | The business view of a change: goal, options, cost (CSVLOD Outline) | `outlines/solutions/` |
| [`adr.md`](adr.md) | any | A decision with lasting impact | `decisions/` |
| [`hld.md`](hld.md) | solution | High-level design for a feature, an integration, or the full system, through the [`solution-design` skill](../../../../.claude/skills/solution-design/SKILL.md) (`/arch-doc`) | `designs/solutions/<project>/` or `designs/products/<product>/` |
| [`lld.md`](lld.md) | solution | Low-level design for the same three scopes, written as the Software Architecture Document (SAD) on [arc42](https://arc42.org) 9.1 | `designs/solutions/<project>/` or `designs/products/<product>/` |
| [`threat-model.md`](threat-model.md) | security | Threats and planned controls for a new design | `designs/solutions/<project>/` |
| [`change-plan.md`](change-plan.md) | cloud-infra | Steps, verification, rollback and cost for an infra change | `designs/solutions/<project>/` |
| [`research-brief.md`](research-brief.md) | research | What a source means for each architect | `practice/research/` |
| [`guideline.md`](guideline.md) | solution | An engineering guideline: numbered rules, a pull request checklist, and where today's code breaks them | `standards/guidelines/` |
| [`project.example.yaml`](project.example.yaml) | the team | The blank project profile. Copy to `docs/architecture/project.yaml` and fill it in for a new project | `project.yaml` |

## The HLD and the SAD

They are two documents with two jobs, and the split is what stops them becoming two copies
of each other.

| | HLD | LLD / SAD |
|---|---|---|
| Answers | should we build this, and how at a high level | what the architecture is |
| Kind of artifact | a decision | a description of facts |
| Reader | the decision maker, a reviewer, a customer's security or procurement review | whoever builds, operates or inherits the system |
| Structure | purpose, audience, constraints, pillars, logical view, data governance, auth, cybersecurity, integrations | arc42 9.1 sections 1 to 12, plus §13 data view, §14 interface and API contracts, §15 UI view, §16 build, test and rollout |
| Lifetime | frozen when the change ships | kept true for as long as the system runs |

Where both would say the same thing, the SAD says it and the HLD writes "see SAD §n".

Sections 1 to 12 of `lld.md` follow the arc42 template by Gernot Starke and Peter Hruschka,
used under CC BY-SA 4.0. Attribution travels in the template body so every exported
document carries it.

## Exporting

Any of these documents exports to HTML, PDF and DOCX with
[`docs/architecture/tools/export.py`](../../tools/README.md). Two things the templates owe
that tool, so keep them when you edit:

- **Flat front matter.** `title`, `status`, `owner`, `date`, `template`, one `key: value`
  per line, no nesting and no lists. It becomes the document's metadata table.
- **Diagram as code.** A `mermaid` block with `%% id` and `%% caption`, or a rendered
  pipeline view referenced as an **image** so it exports as a picture. Never ASCII art,
  never a hand-drawn SVG. `export.py --check` enforces this, and the `Architecture
  documents` workflow runs it on every pull request that touches `docs/architecture/`.

## Improving a template

These are meant to change as we learn what a good design needs.

1. Edit the template. In `hld.md` and `lld.md`, keep the `[F I S]` scope tags on each
   section.
2. Bump `version` in its front matter, and add a line to the changelog below.
3. If the change affects how an agent or the skill uses the template, update it in the
   same commit. Copilot's copy regenerates on push (`.github/workflows/sync-copilot.yml`).

Designs record the template version they were written from (`hld v1`), so an older
design is not wrong because the template moved on. Update it only if it is still live.

Good reasons to change one: a review keeps asking for something the template lacks, a
section is always left as "n/a", or a new guideline in `docs/architecture/standards/guidelines/` adds a duty.

## Changelog

| Date | Template | Version | Change |
|---|---|---|---|
| | all | 2 | The version shipped in the Virtual Architects kit. Project facts come from `docs/architecture/project.yaml` |
| | hld | 3 | Restructured: purpose, audience, constraints, architecture pillars, logical view, data governance, authentication and authorization, cybersecurity, integration architecture. Data governance carries a per-entity table with classification, lawful basis, retention and cross-border route; cybersecurity names which control sets bind the design and which it follows by choice. The HLD points at the SAD instead of repeating it |
| | lld | 3 | The LLD is now the Software Architecture Document, structured on arc42 9.1 sections 1 to 12, plus four sections arc42 leaves out: data view, interface and API contracts, user interface view, and build, test and rollout. §7.2 machine resources is mandatory, with proof per row, and §14.2 holds the integration catalogue |
| | hld, lld | 3 | Both carry flat export front matter and the diagram-as-code rules that `tools/export.py --check` enforces |
| | hld | 4 | Adds §14 user experience view: the actors and the job each comes to do, entry points, the states the design has to handle, what the user is told when something is refused or fails, the languages and their text direction, accessibility, and the design system. Screen-level detail stays in SAD §15 |
| | guideline | 1 | First version: the house style for an engineering guideline, with numbered rules, a checklist and Appendix A |
| | guideline | 2 | Every rule opens with its binding (mandatory, recommended, optional) and its enforcement (automated, reviewed, not policed), which `/arch-conform` reads. Appendix A gains Status and Fix columns and becomes the backlog the planning review draws from |
