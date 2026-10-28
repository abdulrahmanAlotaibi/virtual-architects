---
template: change-plan
version: 2
---
<!--
Infrastructure change plan. Owned by the cloud-infra architect. Save as
docs/architecture/designs/solutions/<project>/change-plan.md, next to the HLD it
serves. Never print a secret value; name the variable
or the secret store entry instead. Delete these comments.
-->
---

# Change plan: <change>

| | |
|---|---|
| Design | link to the HLD or ADR that needs it, or "operational" |
| Status | Draft / Agreed / Done / Rolled back |
| Owner | cloud-infra-architect |
| Template | change-plan v2 |

## Requirement

As numbers where possible: traffic, latency, uptime, data size, RPO and RTO, budget.
Defaults stated as assumptions.

## Current state

What runs today, from `docs.infrastructure`, the deployment view and the config, with
references.

## Options

| Option | Cost per month (USD) | Operational load | Failure modes | Migration path |
|---|---|---|---|---|

Assumptions behind the costs:

## Steps

Numbered. Each step: the exact command or file change, how to verify it worked, and how
to undo it.

1.

## Rollback

The whole-change rollback, and the point after which rollback means restoring data.

## Updates in the same change

- [ ] Every diagram and doc the profile's `rules` say an infra change must update (for
      example `diagrams.hand_drawn`, `docs.infrastructure`, a "checked against" date)
- [ ] The deployment view and delivery section, if the project has a diagram pipeline
- [ ] Secrets and env vars listed by name only
- [ ] Questions for the security architect (IAM, exposure) answered
