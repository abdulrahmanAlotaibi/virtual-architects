# EA playbook

How this project practises enterprise architecture. It follows Kotusev's CSVLOD model
(*The Practice of Enterprise Architecture*, 2nd ed., 2021) and his later EA on a Page
framework (2025 to 2026), scaled down to a small team with one decision maker and AI
architect agents. Rules marked *(our choice)* are local decisions, not Kotusev's findings.
Change them when your practice changes.

Kotusev has renamed two things since the 2021 book: "Changes" is now "Solutions" (or
"Products" in product mode), and "Initiative Delivery" is now "Project Implementation".
This playbook uses the new names and means the same thing.

The team that runs it, and its workflow, are in [README.md](../README.md). The
`enterprise-architect` agent reads this first. The profile key `docs.ea_playbook` points
here.

This is a starting point. It ships with the kit and holds no project facts. Edit the
"smallest useful version" columns and the *(our choice)* rules to fit your project.

## 1. Ground rules

1. **EA serves a business goal, never itself.** Every artifact must help a named decision
   this quarter, or it is not written.
2. **Inject, don't add.** EA has no process of its own. It hooks into the moments that
   already exist: planning a feature, signing up a vendor, opening a PR, deploying.
3. **Grow it by use.** Add one artifact at a time, keep it only if it is used, and retire
   it when it is not. Mature practices use 12 to 18 artifacts. A small team needs far
   fewer.
4. **Replace opinion with written options.** The architects supply options, trade-offs
   and a recommendation in writing; the decision maker decides.
5. **Facts and decisions are different documents.** Facts (what exists today) are
   complete, neutral and searchable: the landscapes and inventories. Decisions (what we
   will do) are short, contextual and owned by named people: ADRs and outlines.
6. **Business documents speak business.** Considerations, Visions and Outlines are short,
   visual and free of technology names where possible. Standards, Landscapes and Designs
   can be technical and formal.
7. **Detail fades with distance.** Visions are years out and high level. Designs are
   weeks out and exact. Never detail a future you cannot know yet.
8. **Keep the loops closed.** A cancelled or shipped feature updates the roadmap; a lesson
   from delivery updates a standard; a constraint found in IT goes back to strategy; a
   finished change updates the landscape.
9. **No consultant ceremony.** Borrow a template from a framework only when a real gap
   needs it, and only if the decision maker can keep it alive.
10. **Agreed beats perfect.** A plan the decision maker agreed to and acts on is worth
    more than a better plan nobody owns. Shape every decision document with them; never
    hand them a finished future to sign.

## 2. Structure and governance at a small size

- **One tier, one committee.** A one-tier function has one to several architects who mix
  enterprise and solution work and drive all three processes. Here it is the decision
  maker plus the agents; separate the hats in time, not in people. One "architecture
  committee" covers all four decision types, and that committee is the decision maker.
- **Centralise the non-functional domains** (security, integration, infrastructure) as
  shared standards; shape the functional ones (application, data) around the business
  areas in the profile's `business.capabilities`.
- **Four decisions, one session.** Larger organisations run four committees. Keep the
  four questions and ask them in one regular review, and whenever a change triggers one:

  | Decision | Question | Decides on |
  |---|---|---|
  | Strategy | Does this change where the business is going? | Considerations, Visions, roadmap |
  | Investment | Is it worth the money and time? | Outlines, options, vendor spend |
  | Technology | Does it change the landscape or a standard? | Standards, Landscapes, new vendors |
  | Design | Is this solution built the right way? | Designs, ADRs |

- **Escalate the unplanned.** A design that quietly adds a vendor, a cost or a roadmap
  change is stopped and decided explicitly at the higher level.
- **Expert power, not authority.** Standards hold because the agents check every design
  and PR against them and explain why, not because a committee says so.

## 3. The six artifact types

| Type | Lives | Smallest useful version |
|---|---|---|
| **Considerations** (business rules) | Permanent; revised when the business or a regulation changes | 5 to 7 principles (title, statement, rationale, implications); a short "never" list for the most sensitive data; a glossary of business terms |
| **Standards** (IT rules) | Permanent; changed when technology changes | A one-page technology reference model (adopt, hold, retire per category, at most two choices per category); the engineering guidelines; two or three patterns |
| **Visions** (business structures) | 1 to 3 years; revised yearly or at a strategy change | A capability model shaded by strategic importance; a 12 to 18 month roadmap with each item tagged idea, planned or funded |
| **Landscapes** (IT structures) | Permanent; updated after every change that touches them | Level-1 diagrams only; one vendor and asset inventory (owner, monthly cost, data held, region, direction: invest, keep, retire) |
| **Outlines** (business view of a change) | Weeks to months; archived once a design replaces it, reread for the benefit review after launch | A one-page solution overview and a scored options table for any new vendor or multi-week initiative |
| **Designs** (IT view of a change) | The life of the change, then kept as current-state reference. In product mode (section 15) the product design is permanent | An HLD and an LLD in `designs/solutions/<project>/`, written by the solution architect (`/arch-doc`) from the templates |

How they link: Considerations and Standards are the rules every decision is checked
against. A new direction updates Visions, which start initiatives, which get an Outline,
which is replaced by a Design, which is reviewed against Standards, and when it ships the
Landscapes are updated.

Names are local. Call a type whatever its owner recognises (for example "roadmap" for a
Vision); the CSVLOD type is for the architects.

## 4. Maturity check

| Stage | Marks |
|---|---|
| 0 No architecture | No architects. The roadmap is intuition, projects are ad hoc, technology is whatever the builder picks |
| 1 Solution architecture | Architects inside delivery, templates, the delivery process carries architecture duties |
| 2 IT architecture | Standards, reviews, an IT repository of landscapes, rationalisation |
| 3 Enterprise architecture | Joint strategic planning with the business, roadmaps, investment governance |

Each stage adds one process: stage 1 adds Project Implementation (Outlines, Designs),
stage 2 adds Technology Optimization (Standards, Landscapes), stage 3 adds Strategic
Planning (Considerations, Visions). Stage 2 also means design review with an exemption
procedure, one place for landscape facts, room in the plan for purely technical work, and
tracked architecture debt.

Use the stages to diagnose, not as a ladder to climb. A common next step for a small team
is a light stage 2, in this order: a decision log, the vendor and asset inventory, the
technology reference model, then the roadmap.

## 5. Modelling

Plain Markdown, tables and level-1 diagrams cover most needs. A full modelling language
pays off with many interconnected systems and several architects sharing one repository.
Borrow two ideas for free: the motivation chain (driver, goal, constraint) when writing a
Vision or Outline, and plateaus (tactical first, strategic later) when planning a
migration.

## 6. The repository, type by type

Each folder holds one CSVLOD type. "Fact" means agents may keep it current on their own;
"decision" means it is shaped with the decision maker (section 7).

### 6.1 Considerations (business rules): `considerations/`

| Folder | What goes in it | Owner | Kind | Smallest useful version |
|---|---|---|---|---|
| `strategy/` | Architecture strategies: drivers, objectives, capability gaps, direction, key decisions. One per business area that needs one | enterprise | decision | One page for the area that matters most this year |
| `policies/` | Internal "do" and "never" rules the business chooses | enterprise; security writes data and security policies | decision | A numbered list of 5 to 10 policies, each one line plus a short rationale |
| `regulations/` | External obligations restated as policies, one file per regulation, each rule linked to its source text | enterprise; security for data protection; research supplies the briefs | decision on how we comply; fact on what the law says | One table per regulation: obligation, our policy, where it bites |
| `principles/` | Business principles: statement, rationale, implications | enterprise | decision | 5 to 7 principles; never more than 20 |

Business principles stay technology-neutral. A principle that names a technology is an
IT principle and goes in `standards/principles/`.

### 6.2 Standards (IT rules): `standards/`

| Folder | What goes in it | Owner | Kind | Smallest useful version | How it reaches the code |
|---|---|---|---|---|---|
| `principles/` | IT principles, for example "design for observability" | enterprise, solution consulted | decision | 5 to 10 lines | Each principle names the guideline rules that carry it out. A principle no rule carries out is not working yet |
| `patterns/` | Reusable solutions to recurring design problems: name, context, problem, solution | solution | decision | One pattern per real repeat, no speculative ones | A reference implementation in the repo, cited by `file:line`, that new code copies |
| `guidelines/` | How to build: service design, data, errors, observability, testing. Each rule marked mandatory, recommended or optional | solution | decision | The guides you already follow, written down | Each rule names its enforcement: automated, reviewed or not policed (below). Appendix A lists where code breaks it today |
| `reference-models/` | The technology reference model: per category, current, emerging, unsupported, at most two choices per category. Technology lifecycle roadmaps live here too | enterprise; solution and cloud-infra fill their categories | fact on what is used, decision on direction | One table, one row per category | A dependency check: anything unsupported in the manifests is a finding, or an exemption |

**A Standard is only as strong as its check** *(our choice)*. Every guideline rule names
one enforcement level, strongest first:

| Level | Means | Who catches a breach |
|---|---|---|
| **automated** | A lint rule, a type, a test or a CI step fails on a breach. Name it | The build, on every change |
| **reviewed** | A box on the guideline's pull request checklist | `/arch-conform` and the reviewer |
| **not policed** | Written down, checked by nobody | Nobody. Say so honestly |

A mandatory rule stays **reviewed** only while no tool can check it. When `/arch-conform`
finds the same rule broken in two separate changes, the solution architect proposes the
automated check that would have caught it. That is how a guideline gets stronger over
time instead of longer.

**The breach list is a backlog, not a record** *(our choice)*. Each guideline's
Appendix A, plus `landscapes/tech-debt/`, is the work that brings the code up to its
Standards. At each planning review the solution architect brings the breach count per
guideline and the change since the last review, and proposes the few breaches worth
fixing next as IT roadmap items (section 9, Architectural). A breach that is fixed leaves
the appendix in the same change that fixes it.

### 6.3 Visions (business structures): `visions/`

| Folder | What goes in it | Owner | Kind | Smallest useful version |
|---|---|---|---|---|
| `capabilities/` | The capability model, heatmapped by priority (regular, important, strategic) | enterprise | decision | One capability map with one heat colour per capability |
| `roadmaps/` | Roadmaps of business initiatives, one per business area, each item tagged planned, approved or funded and linked to the capability it lifts | enterprise | decision | One roadmap for the next 12 to 18 months, a dozen items at most |

Never one roadmap for everything: one per business area.

### 6.4 Landscapes (IT structures): `landscapes/`

| Folder | What goes in it | Owner | Kind | Smallest useful version |
|---|---|---|---|---|
| `app/` | Application, integration, context, process and trust-boundary views; the interface catalogue | per view, as set in `diagrams.owns` | fact | Level-1 views only |
| `infra/` | Infrastructure map, deploy pipeline | cloud-infra | fact | One diagram of what runs where |
| `inventory.md` | Asset and vendor inventory: owner, purpose, monthly cost, data held, region, problems, and a direction column (invest, keep, retire) | cloud-infra for the facts; the direction column is a decision taken with the decision maker | fact plus one decision column | One table |
| `tech-debt/` | Architecture debt register: each accepted deviation from a Standard, its cost to fix, its trigger to fix, the ADR that allowed it | solution; cloud-infra for infra debt | fact | One table with five columns |
| `roadmaps/` | IT roadmaps (purely technical initiatives) and asset roadmaps (lifecycle milestones of systems and vendors) | cloud-infra | decision | One table of technical items for the next two quarters |

### 6.5 Outlines (business view of a change): `outlines/`

| Folder | What goes in it | Owner | Kind | Smallest useful version |
|---|---|---|---|---|
| `solutions/` | Solution options and solution overviews. Demand and RFP assessments, buy vs reuse | enterprise | decision | The `outline.md` template, one page |

Outlines are written in business language with a separate section for each reader: the
decision maker reads goal, benefit and cost; the solution architect reads the
architecture sketch.

### 6.6 Designs (IT view of a change): `designs/`

| Folder | What goes in it | Owner | Kind | Smallest useful version |
|---|---|---|---|---|
| `solutions/<project>/` | HLD, LLD, threat model, change plan for one change | solution; security (threat model); cloud-infra (change plan) | decision | A lean design: only the decisions that matter |
| `products/<product>/` | The full-system design of a product | solution | fact for the current structure, decision for its evolution | One HLD-level description kept true |

### 6.7 Decisions: `decisions/`

ADRs: need for the decision, context, decision, justification, consequences. Keep one log
across all types *(our choice)*, and have each ADR name the decision type it serves.

### 6.8 Practice: `practice/`

How the team works: this playbook, the templates, and the research memory (briefs, the
question bank, the reading list). It is not an artifact type.

## 7. Facts and decisions: who may write what alone

| | Facts | Decisions |
|---|---|---|
| Examples | Landscape views, inventory facts, the debt register, the "current" column of the reference model | Policies, principles, strategies, capability heat, roadmaps, outlines, designs, ADRs, the direction column of the inventory |
| Who writes | One agent alone | An agent drafts options; the decision maker chooses; the agent writes it up |
| What makes it good | Accurate and current | Agreed and acted on |
| When value appears | When someone looks it up | While it is being agreed |
| Format | Searchable, complete, generated where possible | Short, readable, easy to discuss |

The rule: **an agent may never write a decision document as if it were agreed.** Until
the decision maker agrees, its status is Draft and it says which options were offered.

## 8. The three processes

| | Strategic Planning | Project Implementation | Technology Optimization |
|---|---|---|---|
| Artifacts | Considerations, Visions | Outlines, Designs | Standards, Landscapes |
| Question | What is changing for the business, and what do we do about it? | What is the best way to meet this need? | What is wrong with the landscape, and how do we improve it? |
| Inputs | The decision maker's plans and the concrete pressures behind them: operational problems, demands from customers, partners and regulators, things that must always work, technical concerns | One need, planned (from a roadmap) or urgent | The current landscape, debt register, the guidelines' breach lists, inventory, incidents |
| Rhythm | A planning review *(our choice: quarterly)*, plus whenever a regulation or vendor shock arrives | Per change: initiation (concept, decision), then realization (design, delivery) | Continuous and opportunistic |
| Lead agent | enterprise | enterprise for initiation, solution for realization | cloud-infra and solution |
| Output | Updated considerations, capability heat, roadmaps | An agreed outline, then a built change | Updated standards, landscapes, an IT roadmap item |

**Close the loops.** Strategy launches initiatives and sets direction for optimization.
Optimization tells delivery what to reuse and what to avoid. The other way: a cancelled
initiative goes back to the roadmap with its reason; a shipped change updates the
landscape; a lesson from delivery updates a guideline; a constraint found by optimization
goes to the next planning review.

**Do not derive plans from slogans.** A mission statement does not tell IT what to build.
Ask for the concrete need, then link it back to the goal it serves.

## 9. Classifying a demand

Every new demand gets one initiative type before work starts. *(Our definitions.)*

| Type | Comes from | Path |
|---|---|---|
| Fundamental | A Consideration (a principle, policy or regulation) | Outline if it costs real money or weeks; ADR always |
| Strategic | A Vision (a roadmap item) | Demand assessment (with an optional outline), HLD, LLD |
| Local | One business area's own need, not on the roadmap | Straight to HLD or build if small; note it on the area's roadmap after |
| Urgent | The environment, unplanned (an incident, a partner deadline, a regulator letter) | Build with a lean design; record the decision; review at the next planning session |
| Architectural | Technology Optimization, no visible business value | IT roadmap item; outline only if it competes with business work for time or money |

Too many urgent items crowding out planned ones is a signal for the planning review, not
a failure.

## 10. Approval, review, exemption, escalation

The decision maker is the one committee; the agents prepare the decision.

| Procedure | What it endorses | Who prepares | Recorded in |
|---|---|---|---|
| Approval | A new decision document (outline, design, policy, roadmap) | the owning agent | Its status field, and an ADR if lasting |
| Amendment | A change to an approved one | the owning agent | The document's change note |
| Exemption | A design that deviates from a Standard for a stated reason | the architect whose design deviates, with the Standard's owner | An ADR and a row in `landscapes/tech-debt/` |
| Escalation | A design-level change that turns out to change strategy, money, a vendor or a Standard | any agent | Stops the design; becomes an outline or an ADR at the higher level |

**Design review.** Before the design decision, a second agent reviews the design against
the principles, policies and Standards: the security architect for anything touching
personal data or trust boundaries, the cloud architect for infrastructure. The author
then supervises the build: it checks PRs against the agreed design and says so when work
drifts.

**Conformance check.** Design review checks a design; `/arch-conform` checks the code.
Run it on a branch before its pull request, or on a folder before you change it. It reads
every guideline, the patterns and the reference model, reports each breach with
`file:line` and the rule number, and fixes the ones you ask it to. A breach you choose to
keep is an exemption (above), never a silent deviation.

**Demand assessment.** An outline, when one was asked for, is decided at the end of initiation: go, no, or not
now. "No" and "not now" go back to the roadmap with the reason.

## 11. Duty of care

*(Our choice. "Duty of care" is not a term Kotusev uses; this is what his findings imply
for advisers who do not decide.)*

Every architect agent owes the decision maker:

1. **Options, not verdicts.** At least two options and one recommendation, with the
   trigger that would change it.
2. **Honesty about evidence.** Facts with a source or `file:line`; guesses labelled as
   guesses; unknowns written as questions.
3. **No decision by default.** Never let a design quietly carry a strategy, money, vendor
   or Standard decision. Escalate it (section 10).
4. **Oversight after the decision.** Watch the build against what was agreed, and say so
   when it drifts.
5. **Facts kept true.** Update the landscapes and inventory you own after every change,
   without being asked.
6. **Timeliness.** A short answer when it is needed beats a complete one later.
7. **Restraint.** Do not create a document nobody asked for or will use.

## 12. Writing for two readers

A business-facing document works only if both the decision maker and the builders can use
it. Check three things before handing it over:

- **Words.** No technical jargon in Considerations, Visions or Outlines. If a term needs
  IT knowledge, replace it with its business effect.
- **Meaning.** Every item connects to something the reader cares about: a capability,
  money, customers, a regulator, a risk.
- **Form.** One page, a simple table or picture. No relationship matrices, no formal
  notation for business readers.

Technical documents (Standards, Landscapes, Designs) can be formal. Show them to the
decision maker only as a simplified page.

## 13. Anti-patterns we refuse

| Anti-pattern | Why it fails | Instead |
|---|---|---|
| Producing a full artifact set at once | Nobody owns it; shelved within months | One artifact at a time, for a named decision |
| Writing a future state on the decision maker's behalf | Plans made without their stakeholder are wishful thinking | Options, their choice, then the document |
| As-is, to-be and gap for the whole company | The whole future cannot be defined; it goes stale | Roadmaps per area; target states only where a decision needs one |
| Framework ceremony (step-wise methods, filling a grid, every viewpoint) | Heavy effort, unreadable plans, disconnected from real decisions | Hook into the moments that already exist (section 8) |
| Relationship matrices and enterprise-wide CRUD tables | Proven unusable | Level-1 views and a simple inventory |
| Organizing the practice around a tool | Tools store facts; they do not create agreement | Plain Markdown and simple views |
| One roadmap for everything | Rarely practical | One per business area |
| Deriving plans from slogans | Strategy text is not actionable | Concrete needs, linked back to goals |
| Climbing maturity stages for their own sake | The stages describe history, not duty | Add the next process only when a decision needs it |

## 14. Is it working?

Kotusev finds no reliable KPI for EA, and value shows over years. So watch usage, per
type, at each planning review *(our choice)*:

| Type | Signal it is used | Signal it is not |
|---|---|---|
| Considerations | Designs and ADRs cite a principle or policy | Nobody cites them for a quarter |
| Standards | The breach count in the Appendix A lists falls from one review to the next; mandatory rules move from reviewed to automated; exemptions are recorded | The breach count only grows; deviations found in code with no exemption; a rule nobody can say how to check |
| Visions | Each build traces to a roadmap item or a stated local or urgent reason | Work appears that no roadmap explains |
| Landscapes | Views match the code; the inventory matches the bills | Stale views; vendors found that the inventory lacks |
| Outlines | Spend and multi-week work had an outline first; benefit reviews happen | Decisions made in chat, no outline |
| Designs | PRs match the agreed design; designs marked Built at ship | Designs never updated after the decision |

Retire any artifact that shows the right-hand signal for two reviews in a row.

## 15. Product mode

Kotusev's 2026 catalogue adds a product mode for teams that evolve one product
continuously instead of running projects. In it:

- **Outlines** become a **product roadmap** (features that serve the business) and
  **increment overviews** (the business view of the next major increment).
- **Designs** become **increment designs**, **product diagrams** kept permanently, and
  **design decisions** (ADRs).

Decide which mode fits and write it here. Until then, use project mode for new vendors,
new capabilities and multi-week initiatives, and keep `designs/products/<product>/`
permanent and current.
