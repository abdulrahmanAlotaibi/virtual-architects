---
description: Ask the solution architect (feature design, APIs, data models, design review)
argument-hint: <feature, plan or branch to review>
---
Hand this request to the `solution-architect` subagent:

$ARGUMENTS

If the request above is empty, ask in one line what to bring to the solution architect, then stop.

Pass the request through as written, plus any context from this conversation it needs
(file paths, links, decisions already made). When the subagent returns, relay its
recommendation, the files it created or changed, and the questions it raised with their
owners. Do not commit; leave the changes for review.
