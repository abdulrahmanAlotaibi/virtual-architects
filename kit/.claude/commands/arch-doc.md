---
description: Write the HLD and LLD for a feature, an integration, or the full system (solution architect)
argument-hint: <feature | integration | system> <what to design>
---
Hand this request to the `solution-architect` subagent, to answer with its
`solution-design` skill (`.claude/skills/solution-design/SKILL.md`):

$ARGUMENTS

If the request above is empty, ask in one line what to design (a feature, an
integration, or the full system), then stop.

Pass the request through as written, plus any context from this conversation it needs
(file paths, links, an existing Outline, decisions already made). When the subagent
returns, relay the scope it chose, the file paths, a few lines on the design, the ADRs
and views it added, the questions for the other architects, and any template gaps it
reported. Do not commit; leave the changes for review.
