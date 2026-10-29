# Virtual Architects for the Microsoft 365 Copilot app

The five architects, ready for **Agent Builder** in the Microsoft 365 Copilot app. Each
folder is one agent. Build the ones you want, or only `architecture-board`, which holds
all five.

Generated from the kit by `scripts/build-m365.py`. To change an architect, edit the kit
and rebuild; do not edit these files.

## The quick way: one agent, one upload

`all-in-one/` is the whole team in one skill.

1. In the Copilot app, open **Agents**, then **New agent**. Name it "Architecture Board".
2. **Instructions:** paste the whole of `all-in-one/instructions.txt`.
3. **Skills:** choose **Add**, then **Upload skill**, and upload
   `all-in-one/virtual-architects.zip`. It holds the five architects, the templates and
   the handbook.
4. **Knowledge:** add your filled-in `docs/architecture/project.yaml`, renamed to
   `project.yaml.txt` if the app refuses it.
5. **Create.**

If the agent answers as if it cannot see the files inside the skill (it asks you for a
template, or never names one), use the folders below instead: they give each architect
its own skill and put the templates in knowledge.

## Build an agent per architect

In the Copilot app, open **Agents**, then **New agent**, then:

1. **Name** it after the folder, for example "Solution Architect", and describe it in a
   line, for example "Designs features, APIs and data models, and writes the HLD and LLD".
2. **Instructions:** paste the whole of `instructions.txt`.
3. **Skills:** choose **Add**, then **Upload skill**, and upload each `.zip` in its
   `skills/` folder, one at a time.
4. **Knowledge:** add every file in its `knowledge/` folder. They are plain text, named
   after the kit file they copy (`hld.md.txt` is `hld.md`). Add your filled-in
   `docs/architecture/project.yaml` too, renamed to `project.yaml.txt` if the app refuses
   it: without it the architect only knows the blank profile and has to ask.
5. **Create.**

## What changes outside your repository

In the Copilot app the architects advise in chat. They cannot open your code, write files,
run the export check, or check code against your standards. They give you the file or the
command instead, for you to commit or run. Use Claude Code or GitHub Copilot Chat in VS
Code for the full workflow.

Do not upload secrets, credentials or live security weaknesses: the profile names a
variable, never its value.

## The folders

| Folder | Skills | Knowledge |
|---|---|---|
| `enterprise-architect/` | enterprise-architect | adr.md.txt, ea-playbook.md.txt, outline.md.txt, project.example.yaml.txt, team-handbook.md.txt |
| `solution-architect/` | solution-architect, solution-design | adr.md.txt, guideline.md.txt, hld.md.txt, lld.md.txt, project.example.yaml.txt, team-handbook.md.txt |
| `cloud-infra-architect/` | cloud-infra-architect | adr.md.txt, change-plan.md.txt, project.example.yaml.txt, team-handbook.md.txt |
| `security-architect/` | security-architect | adr.md.txt, project.example.yaml.txt, team-handbook.md.txt, threat-model.md.txt |
| `research-architect/` | research-architect | adr.md.txt, project.example.yaml.txt, questions.yaml.txt, research-brief.md.txt, sources.yaml.txt, team-handbook.md.txt |
| `architecture-board/` | cloud-infra-architect, enterprise-architect, research-architect, security-architect, solution-architect, solution-design | adr.md.txt, change-plan.md.txt, ea-playbook.md.txt, guideline.md.txt, hld.md.txt, lld.md.txt, outline.md.txt, project.example.yaml.txt, questions.yaml.txt, research-brief.md.txt, sources.yaml.txt, team-handbook.md.txt, threat-model.md.txt |
