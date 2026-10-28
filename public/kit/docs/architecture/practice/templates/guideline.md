---
template: guideline
version: 2
---
<!--
Engineering guideline template. A guideline is a Standard in the CSVLOD map, not a Design,
so the solution-design skill does not cover it. Owner: solution-architect, or the
cloud-infra architect for a platform guideline.

It exists so each new guideline does not have to rediscover the house style from the
files beside it. If the folder already holds guidelines, read two before you start
anyway: one heavy on rules, and one split between call-site rules and platform
configuration.

Copy everything below the line into
docs/architecture/standards/guidelines/<lowercase-hyphenated-name>.md, then add a row to
that folder's README.md (create it on the first guideline) and a key to `docs.guidelines`
in docs/architecture/project.yaml, in the same change.

Name the file after a practice, not a technology and not a folder: `api-design`, not
`rest-api`; `api-layering`, not `controllers`. A technology name dates badly and a folder
name is not a rule.
Delete these comments as you fill the template in.
-->
---
title: <Name> Guide
status: Draft
owner: solution-architect
date: <YYYY-MM-DD>
---

# <emoji> <Name> Guide

> **What this is.** One paragraph: what this guideline governs, and the failure it exists
> to prevent. Write the failure concretely. A reader who has met that failure should
> recognize it here.

**Owner:** <team or architect> · **Applies to:** `<the folders it governs>` (`<the stack it assumes, from the profile's stack>`) · **Basis:** `<the primary sources, named with versions>`
* * *
## <Subject> at a glance

| Question | Answer | Where |
| ---| ---| --- |
| <the question a reader arrives with> | <the answer in one line> | §n |

Four to seven rows. This table exists so a narrow question can be answered without
reading the file, so every row is a question someone actually asks.

> 🎯 **The rule this guide is built on:** _one sentence._ If you cannot write it, the
> guideline does not have a spine yet and the sections will not hang together.

> ⚠️ **Scope.** What this guideline does **not** cover, and which guideline does. Name the
> file. A rule stated in two guidelines goes stale in one of them.

> 🚧 **Status.** Only if the guideline rests on a decision the decision maker has not taken. Say
> which decision, which rules change with it, and that the rest hold either way. Delete
> this box when the decision lands and the status moves to Agreed.
* * *
## 1. <The first section>

Numbered sections, `### 1.1` subsections. Number the rules too, and keep the numbers
stable, so a review comment can cite "rule 14" and a reader can find it.

### 1.1 <A subsection>

Open every rule with one line that says how strongly it binds and how a breach is caught:

> **Rule 3** · mandatory · automated: `<the lint rule, type, test or CI step, by name>`

The levels are mandatory, recommended or optional, and automated, reviewed or not
policed, as the EA playbook defines them (section 6.2). A reviewed rule has a box in the
checklist below. A mandatory rule left reviewed says in one line why no tool can check it
yet. `/arch-conform` reads this line to decide what to check and how hard.

Then prose that states the rule and the reason, then the evidence. Every claim about
current code cites `file:line`, read rather than remembered.

#### ✅ Do

```ts
// the right shape, in this project's real idiom, copyable as written
```

#### 🚫 Don't

```ts
// the wrong shape, and ideally one that exists in the repo today
```

> ⚠️ **A trap.** Something that looks correct and is not.

> 🚫 **A prohibition.** Something never done, with the reason.

> ⏱️ **Timing.** Where order matters: before the side effect, after the write.

Callout vocabulary across the set: 🎯 the key rule, ⚠️ a trap, 🚫 a prohibition,
⏱️ timing, ✅ the right way, 🚧 a status or a gap, 📐 a measurement or a limit.

Diagrams are code: a `mermaid` block carrying `%% id:` and `%% caption:` comments, laid
out `flowchart LR`. Never ASCII art. Three diagrams is plenty; each one is a claim you
have to keep true.

## N. Before you open a pull request

A checklist in the same format as the other guidelines, every box citing the rule it
enforces by number. A box a reviewer cannot check by looking is not a box.

```
*   \[ \] <checkable thing> (rule n)
```

## Appendix A: Where today's code breaks these rules

| Where | What | Rule | Status | Fix |
|---|---|---|---|---|

Required, not optional. A rule with no honest record of its breaches is decoration. One
row per breach, with `file:line`. Status is one of: **defect** (to fix), **exemption**
(name the ADR and its trigger to fix), or **not policed**. Fix is the size of the fix (S,
M, L) and, once one exists, the roadmap item that carries it. This table is the backlog
the planning review draws from, so delete a row in the same change that fixes it, and
add rows when `/arch-conform` finds new ones. Close with a short paragraph on what
**does** conform, so nobody "tidies" the parts that are already right.

> **Never record a weakness in a live system here.** Those go to the restricted register
> outside the repo and to the decision maker directly (the profile's
> `data_protection.restricted_register`). A rule gap is fine; an exploit path is not.
