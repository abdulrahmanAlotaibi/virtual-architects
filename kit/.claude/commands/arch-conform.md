---
description: Check code against the Standards and fix the breaches (solution architect)
argument-hint: <branch, diff, folder or file> [fix]
---
Hand this request to the `solution-architect` subagent, to answer as a conformance check
(its "Checking code against the Standards" section):

$ARGUMENTS

If the request names no branch, folder or file, check the current branch against the
default branch. If there is no difference, ask in one line which folder or file to check, then stop.

Pass the request through as written, plus any context from this conversation it needs
(the design the change was built from, exemptions already agreed). Fix breaches only
when the request says `fix` or names which ones. When the subagent returns, relay the
breaches grouped by severity with `file:line` and rule number, what it fixed, the rows it
added to or removed from each guideline's Appendix A, and any check it proposes to
automate. Do not commit; leave the changes for review.
