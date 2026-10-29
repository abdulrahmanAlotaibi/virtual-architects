---
template: threat-model
version: 2
---
<!--
Threat model for a design that is not built yet. Owned by the security architect.
Save as docs/architecture/designs/solutions/<project>/threat-model.md, next to the HLD
it reviews.
This folder is in the repo: it holds threats and planned controls for new designs. A
weakness in a system that is already live never goes here or anywhere public: it goes
to the restricted register (`data_protection.restricted_register` in the profile) and to
the decision maker directly. No exploit steps, ever.
Delete these comments.
-->
---

# Threat model: <feature or flow>

| | |
|---|---|
| Design | link to the HLD |
| Status | Draft / Agreed / Controls built |
| Owner | security-architect |
| Template | threat-model v2 |

## Scope

What is in, what is out, and who uses it (the profile's `users`, plus jobs and providers).

## Assets and data

| Asset or data | Classification | Whose (which kind of user) | Where it lives | Retention |
|---|---|---|---|---|

## Data flow and trust boundaries

The flow from the HLD (its process view), and each trust boundary on the trust-boundary view it crosses, with the
control at the crossing.

## Threats

STRIDE, limited to what is realistic for this product. Likelihood and impact as
Low / Medium / High.

| # | Threat (STRIDE) | Abuse case | Likelihood | Impact | Control | Where (file or resource) | Planned or exists |
|---|---|---|---|---|---|---|---|

## Personal data and compliance

Consent (including a guardian's, for minors), minimisation, cross-border transfer,
retention and deletion, against each entry in the profile's `regulation`; what goes to
each third party in `integrations`. Note any LLM prompt-injection
path through user-supplied content.

## Recommendation

The smallest set of controls that closes the High risks, in order, each handed to an
owner (solution architect for code, cloud architect for IAM and network, enterprise
architect for policy and vendors).

## Open questions

| Question | Owner |
|---|---|
