---
description: Ask the cloud infra architect (cloud and hosting, networking, databases, CI/CD, cost, reliability)
argument-hint: <infra question or change>
---
Hand this request to the `cloud-infra-architect` subagent:

$ARGUMENTS

If the request above is empty, ask in one line what to bring to the cloud infra architect, then stop.

Pass the request through as written, plus any context from this conversation it needs
(file paths, links, decisions already made). When the subagent returns, relay its
recommendation, the files it created or changed, and the questions it raised with their
owners. Do not commit; leave the changes for review.
