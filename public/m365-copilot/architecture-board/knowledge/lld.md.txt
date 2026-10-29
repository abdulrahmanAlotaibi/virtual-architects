---
template: lld
also_known_as: sad
version: 3
basis: arc42 9.1 (October 2026)
---
<!--
Low-level design template. The LLD *is* the Software Architecture Document (SAD): one
document, two names. Owned by the solution architect; filled in through the
solution-design skill (/arch-doc). To improve it, see README.md in this folder.

Structure: arc42 9.1 sections 1 to 12, unchanged in number and title, plus sections 13 to
16 for what arc42 deliberately leaves out. arc42's own customization guidance (FAQ K-2)
names those three additions: a data view, a user interface view, and a developer guide.
Section 14 exists because arc42 section 5 says outright that it provides no template for
interfaces, and an interface catalogue needs a stricter shape than anything arc42
offers.

arc42 is a template, not a method, and it tells you to write less: "Please don't fill in
everything" and "Dare to leave gaps". Its own stated minimum is five items, not sixteen:
quality scenarios, context and external interfaces, a brief solution strategy, building
block level 1, and the key cross-cutting concepts. Leave a section out on purpose and say
why in one line. Never leave one empty.

Copy everything below the line into docs/architecture/designs/solutions/<project>/lld.md
(full system: designs/products/<product>/lld.md).
Each section is tagged with the scopes that need it: [F] feature, [I] integration,
[S] full system. "Part" means an entry in the profile's diagrams.parts
(docs/architecture/project.yaml). "The profile" is that same file.
Every diagram is code. A diagram is either a ```mermaid block in the document, or a
reference to a view rendered by your diagram pipeline (diagrams.pipeline in the profile).
Never ASCII art, never a hand-drawn SVG, never a picture pasted in.
  - A pipeline view is referenced as an image so it exports as a picture:
    ![PV-08: Order checkout](<relative path>/svg/<rendered-file>.svg)
    The "ID: text" alt text becomes the figure label and caption. A prose link to the
    view's source file exports no picture.
  - A Mermaid block carries its own label and caption as Mermaid comments, so it still
    renders on GitHub and exports as a labelled figure:
        %% id: FIG-1
        %% caption: One sentence stating the same claim as the drawing.
  - Lay flowcharts out wide (`flowchart LR`), not tall. A tall diagram prints unreadably
    small on A4.
Export with docs/architecture/tools/export.py; `--check` enforces the rules above.
Cite file:line for every claim about current code. Delete these comments as you fill the
template in.
-->
---
title: "LLD / SAD: <title>"
status: Draft
owner: solution-architect
date: <YYYY-MM-DD>
template: lld v3 (arc42 9.1)
---

# LLD / SAD: <title>

<!-- status: Draft | In review | Agreed | Built | Archived. Flat keys only in the front
matter above: the exporter reads it without a YAML library and renders it as the
document's metadata table. -->

| | |
|---|---|
| HLD | ./hld.md |
| Scope | Feature / Integration / Full system |
| Verified against code | <date>, <commit> |
| Sections left out | the numbers, and one line on why |

> **How this relates to the HLD.** The HLD decides; this document describes. The HLD
> carries the business case, the regulatory answer and the options that were weighed for
> one change. This document is the architecture of the system as built. Where the two
> would say the same thing, this document says it and the HLD points here with
> "see SAD §n". Never restate the HLD.

> **Template basis.** Sections 1 to 12 follow the arc42 template by Gernot Starke and
> Peter Hruschka (<https://arc42.org>), used under CC BY-SA 4.0. Sections 13 to 16 are
> additions to arc42 made by this template.

## 1. Introduction and goals  [F I S]

What the system does, for whom, and the handful of qualities that drive its architecture.

### 1.1 Requirements overview
The functional core in a short list or table. For a feature: what this change makes
possible. Link the HLD rather than restating its business case.

### 1.2 Quality goals
The top three to five architecture qualities, as **measurable scenarios**, not adjectives.
A scenario has a stimulus, the system's response, and a number: "a signed-in customer
opening their order history with 200 orders sees it rendered in under 2 seconds on a 4G
connection". Three to five. Not ten.

### 1.3 Stakeholders
| Role | Expects from this document |
|---|---|

From the profile's `users`, plus whoever maintains and buys the system. This table is what
decides which sections you fill, so write it first.

## 2. Constraints  [F I S]

One list, grouped: technical (the profile's `stack` and `hosting`), organizational (team
size, budget, timeline), and regulatory and convention (the profile's `regulation` and
`rules`). A constraint is something the design may not change. If it can be changed, it is
a decision, and it belongs in §9.

## 3. Context and scope  [F I S]

### 3.1 Business context
The system as one box, with the people and the external systems around it, and what flows
across each edge in business terms. Draw as the `context_map` or `logical_view` part.

### 3.2 Technical context
The same edges as protocols, channels and formats: HTTP, webhook, signed URL, scheduled
call, database wire protocol. Map each business edge to its technical channel.

### 3.3 External interfaces
The short list of interfaces this document covers, by id from the `interface_catalogue`
part. Specified in §14; do not specify them here.

## 4. Solution strategy  [F I S]

The founding decisions, in half a page: the technology choices, the top-level
decomposition, how the quality goals in §1.2 are achieved, and the organizational
approach. Each line links an ADR in §9 or states that it predates the ADR log. This
section exists so a reader never has to infer the strategy from the building blocks.

## 5. Building block view  [F I S]

### 5.1 Level 1: the whitebox
The system decomposed into its bounded contexts (`business.contexts`, the `context_map`
part): the box, its responsibility in one sentence, and its interfaces. One table row per
context, plus the diagram.

### 5.2 Level 2: the contexts this design touches
For each, a blackbox table of its modules and services, then a whitebox for the ones that
change. Per service function: the signature, its injected dependencies as the project
wires them (`stack.backend`, and your dependency injection guideline if you have one),
what it decides, and what it calls. Code signatures, not prose. Skip what a service doc in `docs.service_docs`
already covers and link it.

### 5.3 Level 3
Only where the detail is load bearing and the code does not make it obvious. Usually
empty. Say so.

## 6. Runtime view  [F I S]

A sequence or activity diagram per important scenario, each linked to its process view
(`process_views` part). Cover, at a minimum: the main success path, every failure and
retry path, and the operation and administration scenarios (start-up, a scheduled job, a
migration, an incident). A flow worth keeping goes into the pipeline as a process view; a
sketch only this document needs can be a Mermaid block.

## 7. Deployment view  [F I S]

Owned by the cloud-infra architect (`diagrams.owns`). Propose changes; do not edit their
views.

### 7.1 Infrastructure level 1
The physical diagram: the `deployment_view` part, showing nodes, channels, locations and
regions, and which building block from §5 is deployed on which node. Repeat this section
per environment where they differ (the profile's `config` names them).

### 7.2 Machine resources
Required, not optional. One row per node in §7.1.

| Node | Runtime and region | CPU | Memory | Concurrency | Min and max instances | Storage or tier | Scaling limit that bites first | Monthly cost |
|---|---|---|---|---|---|---|---|---|

Resources are a claim about live infrastructure, so each row cites either the
infrastructure as code that sets it or the read-only command that shows it
(`hosting.check_live_state`). Name the limit that bites first (request timeout, connection
cap, connector throughput, document size), because that is the number that decides whether
this design survives growth. arc42 gives this table a home but no schema; this shape is
ours.

### 7.3 Mapping of building blocks to infrastructure
The table that ties §5 to §7.1, so a reader can go from a service to the thing it runs on.

## 8. Cross-cutting concepts  [F I S]

The concepts that apply across building blocks, written once here instead of repeated in
each one. arc42's warning applies: do not attempt to cover every topic. Each row links the
guideline in `docs.guidelines` and says only what is specific to this system.

| Concept | Where the rule is written (`docs.guidelines`), or "none yet" | This system's specifics |
|---|---|---|
| Domain model and ubiquitous language | service design | |
| Data governance and classification | data modeling, and the HLD data governance section | |
| Persistence | data modeling | |
| API shape and versioning | | |
| Error handling | error modeling | |
| Authentication and authorization | `docs.auth` | |
| Security and secrets | | |
| Observability: logs, traces, metrics | observability | |
| Communication: synchronous or asynchronous | | |
| Dependency injection and testability | testing | |
| Internationalization and text direction | the profile's `languages` | |
| Binary and media handling | | |
| Build, deploy and release | the profile's `hosting.delivery` | |

## 9. Architecture decisions  [F I S]

An index of the ADRs in `docs/architecture/decisions/` that govern this system or this
change, newest first, with status (proposed, accepted, deprecated, superseded). The
decision itself lives in the ADR. Avoid redundancy: §4 summarizes the founding decisions
and points here.

## 10. Quality requirements  [F S]

### 10.1 Quality tree
The quality attributes that matter, refined into branches. The top three to five appear in
§1.2; the rest live here.

### 10.2 Quality scenarios
| Id | Attribute | Scenario (stimulus, response, measure) | How it is verified |
|---|---|---|---|

A scenario with no measure is an opinion. A scenario with no verification is a wish.

## 11. Risks and technical debt  [F I S]

Ranked, each with its mitigation and owner. Link the `findings` part and
`landscapes/tech-debt/`, which stay authoritative; this is the index, not a second
register.

> **Never record a weakness in a live system here.** Those go to the restricted register
> outside the repo and to the decision maker directly
> (`data_protection.restricted_register`).

## 12. Glossary  [F I S]

Terms that mean something specific here, in every one of the profile's `languages` where
the term is user facing. One meaning per term. Where the same word means different things
in two contexts, say both and name the contexts (the service design guideline's rule).

## 13. Data view  [F I S]

arc42 has no data section; most systems need one.

For each collection or table: the schema as code in the project's data layer
(`stack.database`), with fields, types, required, defaults, indexes, and the owning context
from §5.1. Then, per field that holds personal data: its classification, lawful basis and
retention, per the data modeling guideline and the HLD's data governance section.

Normalization: the logical model to third normal form, then each denormalization named
explicitly with the invariant it breaks, the code that maintains that invariant, and how
drift is detected.

Migration: what writes this data today, how existing records change, how writes cut over
without downtime, and how to roll back.

## 14. Interface and API contracts  [F I S]

arc42 says outright that it offers no template for interfaces. This is ours.

### 14.1 Provided interfaces
Per route: method and path, the role allowed and the object-level check, the request body
and query with validation, the response shape, pagination, idempotency, caching, and every
error reason with its HTTP status. Follows your API design and error modeling guidelines.
Keep in step with the `provided_interfaces` part.

### 14.2 Consumed interfaces
One row per interface id from the `interface_catalogue` part, then, for each, the full
specification in the shape of the `interface_specifications` part: system, status,
interface id, capability, components, pattern and protocol, authentication and
configuration, service levels (timeout, retries, idempotency), data exchanged and its
classification, error handling, observability, verification, risks and constraints.

### 14.3 Adapters
Where each provider sits behind a port (`stack.backend`), how it is called, and the fake
the tests use instead.

## 15. User interface view  [F S]

Pages, components, shared state and hooks, the client API service (`stack.frontend`),
loading and error states, and the new strings in every one of the profile's `languages`.
Check text direction where a language is RTL. Cite `docs.design_system` for every visual
choice.

## 16. Build, test and rollout  [F I S]

### 16.1 Tests
What each test proves, at which level, and how it replaces its dependencies
(`stack.testing`, the testing guideline). Every test hermetic: no network, no clock, no
shared database, no ordering dependence.

### 16.2 Observability in place
| Event | Level | When | Fields |
|---|---|---|---|

Named and logged per the observability guideline and `data_protection.log_rules`: before
the side effect, identified by user id, no personal data or tokens. Name the metric, saved
query or dashboard the guideline asks for.

### 16.3 Rollout
Files to change, in order. Flags, data backfill, the deploy sequence, how to verify in
production, how to roll back. The `watch` entries to add in `diagrams.manifest`.

## S. Full-system index  [S]

For a full-system fill, §5.1 is the index: one row per bounded context with its services,
its service doc, its collections, its routes, and the interface specifications it owns.
Link the existing docs; do not repeat them. Write §5.2 in depth for one context only when
asked.
