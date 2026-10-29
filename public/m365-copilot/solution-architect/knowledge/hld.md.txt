---
template: hld
version: 4
---
<!--
High-level design template. Owned by the solution architect; filled in through the
solution-design skill (/arch-doc). To improve it, see README.md in this folder.

The HLD decides. The LLD / SAD (lld.md, structured on arc42) describes the system as
built. Where the two would say the same thing, the SAD says it and the HLD points at it
with "see SAD §n". An HLD that restates the SAD is a defect.

Copy everything below the line into docs/architecture/designs/solutions/<project>/hld.md
(full system: designs/products/<product>/hld.md).
Each section is tagged with the scopes that need it: [F] feature, [I] integration,
[S] full system. Drop sections your scope doesn't need, and say in §0 which and why.
Don't leave them empty.
"Part" means an entry in the profile's diagrams.parts (docs/architecture/project.yaml);
"the profile" is that file.
Target length: two or three pages for a feature. If it runs longer, the detail belongs in
the SAD.

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
Delete these comments as you fill the template in.
-->
---
title: "HLD: <title>"
status: Draft
owner: solution-architect
date: <YYYY-MM-DD>
template: hld v4
---

# HLD: <title>

<!-- status: Draft | In review | Agreed | Built | Archived. Flat keys only in the front
matter above: the exporter reads it without a YAML library and renders it as the
document's metadata table. -->

## 0. Document control  [F I S]

| | |
|---|---|
| Scope | Feature / Integration / Full system |
| Reviewers | the architects named in §12 |
| Outline | link to the enterprise architect's outline, or "none" |
| SAD | ./lld.md, or the system SAD this change changes |
| Verified against code | <date>, <commit> |
| Sections left out | the numbers, and one line on why |

## 1. Purpose  [F I S]

Why this change, in business terms, in one short paragraph plus three bullets. A reader who
knows nothing should finish this section able to say what gets better and for whom.

- **The demand:** what changes for which users (the profile's `users`). For an integration:
  the capability we need from the provider and why we are not building it. For the full
  system: what the system is for.
- **The capability it serves:** the `capability_map` part, or an entry in
  `business.capabilities`.
- **In scope / out of scope:** two short lists. Out of scope is the more useful one.

## 2. Audience  [F I S]

| Reader | The decision or action this document has to support |
|---|---|

Who this is written for, and what each of them needs out of it. Write this before you
write anything else: it is what decides which sections you fill and how deep they go. A
document written for everyone is written for nobody. If the only reader is the decision
maker (`project.decision_maker`), say so, and keep the whole thing short.

## 3. Constraints  [F I S]

What this design may not change. One table, grouped. If something can be changed, it is
not a constraint, it is a decision, and it belongs in §12.

| Kind | Constraint | Source |
|---|---|---|
| Technical | | the profile's `stack`, `hosting` |
| Organizational | team size, budget, the date it is needed | the profile's `project.team` |
| Regulatory | | the profile's `regulation` |
| Convention | | the profile's `rules`, `docs.guidelines` |

Also state the **volume**: users, requests, data size, growth. A design with no numbers
cannot be judged.

## 4. Architecture overview and pillars  [F I S]

### 4.1 Pillars
The three to five standing commitments this design rests on, each in one line, each with
what it costs. These are the load-bearing choices a reader must accept before the rest
makes sense: for example "one deployable with clean module boundaries, because a small team
cannot operate a fleet", or "the provider stays behind a port, so it can be replaced
without touching the domain". The profile's `business.bias` is the first place to look.

### 4.2 Principles and standards check
Each principle (`principles` part) and each guideline (`docs.guidelines`) this design
touches, and whether it complies. A deviation is an exemption: it needs an ADR in §12 and
a row in the architecture debt register. An unrecorded deviation is a defect.

### 4.3 Bounded contexts
The contexts involved and how they relate, per the service design guideline
(`docs.guidelines.service_design`). Show the delta to the `context_map` part, or to
`business.contexts`. Name any term that means different things in two contexts.

## 5. Logical view  [F I S]

The logical diagram: components across client, back end and external systems, drawn as the
`logical_view` part with the new or changed boxes marked. A feature shows only the layers
it touches, as a delta. The full system shows the view itself plus its layer descriptions.
One diagram, legible on one screen. Detail goes to SAD §5.

Reference the rendered view as an image, or draw the delta as a `mermaid` block with an
`%% id` and `%% caption`. Not ASCII.

## 6. Main flows  [F I S]

One line per flow, each referencing a process view (`process_views` part) as an image, or
a `mermaid` sequence. A new flow that should outlive this design gets a new view. Feature:
the user journeys. Integration: call, callback, failure and retry. Sequences and failure
paths in full belong in SAD §6, not here. The experience around a journey, its states
and its wording, is §14.

## 7. Data governance  [F I S]

The section a regulator, an auditor or a customer's security review would ask for. Fill the
table for every data entity this design creates, reads, or sends anywhere. One row per
entity, no exceptions, no "various".

| Entity | Data subject | Class | Lawful basis | Owner | Retention, and from which event | Stored where, and in which country | Who may read it | How it is deleted |
|---|---|---|---|---|---|---|---|---|

- **Class** uses the project's data classification scheme (the data modeling guideline,
  `docs.guidelines.data_modeling`). If a customer or a law in the profile's `regulation`
  imposes its own scheme, say which one applies and map to it. The most sensitive data is
  named in `data_protection.most_sensitive`.
- **Lawful basis** under the data protection law in the profile's `regulation`. Where the
  basis is consent, it is per purpose, and withdrawing it must be as easy as giving it.

### 7.1 Consent for people who cannot give it themselves
If any data subject cannot consent on their own (a child, or anyone the law treats as
lacking legal capacity; see the profile's `users`), say how the person consenting for them
is verified at consent time, and how the data subject takes over their own rights when the
law lets them. If this design does not touch consent, say so in one line.

### 7.2 Cross-border transfer
Does any personal data in §7 leave the country or region where it must stay (the profile's
`hosting.residency_note`)? For each flow that does: the recipient, the country, the legal
route relied on under the law in `regulation`, the safeguard, and whether any transfer risk
assessment that law requires has been done and dated **before** the transfer. Backups,
snapshots and object versions are transfers too. "No personal data leaves" is a valid
answer; prove it.

### 7.3 Impact assessment
Does this design trigger a documented data protection impact assessment under the law in
`regulation`? Large-scale processing, sensitive data, and processing of people who lack
full legal capacity are the usual triggers. If one is needed and does not exist, that is a
blocker, not a risk.

### 7.4 Rights, breach and records
What this design changes about: answering data subject rights requests inside the deadline
the law sets, notifying the regulator of a personal data breach inside its deadline, and
the record of processing activities. Usually "nothing"; say so rather than skipping it.

## 8. Authentication and authorization  [F I S]

### 8.1 Actors and trust
Who or what calls this, and how each one is identified: a signed-in user, a job key, a
provider webhook, an anonymous visitor.

### 8.2 Role to resource matrix
| Role | Resource | Operations | Object-level predicate |
|---|---|---|---|

The last column is the one that matters and the one usually missing: *which records*, not
just which verbs. "Own orders" is a predicate; "orders" is not. The profile's
`data_protection.abuse_cases` are the rows that must be impossible.

### 8.3 The rule for every new route
For each route this design adds: the role check, the object-level check, and where each is
enforced. Deny by default.

### 8.4 Tokens and sessions
Token kind, lifetime, refresh and revocation. Where tokens are stored on the client. Cite
the current standards, not the obsolete ones: NIST SP 800-63B-4 for session lifetime and
password rules, RFC 9700 for OAuth security, RFC 8725 for JWT. OAuth 2.1 is still a draft;
do not cite it as a standard.

### 8.5 Client guards
What the client hides, and the matching server check for each.

> **Server-side enforcement is the control. A client route guard is a convenience.** Any
> design whose authorization story lives in the client is not yet designed.

## 9. Cybersecurity  [F I S]

One page. Not an audit workbook.

**Posture header:** which control sets this design is *bound by*, which it is *measured
against by choice*, and which you *watch* in case a customer changes the answer. Take them
from the profile's `regulation`, where each entry's `binding` says which kind it is. A
customer contract that would make a new control set binding is a decision to escalate, not
a design detail.

| Control family | Source and id | What this design does about it |
|---|---|---|

Rows to cover at a minimum: identity and access management, data protection in transit
and at rest, cryptography and key management, logging and monitoring with its retention
period, vulnerability and patch management, secure development and change control,
third-party and cloud security, backup and recovery, incident response, and what personal
data may reach an AI provider. Say "not touched by this design" where that is true.

## 10. Integration architecture  [F I S]

### 10.1 Interface catalogue delta
| Interface | Provider to consumer | Pattern, protocol | Classification | Status |
|---|---|---|---|---|

Rows use the ids in the `interface_catalogue` part, or the profile's `integrations`. A new
integration gets the next id, its place on the `integration_view`, and a row here. The
full specification goes in SAD §14.2, not here.

### 10.2 Synchronous or asynchronous
For each new interface: which, and why, against your communication patterns guideline if
you have one. Timeouts, retries, idempotency and what happens when the provider is down,
in one line each.

### 10.3 Trust boundaries
Which boundary each interface crosses on the `trust_boundary_view`, and the classification
of the data crossing it. Owned by the security architect: propose, do not edit.

## 11. Deployment impact  [F I S]

Changes to anything in the profile's `hosting`: compute, network, database, storage,
schedulers, secrets, env vars, egress. Against the `deployment_view` part and
`docs.infrastructure`. New or changed machine resources go in the SAD §7.2 table. "None"
is a valid answer; say so explicitly.

## 12. Qualities, risks and decisions  [F I S]

- **Qualities:** performance, security, reliability, operability after go-live, cost. One
  line each, with a number where a number exists. The measurable scenarios live in
  SAD §10.
- **Risks:** what could go wrong, how likely, and the mitigation. Link the `findings` part
  entries this design adds or clears. Never write down a weakness in a live system; those
  go to the restricted register and the decision maker
  (`data_protection.restricted_register`).
- **Decisions:** each choice with lasting impact as an ADR in `docs/architecture/decisions/`,
  options compared in a table. List them here; do not restate them.
- **Handoffs:** the named question for each other architect. Cloud-infra for resources,
  cost and residency. Security for threat model and controls. Enterprise when a vendor,
  a capability, a cost or a regulatory answer changes.

## 13. Rejected alternatives  [F I S]

At least one, with why it lost. An option that was never real does not count. If the
decision was close, say so, and say what would change it.

## 14. User experience view  [F S]

The experience this design commits to, not the screens. Pages, components and strings go
in SAD §15.

- **Who, and what for:** one line per actor in §8.1, naming what it comes here to do and
  the flow in §6 that serves it. Take the actors from the profile's `users`.
- **Entry points:** where the user arrives from, and what they meet when they arrive
  signed out, without context, or without the role §8.2 requires.
- **States this design has to handle:** empty, loading, partial, failed, offline and
  refused. A state nobody designed is still a state the user reaches.
- **What the user is told:** the wording for each refusal in §8 and each failure path in
  §6, in the user's own language, and without disclosing why it was refused.
- **Language and direction:** every language in the profile's `languages`, which one is
  primary, and the text direction each needs. Where a language is right to left, say what
  that constrains.
- **Accessibility:** the standard this design is held to, and anything in it already known
  to strain that standard.
- **Design system:** cite `docs.design_system` for every visual and interaction choice. A
  pattern the system does not have yet is a decision, and belongs in §12.

Draw a new journey as a process view (`process_views` part), or as a `mermaid` block with
an `%% id` and `%% caption`. Not ASCII.
