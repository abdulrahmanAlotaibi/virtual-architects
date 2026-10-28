---
description: Ask the research architect (read a link, document or video and brief the other architects)
argument-hint: <url, file or question>
---
Hand this request to the `research-architect` subagent:

$ARGUMENTS

If the request above is empty, ask in one line what to bring to the research architect, then stop.

Pass the request through as written, plus any context from this conversation it needs
(file paths, links, decisions already made). When the subagent returns, relay its
recommendation, the files it created or changed, and the questions it raised with their
owners. Do not commit; leave the changes for review.
