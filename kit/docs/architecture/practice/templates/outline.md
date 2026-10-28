---
template: outline
version: 2
---
<!--
Outline: the business view of a change (Kotusev's CSVLOD "Outlines"; ea-playbook §3).
Owned by the enterprise architect. Write one for a new vendor or any initiative of more
than a few weeks, before the solution architect's HLD. One page, business language, as
few technology names as possible. Save as
docs/architecture/outlines/solutions/<short-title>.md. Demand assessments, RFP responses
and buy vs reuse assessments use it too.
It is archived once the HLD replaces it. Delete these comments.
-->
---

# Outline: <initiative>

| | |
|---|---|
| Status | Draft / Agreed / Replaced by design / Dropped |
| Owner | enterprise-architect |
| Decided by | <decision maker> |
| Capability | the capability it serves or adds (`business.capabilities`) |
| Roadmap item | link, or "not on the roadmap" (then say why it jumps the queue) |
| Template | outline v2 |

## Goal

One sentence: the business outcome, for whom. Then the driver (why now) and the
constraint (what limits the answer), per the motivation chain in the EA playbook.

## Scope

In and out, as bullets.

## Benefit, time, cost

| Benefit | Time to first value | One-off cost | Running cost per month | Team time |
|---|---|---|---|---|

## Options

At least two. Score each 1 to 5; say what a score means if it isn't obvious.

| Option | Functionality | Feasibility | Fit with target | Cost | Notes |
|---|---|---|---|---|---|
| Build | | | | | |
| Buy | | | | | |
| Extend a current vendor | | | | | |

## Recommendation

The option, why, and the trigger that would change it.

## Risks

Business, regulatory (the profile's `regulation`), vendor and delivery risks, each with
a mitigation.

## Next

The design question for the solution architect, and anything the cloud or security
architect must check before the HLD.
