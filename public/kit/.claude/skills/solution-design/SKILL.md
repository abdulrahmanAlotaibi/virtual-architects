---
name: solution-design
description: Write a high-level design (HLD) and low-level design (LLD) for a feature (business demand), an integration, or the full system, from the maintained templates, the project profile and the project's architecture description. Used by the solution architect and by /arch-doc.
---

# Solution design: HLD and LLD

You are acting as the solution architect (`.claude/agents/solution-architect.md`). This
skill tells you how to write a design. Three files say what goes in it, and what is true
of this project:

- `docs/architecture/practice/templates/hld.md` and `lld.md`: the sections, by scope. The
  LLD **is** the Software Architecture Document (SAD): arc42 9.1 sections 1 to 12, plus
  §13 data view, §14 interface and API contracts, §15 user interface view, and §16 build,
  test and rollout.
- `docs/architecture/project.yaml`: the project profile. Its `diagrams.parts` says where
  each part of the architecture description lives; `stack`, `docs.guidelines`, `rules`
  and `commands` say how this codebase is built.

Read all three before writing. Never write from memory of an older version: the templates
change (see `docs/architecture/practice/templates/README.md`). If the profile is missing or a key
you need is empty, ask for it, and add the answer to the profile.

## 1. Pick the scope

| Scope | Asked as | HLD | LLD | Saved to |
|---|---|---|---|---|
| **F** Feature | "a feature", "business demand", a user story | The sections tagged F. Purpose, audience and constraints are short; the weight is §4 pillars, §5 logical view, §7 data governance, §8 authorization, §10 integrations, §14 experience | Sections tagged F: building blocks, runtime, cross-cutting concepts, §13 data view, §14 API contract, §15 client, §16 tests and rollout | `docs/architecture/designs/solutions/<project>/` |
| **I** Integration | a new provider, vendor, API, webhook, or a change to one | Sections tagged I: §10 the catalogue row and its place on the integration view, §6 flows including failure, §7 what data crosses the border, §10.3 trust boundary | Sections tagged I: §14.2 the interface specification in the shape of `diagrams.parts.interface_specifications`, §14.3 the adapter, retries and idempotency, §16 tests | `docs/architecture/designs/solutions/<provider>-integration/` |
| **S** Full system | "the whole platform", "system HLD", a product | Every section, written as a narrative over the existing views | The whole SAD. §5.1 is the index of contexts; §7.2 machine resources is mandatory. Write §5.2 in depth for one context only when asked | `docs/architecture/designs/products/<product>/` |

If the request doesn't say, infer the scope and state it in one line. If the user asks
for only the HLD or only the LLD, write only that one, but the LLD always needs an
agreed HLD to point at. Write the HLD first and say so if none exists.

## 2. Intake

Before writing, get: the goal, the users and volume, the timeline, and the constraints.
Take what the request, the conversation and the profile already give you. Ask in one
message only for what's missing and blocks the design. If the enterprise architect wrote
an Outline for this (`docs/architecture/outlines/solutions/`), read it and link it instead of
restating it.

## 3. Start from what already exists

If the profile sets `diagrams.pipeline`, the project has an architecture description as
code, rendered to `diagrams.rendered`. Read its sources, not the rendered page. Each part
in `diagrams.parts` feeds one part of the design:

| Part (`diagrams.parts`) | Reuse in |
|---|---|
| `document_control` | HLD §0: version and verified date |
| `principles` | HLD §4.2: the principles a design is checked against |
| `logical_view` | HLD §5: the components and layers, as a delta. SAD §3.2 and §5 |
| `integration_view` | HLD §10.1: where a provider sits |
| `interface_catalogue` | HLD §10.1 rows; a new integration gets the next id. SAD §14.2 |
| `interface_specifications` | SAD §14.2: the exact field set for an integration |
| `provided_interfaces` | SAD §14.1: what the system exposes |
| `process_views` | HLD §6 flows; SAD §6 runtime scenarios |
| `presentation_dependencies` | SAD §15: what the client loads from outside |
| `delivery` | HLD §11, SAD §7 |
| `findings` | HLD §12 and SAD §11: risks this design fixes or adds |
| `capability_map` | HLD §1 |
| `context_map` | HLD §4.3, SAD §3.1 and §5.1 |
| `deployment_view` | HLD §11, SAD §7.1 and §7.2 |
| `trust_boundary_view` | HLD §10.3 |

A part the profile doesn't list is one the project doesn't have yet: use the matching
profile section instead (`business.contexts`, `integrations`, `hosting`), and say the
view is missing. With no pipeline at all, the profile and the code are your starting
point.

`diagrams.owns` says who may change each view. You change your own; views owned by
another architect are proposed as a change in the HLD and handed to that owner.

Then read the code the design touches, starting from `docs.service_docs`. Every claim
about current behavior cites `file:line`. When the architecture description and the code
disagree, the code wins: note it as a finding.

## 4. Write

1. Copy each template's body (below its `---` line) to the target folder as `hld.md`
   and `lld.md`. Keep `Template: hld v<n>` in the document control.
2. Keep the sections tagged with your scope. Delete the others; don't leave "n/a".
3. Diagrams are code. A view that should outlive the design (a new flow, a new context, a
   new provider) goes into the pipeline with its owner and watch list, and is referenced
   from the document **as an image** so it exports as a picture. A sketch only this design
   needs is a `mermaid` block carrying `%% id:` and `%% caption:` comments, laid out
   `flowchart LR`. Never ASCII art, never a hand-drawn SVG.
4. Feature and integration designs show the delta: new boxes, new rows, new flows. Full
   system designs link the existing views and explain them, without redrawing.
5. Record each design decision with lasting impact as an ADR in
   `docs/architecture/decisions/`, from `docs/architecture/practice/templates/adr.md`. A
   decision in another lane (security, infrastructure, one that binds more than one system)
   is that architect's ADR: name it in the handoffs, and link it from SAD §9 once written.
6. If you changed a view, run `diagrams.build` and check the render.

## 5. Done when

- The HLD reads on its own in a page or two, with no code-level detail. The LLD has no
  business case, just enough to build from.
- Every handoff names the architect and the question (cloud-infra, security,
  enterprise).
- The SAD meets every guideline in `docs.guidelines`, including their checklists. SAD §8
  links them rather than restating them.
- Both documents export cleanly:
  `python3 docs/architecture/tools/export.py <path> --check` passes with no warnings. That
  check enforces the diagram rules and the flat front matter, and resolves every image and
  link. If the profile's `rules` ban em dashes, add `--ban-em-dash`. A Mermaid block needs
  Node (`npx`) to check; if it is missing, say so in the report rather than skip the check.
- Nothing in the HLD repeats the SAD. Where they would overlap, the HLD says "see SAD §n".
- It follows every entry in the profile's `rules`.
- Nothing committed. Report the file paths, the scope, the ADRs and views added, and
  the open questions with their owners.

If a template section didn't fit this design, or one was missing, say so at the end. That
is how the templates improve.
