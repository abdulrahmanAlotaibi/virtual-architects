---
description: Convene the architecture board on a question that crosses lanes
argument-hint: <idea, decision or change>
---
Convene the architecture board on this request:

$ARGUMENTS

If the request above is empty, ask in one line what to bring to the board, then stop.

1. If the request includes a link, document or video, run the `research-architect`
   subagent on it first and give its brief to the others.
2. Pick the architects whose lane it touches, from `enterprise-architect`,
   `solution-architect`, `cloud-infra-architect` and `security-architect`. Say which you
   picked and why in one line. Run them in parallel, each with the full request and the
   research brief.
3. Merge their answers into one reply: the recommendation, where they disagree and why,
   the decision this needs (strategy, investment, technology or design, per
   the EA playbook named in `docs/architecture/project.yaml`), and the next step with its
   owner.
4. Record open questions in `docs/architecture/practice/research/questions.yaml`. Do not commit;
   leave the changes for review.
