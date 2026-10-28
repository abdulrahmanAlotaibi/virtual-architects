// The workflow as data: nodes on a 2-column grid (main path, side branch), edges between anchors, and the
// scenarios the animated pipeline can walk.

export type Anchor = "t" | "b" | "l" | "r";

export type FlowNode = {
  id: string;
  col: 1 | 2;
  row: number;
  kind: "start" | "step" | "decision" | "you" | "end" | "stop";
  label: string;
  title: string;
  who: string;
  command?: string;
  output?: string;
  type?: string;
  text: string;
  // A step that is really two nodes working at the same time. It is not drawn itself;
  // its members light up together and the narration uses this node's words.
  members?: string[];
  // A step you can skip: drawn dashed with an "optional" tag.
  optional?: boolean;
  // Criteria shown as a list under the text, for decisions with several triggers.
  checks?: string[];
};

// side "l" puts the label on the left of the line, where the right side is busy.
export type FlowEdge = { from: string; to: string; a: Anchor; b: Anchor; label?: string; side?: "l"; back?: boolean };

export type Answer = { a: string; why?: string };

export type Scenario = {
  id: string;
  label: string;
  hint: string; // one line under the tab: what this input looks like
  note: string;
  path: string[];
  // What was decided at each decision node on this path.
  answers: Record<string, Answer>;
};

export const nodes: FlowNode[] = [
  { id: "idea", col: 1, row: 1, kind: "start", label: "Requirement, purchase, idea or question",
    title: "What comes in", who: "You",
    text: "Every change enters here, through you, in one of four forms. The form decides the route it follows and the first document it produces.",
    checks: [
      "A business requirement: a requirements document such as a BRD or BRSD, or a user story",
      "A purchase: an RFP, a licence, a subscription or a vendor contract",
      "An idea or a doubt: a feature someone suggested, a letter from a regulator, a design that feels wrong",
      "A plain question: is this vendor available in our region, should this call be sync or async",
    ] },
  { id: "read", col: 1, row: 2, kind: "decision", label: "Something to read?",
    title: "Is there a source to read first?", who: "The main session",
    text: "Where the work rests on an unread source, a link, a document, a vendor page or an open question, research establishes the facts before any design begins." },
  { id: "research", col: 2, row: 2, kind: "step", label: "Research brief",
    title: "Research brief", who: "Research architect", command: "/arch-research <link>",
    output: "practice/research/<date>-<topic>.md", type: "Fact",
    text: "The factual record for one source: a summary, what it means for each architect, its questions with one owner each, and fact kept apart from vendor claim. The question bank is read first, so nothing is answered twice." },
  { id: "big", col: 1, row: 3, kind: "decision", label: "A purchase or real budget?",
    title: "Does it need a demand assessment?", who: "The main session",
    text: "Reserved for purchases and projects with a real budget. Difficulty does not trigger it: a new integration, a complex feature or an SAD amendment is design work and goes straight to the HLD. Your assessment is required where any of these holds:",
    checks: [
      "It buys anything, however small: a licence, a subscription, a vendor contract or a paid service",
      "It needs a real budget: new infrastructure or extra people",
      "It takes more than a few weeks of the team's time",
      "It competes with other planned work for the same money or people",
      "It commits you to something hard to undo: a long contract, a new platform or a migration",
    ] },
  { id: "outline", col: 2, row: 4, kind: "step", label: "Outline with options", optional: true,
    title: "Outline with options (optional)", who: "Enterprise architect", command: "/arch-enterprise <idea>",
    output: "outlines/solutions/<title>.md", type: "Outline",
    text: "The options paper, for the person who decides: the goal, the scope, the benefit, time and cost, then at least two options scored on function, feasibility, fit and cost, with a recommendation and its risks. Omitted where the choice is settled." },
  { id: "decide1", col: 2, row: 5, kind: "you", label: "You: demand assessment",
    title: "Demand assessment", who: "You",
    text: "Your assessment of the demand: worth doing, the right time, the right cost. Go, no, or not now, taken against the outline where one was requested and recorded with its reasoning, so nobody has to infer it later." },
  { id: "dropped", col: 2, row: 6, kind: "stop", label: "Back to the roadmap",
    title: "Dropped, with a reason", who: "Enterprise architect", output: "visions/roadmaps/", type: "Vision",
    text: "A no or a not now returns to the roadmap with its reasoning attached, so it is not argued again from nothing next quarter." },
  { id: "hld", col: 1, row: 7, kind: "step", label: "HLD",
    title: "High-level design (HLD)", who: "Solution architect", command: "/arch-doc feature <what>",
    output: "designs/solutions/<project>/hld.md", type: "Design",
    text: "The decision document, two or three pages for a feature. Why the change, who it is for, what it may not change and the few choices it rests on. Then the logical view, how personal data is governed, who may see what, the security controls and the integrations, with named questions for cloud and security." },
  { id: "threat", col: 1, row: 8, kind: "step", label: "Threat model",
    title: "Threat model", who: "Security architect", command: "/arch-security threat model for <what>",
    output: "designs/solutions/<project>/threat-model.md", type: "Design",
    text: "The security assessment: the assets and the data they hold, the flows and trust boundaries from the HLD, the threats ranked by severity with a named control and owner each, and personal data against the regulation that applies." },
  { id: "change", col: 2, row: 8, kind: "step", label: "Change plan",
    title: "Change plan", who: "Cloud and infra architect", command: "/arch-cloud-infra plan for <what>",
    output: "designs/solutions/<project>/change-plan.md", type: "Design",
    text: "Only where infrastructure moves: the requirement, the current state, the options, the ordered steps with their cost, and the rollback. Its sizings feed the design's machine table. You run the commands, never the architect." },
  { id: "parallel", col: 1, row: 8, kind: "step", label: "Threat model and change plan", members: ["threat", "change"],
    title: "Threat model and change plan, at the same time", who: "Security and cloud architects",
    command: "/arch-security · /arch-cloud-infra", output: "threat-model.md · change-plan.md", type: "Design",
    text: "Both are drawn from the same HLD, so neither waits on the other. Security ranks the threats in its flows and access rules. Where infrastructure moves, cloud sets out the steps, the cost and the rollback." },
  { id: "lld", col: 1, row: 9, kind: "step", label: "SAD and ADRs",
    title: "Software architecture document (SAD) and decisions", who: "Solution architect, with each lane's ADRs",
    output: "lld.md · decisions/NNNN-<title>.md", type: "Design",
    text: "The low-level design, a software architecture document on the open arc42 structure: building blocks, runtime, deployment, data, every API contract, the screens, and how it is tested and rolled out. Machine sizes and costs are required with proof. Each architect records the lasting decisions in its own lane as ADRs: design from solution, security from security, infrastructure from cloud, anything that binds more than one system from enterprise." },
  { id: "decide2", col: 1, row: 10, kind: "you", label: "You: design decision",
    title: "Design decision", who: "You",
    text: "Your decision, read in the repository or exported to PDF. Approve, return for changes, or grant an exemption. Changes re-enter at the HLD. An exemption is an ADR and a row in the architecture debt register, never a silent shortcut." },
  { id: "build", col: 1, row: 11, kind: "step", label: "Build",
    title: "Build against the standards", who: "You and your tools",
    text: "Your team implements the approved design against your guidelines, each marked Agreed or Draft so it is clear which are enforced. The solution architect reviews the work and reports where it departs from what was agreed." },
  { id: "pr", col: 1, row: 12, kind: "step", label: "Pull request",
    title: "Pull request, checked against the design", who: "Solution architect, and a CI check", command: "export.py --all --check", type: "Landscape",
    text: "The solution architect reviews the pull request against the approved design. A workflow verifies that every document still exports and every diagram is code, in Mermaid or your pipeline, never ASCII art." },
  { id: "ship", col: 1, row: 13, kind: "end", label: "Ship and close the loop",
    title: "Ship", who: "Everyone", type: "Landscape",
    output: "exports/<path>.html · .pdf · .docx",
    text: "The landscapes are brought up to date, the open questions closed, the design marked Built. The HLD and the SAD export to HTML, PDF or Word for anyone who does not read Markdown. A template that did not fit is corrected for next time." },
];

export const edges: FlowEdge[] = [
  { from: "idea", to: "read", a: "b", b: "t" },
  { from: "read", to: "research", a: "r", b: "l", label: "yes" },
  { from: "read", to: "big", a: "b", b: "t", label: "no", side: "l" },
  { from: "research", to: "big", a: "b", b: "t" },
  { from: "big", to: "outline", a: "r", b: "t", label: "yes" },
  { from: "big", to: "hld", a: "b", b: "t", label: "no" },
  { from: "outline", to: "decide1", a: "b", b: "t" },
  { from: "decide1", to: "dropped", a: "b", b: "t", label: "no, not now" },
  { from: "decide1", to: "hld", a: "l", b: "t", label: "go" },
  { from: "hld", to: "threat", a: "b", b: "t" },
  { from: "hld", to: "change", a: "b", b: "t", label: "if infra moves" },
  { from: "threat", to: "lld", a: "b", b: "t" },
  { from: "change", to: "lld", a: "b", b: "t" },
  { from: "lld", to: "decide2", a: "b", b: "t" },
  { from: "decide2", to: "build", a: "b", b: "t", label: "approve" },
  { from: "decide2", to: "hld", a: "l", b: "l", label: "changes", back: true },
  { from: "build", to: "pr", a: "b", b: "t" },
  { from: "pr", to: "ship", a: "b", b: "t" },
];

export const scenarios: Scenario[] = [
  { id: "requirement", label: "Business requirement", hint: "A BRD, a BRSD or a user story",
    note: "A requirements document asks for members to pause their subscription for up to three months. Nothing to read and nothing to buy, so it goes straight to design.",
    path: ["idea", "read", "big", "hld", "threat", "lld", "decide2", "build", "pr", "ship"],
    answers: {
      read: { a: "no", why: "The requirements document and the code are the sources." },
      big: { a: "no", why: "Nothing to buy and a few days of work. It still gets a full HLD and an SAD update." },
      decide2: { a: "approve", why: "The design fits the standards." },
    } },
  { id: "purchase", label: "Purchase", hint: "An RFP, a licence or a contract",
    note: "An RFP asks for a new CRM. There are vendor pages to read and a licence to buy, so it goes through a demand assessment.",
    path: ["idea", "read", "research", "big", "outline", "decide1", "hld", "parallel", "lld", "decide2", "build", "pr", "ship"],
    answers: {
      read: { a: "yes", why: "The RFP, the vendors' pages and their pricing." },
      big: { a: "yes", why: "It buys a licence, and the rollout takes weeks. The integration itself is designed in the HLD and recorded in the SAD." },
      decide1: { a: "go", why: "You asked for the outline to compare buy, build and extend. Buying wins." },
      decide2: { a: "approve", why: "The design fits the standards." },
    } },
  { id: "idea", label: "Idea", hint: "A suggestion or a doubt",
    note: "Someone suggests rewriting the app in a new framework. It is big, it is not worth it this quarter, and the reason gets written down.",
    path: ["idea", "read", "big", "outline", "decide1", "dropped"],
    answers: {
      read: { a: "no", why: "Nothing to read first." },
      big: { a: "yes", why: "Months of the whole team's time, taken from planned work, and hard to undo." },
      decide1: { a: "not now", why: "Not worth it this quarter. It goes back to the roadmap with the reason." },
    } },
  { id: "research", label: "Research question", hint: "A question to answer",
    note: "Is PostHog available in the Saudi region? A question to answer, not a change to build, so it ends with a research brief.",
    path: ["idea", "read", "research"],
    answers: {
      read: { a: "yes", why: "The vendor's list of regions and its data residency pages." },
      research: { a: "answered", why: "The brief gives the answer with its sources and hands any open question to the architect who owns it." },
    } },
];
