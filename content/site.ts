// Everything the page says about the team lives in content/. Edit here, not in the components.

import { kitManifest } from "./kit";

export const site = {
  name: "Virtual Architects",
  tagline: "Five AI architects advise on every change. You decide.",
  intro:
    "AI made code cheap. Good decisions are still rare: domain knowledge, trade-offs, and the judgment of a seasoned team. Five virtual architects bring that to every business change, each an expert in its own lane, all able to work together. You make the call.",
  // The public repository and the license name, e.g. "https://github.com/<owner>/<repo>" and "MIT".
  // Leave them empty until they are chosen: the GitHub button and the license line stay hidden.
  repoUrl: "https://github.com/abdulrahmanAlotaibi/virtual-architects",
  license: "MIT",
  creator: {
    name: "Abdulrahman Alotaibi",
    role: "Creator",
  },
};

// The top of the page, written for the person deciding whether a team should adopt this.
export const hero = {
  // The title is split so the middle part can be highlighted.
  title: ["Handle your architecture ", "end to end", ""],
  sub: site.intro,
  primary: "Get the team, free",
  secondary: "Watch them work",
  install: "Install in three steps",

  ask: "What should the team look at first?",
  askHint: "Pick a command for an example you can paste as it is.",
};

// The ring under the hero: how each change feeds the next. Stations run clockwise from the top.
// `artifacts` are the documents a step leaves behind, named as the kit names them. `decides`
// marks the two points where the decision maker decides, right after that step.
export type LoopStation = { id: string; label: string; tint: number; who: string; command?: string; text: string; artifacts: string[]; decides?: string };

export const loop = {
  eyebrow: "The feedback loop",
  hint: "Point at or tap a step to stop the loop there.",
  gives: "Artifacts",
  decide: "You decide",
  controls: { change: "Change", prev: "Previous step", next: "Next step", pause: "Pause the loop", play: "Play the loop" },
  stations: [
    { id: "research", label: "Research", tint: 4, who: "Research architect", command: "/arch-research", text: "Here you hand over the link, the document or the question you're unsure about. The research architect reads it, checks what the team already knows, and tells each architect what it means for them.", artifacts: ["Research brief", "Question bank"] },
    { id: "requirements", label: "Requirements", tint: 0, who: "Enterprise architect", command: "/arch-enterprise", text: "Here you bring the business need. If it costs money or is hard to undo, the enterprise architect lays out your options and what each one costs, and you decide: go, no, or not now.", artifacts: ["Outline", "Demand assessment", "Decision record"], decides: "go, no, or not now" },
    { id: "design", label: "Design", tint: 1, who: "Solution architect", command: "/arch-doc", text: "Here your idea becomes a plan. The solution architect asks the hard questions before any code exists, and writes down how it will be built and why.", artifacts: ["HLD", "LLD / SAD", "ADRs", "Diagrams"] },
    { id: "review", label: "Review", tint: 3, who: "Security and cloud architects", text: "Here a second pair of eyes looks at the plan. Security looks for what could go wrong, the cloud architect checks performance, cost and how to roll back, and then you give the go ahead.", artifacts: ["Threat model", "Change plan"], decides: "the design decision" },
    { id: "build", label: "Build", tint: 6, who: "You and your coding assistant", text: "Here you write the code, with your coding assistant beside you. You never start from a blank page: the plan and your team's guidelines are already there to build on.", artifacts: ["Code", "Tests"] },
    { id: "governance", label: "Governance", tint: 1, who: "Solution architect", command: "/arch-conform", text: "Here your code is checked against your own standards before it is merged. Every slip is shown to you by line, and you choose to fix it or write down why it stays.", artifacts: ["Conformance report", "Exemption ADR", "Debt register"] },
    { id: "ship", label: "Ship", tint: 5, who: "Every architect", text: "Here the records catch up with reality. The diagrams and documents are updated to match what you shipped, so the next person to read them reads the truth.", artifacts: ["Landscapes", "Asset inventory", "Built design"] },
    { id: "learn", label: "Learn", tint: 2, who: "Solution and cloud architects", text: "Here the team gets better. A mistake that keeps coming back becomes an automatic check, so nobody has to remember it, and your next change starts from a higher bar.", artifacts: ["Guidelines", "Lint rules", "IT roadmap"] },
  ] as LoopStation[],
};

// The Pro version is announced, not sold: nothing here promises a feature that does not exist yet.
export const pro = {
  label: "Pro",
  badge: "Soon",
  prompt: "Want it built for your business and your team?",
  title: "Pro: an architecture team built around your company",
  intro:
    "The free kit gives any team five architects who design and review every change the same way. Pro is for companies going AI native: every team designs and records its decisions with agents, on your standards.",
  points: [
    "Architects tuned to your domain, stack, regulators and house standards.",
    "One practice across every team and repository.",
    "Help getting there: profiles set up, decision makers coached, first designs reviewed with you.",
  ],
  why:
    "A design mistake caught before the code is the cheapest one you will fix. A written decision outlives the person who made it. We are building Pro now. The kit stays free.",
  close: "Got it",
};

// "A word from the creator". First person, for the leader weighing it up.
export const creatorNote = {
  title: ["A word from ", "the creator"],
  paragraphs: [
    "AI has proven itself as a production ready development team. But in my consultancy and my own businesses, the architecture, the practices and the consistency are still vague. Founders and CTOs tell me \"AI is enabled in my organization but it is misused\", and when I trace it, the cause is design practice that was never baked into the system.",
    "What you have here is a fully capable team of virtual architects: agents that polish your business requirements, research accurately, and build great architecture based on my experience and the best practices I use personally.",
  ],
  signoff: "Thanks for reading, and for trying it.",
};

export type NavLink = { href: string; label: string; wide?: boolean };

// Section links. The nav shows the ones marked wide; the phone menu shows all of them.
export const navLinks: NavLink[] = [
  { href: "#team", label: "Team", wide: true },
  { href: "#workflow", label: "Workflow", wide: true },
  { href: "/examples", label: "Examples", wide: true },
  { href: "#kit", label: "Kit", wide: true },
  { href: "/commands", label: "Commands", wide: true },
  { href: "#repository", label: "Repository" },
  { href: "/faq", label: "FAQ", wide: true },
];

// Lines the hero terminal types, one after another.
export const heroCommands = [
  "/arch-enterprise we received an RFP for a new CRM: buy one, build one, or extend what we have?",
  "/arch-research is PostHog available in the Saudi region?",
  "/arch-security investigate our backend services and plan their security testing",
  "/arch-solution should we integrate with the notification service sync or async?",
  "/arch-doc feature customers can pause their subscription for up to three months",
];

export type Architect = {
  id: string;
  name: string;
  command: string;
  thinks: string;
  writes: string[];
  owns: string;
  tint: number; // its color: 0 enterprise, 1 solution, 2 cloud and infra, 3 security, 4 research, 5 the board
  agent: string; // its definition in the kit
};

export const architects: Architect[] = [
  {
    id: "enterprise",
    agent: ".claude/agents/enterprise-architect.md",
    name: "Enterprise",
    command: "/arch-enterprise",
    thinks:
      "The business as a whole: demand assessments for every purchase and budget, the landscape of systems and vendors, capabilities, the roadmap, build or buy, regulation and principles. Architecture as Kotusev describes it.",
    writes: ["Demand assessments", "Outlines with options", "Landscapes", "Capability maps", "Business roadmaps", "Principles and policies"],
    owns: "The integration landscape, the interface catalogue, the vendor and asset inventory, the principles",
    tint: 0,
  },
  {
    id: "solution",
    agent: ".claude/agents/solution-architect.md",
    name: "Solution",
    command: "/arch-solution · /arch-doc · /arch-conform",
    thinks:
      "One change end to end through your codebase: which part of the product owns it, the APIs, the data, the client, the error contracts. It also reviews designs and branches.",
    writes: ["HLD", "SAD (the LLD)", "Guidelines", "Review findings"],
    owns: "The logical design, process views, context maps",
    tint: 1,
  },
  {
    id: "cloud",
    agent: ".claude/agents/cloud-infra-architect.md",
    name: "Cloud and infra",
    command: "/arch-cloud-infra",
    thinks:
      "Where it all runs: compute, network and outbound traffic, databases, storage, pipelines, schedulers, secrets, cost, reliability, and where the data lives.",
    writes: ["Change plans", "Cost tables", "IT and asset roadmaps"],
    owns: "Deployment views and the infra maps",
    tint: 2,
  },
  {
    id: "security",
    agent: ".claude/agents/security-architect.md",
    name: "Security",
    command: "/arch-security",
    thinks:
      "What could go wrong: threat models, identity and roles, personal data, secrets, access rights, third parties, prompt injection and compliance.",
    writes: ["Threat models", "Ranked findings"],
    owns: "Trust-boundary views",
    tint: 3,
  },
  {
    id: "research",
    agent: ".claude/agents/research-architect.md",
    name: "Research",
    command: "/arch-research",
    thinks:
      "Reads so the others don't have to: vendor docs, regulations, standards, articles, the repo itself. Routes every question to an owner and never decides.",
    writes: ["Research briefs", "The question bank", "The reading list"],
    owns: "The question bank and the reading list. No diagrams, no decisions",
    tint: 4,
  },
];

export type Command = {
  id: string;
  have: string;
  run: string;
  get: string;
  example: string; // a filled-in example, ready to paste
  who: string; // who answers
  tint: number; // the answering architect's color, as in Architect.tint
  writes: string; // where the result lands in the repository
  then: string; // what usually happens next
};

export const commands: Command[] = [
  {
    id: "profile",
    have: "A repository the architects have not seen yet",
    run: "/arch-profile [what changed]",
    get: "Your project profile, filled from the code and a few questions",
    example: "/arch-profile",
    who: "You, with the team",
    tint: 6,
    writes: "docs/architecture/project.yaml",
    then: "Every architect now knows your stack, your rules and who decides. Run it again when they change.",
  },
  {
    id: "research",
    have: "A link, a PDF, a vendor page, a regulation",
    run: "/arch-research <source or question>",
    get: "A brief, and the questions each architect has to answer",
    example: "/arch-research is PostHog available in the Saudi region?",
    who: "Research",
    tint: 4,
    writes: "docs/architecture/practice/research/<date>-<topic>.md",
    then: "Every new question has one owner. Take the first one to that architect, or to the board.",
  },
  {
    id: "enterprise",
    have: "A purchase, an RFP, a new vendor, build or buy",
    run: "/arch-enterprise <idea>",
    get: "A demand assessment: options, a recommendation, and an outline or an ADR",
    example: "/arch-enterprise we received an RFP for a new CRM: buy one, build one, or extend what we have?",
    who: "Enterprise",
    tint: 0,
    writes: "docs/architecture/outlines/solutions/ or decisions/",
    then: "You decide: go, no, or not now. A go moves on to /arch-doc.",
  },
  {
    id: "doc",
    have: "A feature, an integration or a system to design",
    run: "/arch-doc <feature | integration | system> <what>",
    get: "An HLD to decide on, and the LLD, written as a software architecture document",
    example: "/arch-doc feature customers can pause their subscription for up to three months",
    who: "Solution",
    tint: 1,
    writes: "docs/architecture/designs/solutions/<project>/hld.md and lld.md",
    then: "Security and cloud review the HLD. Then you take the design decision.",
  },
  {
    id: "solution",
    have: "A design question, a plan or a branch to review",
    run: "/arch-solution <question>",
    get: "A design answer, or findings that point to the exact line",
    example: "/arch-solution should we integrate with the notification service sync or async?",
    who: "Solution",
    tint: 1,
    writes: "Usually nothing. An ADR if the answer will matter for years",
    then: "Fix the findings, or record an exemption as an ADR.",
  },
  {
    id: "conform",
    have: "Code to check against your standards, before a pull request",
    run: "/arch-conform <branch | folder | file> [fix]",
    get: "Every breach of a guideline, with the exact line and the rule it breaks, fixed if you ask",
    example: "/arch-conform fix",
    who: "Solution",
    tint: 1,
    writes: "Your fixes, and each guideline's list of where the code still breaks it",
    then: "Merge the fixes. A rule it keeps finding broken becomes a lint rule or a test.",
  },
  {
    id: "cloud",
    have: "A deploy, network, database or cost question",
    run: "/arch-cloud-infra <question>",
    get: "A change plan with the steps, the cost and the rollback",
    example: "/arch-cloud-infra our API slows down every Monday morning: how should we scale it, and at what cost?",
    who: "Cloud and infra",
    tint: 2,
    writes: "docs/architecture/designs/solutions/<project>/change-plan.md",
    then: "You run the commands. The architect never touches live resources.",
  },
  {
    id: "security",
    have: "Is this safe? Auth, personal data, a new third party",
    run: "/arch-security <question>",
    get: "A threat model, or ranked findings",
    example: "/arch-security investigate our backend services and plan their security testing",
    who: "Security",
    tint: 3,
    writes: "docs/architecture/designs/solutions/<project>/threat-model.md",
    then: "Controls go to their owners. A live weakness goes to you, never into the repository.",
  },
  {
    id: "board",
    have: "Something that crosses lanes",
    run: "/arch-board <question>",
    get: "One recommendation, the disagreements, and the decision it needs",
    example: "/arch-board should all customer data stay in a cloud region inside our country?",
    who: "The board: research first, then the architects it touches",
    tint: 5,
    writes: "Open questions in practice/research/questions.yaml",
    then: "You take the decision it names: strategy, investment, technology or design.",
  },
];

export const chooser = {
  ask: "What do you have in hand?",
  get: "You get",
  who: "Who answers",
  writes: "Where it lands",
  then: "Then",
  tryIt: "Try it",
};

// Kotusev's CSVLOD model, one folder per type.
export const csvlod = {
  rows: ["Rules", "Structures", "Changes"],
  cols: ["Business", "IT"],
  cells: [
    { type: "Considerations", q: "What rules does the business set?", folder: "considerations/", sub: ["principles", "strategy", "policies", "regulations"], owner: "enterprise" },
    { type: "Standards", q: "What rules does IT build by?", folder: "standards/", sub: ["principles", "patterns", "guidelines", "reference-models"], owner: "enterprise, solution" },
    { type: "Visions", q: "Where is the business going?", folder: "visions/", sub: ["capabilities", "roadmaps"], owner: "enterprise" },
    { type: "Landscapes", q: "What does IT look like, and how will it move?", folder: "landscapes/", sub: ["app", "infra", "tech-debt", "roadmaps"], owner: "all four, per view" },
    { type: "Outlines", q: "Should we make this change, and which option?", folder: "outlines/", sub: ["solutions"], owner: "enterprise" },
    { type: "Designs", q: "How exactly do we build it?", folder: "designs/", sub: ["solutions/<project>", "products/<product>"], owner: "solution, security, cloud" },
  ],
};

// The four decisions a person takes. The architects only ever recommend.
export const decisions: [string, string][] = [
  ["Strategy", "where are we going?"],
  ["Investment", "go, no, or not now"],
  ["Technology", "which tools and standards we build with"],
  ["Design", "approve, change, or grant an exemption"],
];

// Short forms the page expands on first use.
export const abbreviations: Record<string, string> = {
  ADR: "architecture decision record",
  ADRs: "architecture decision records",
  HLD: "high-level design",
  LLD: "low-level design",
  SAD: "software architecture document",
};

export const sources = [
  { label: "Kotusev, The Practice of Enterprise Architecture, 2nd ed. (2021)", href: "https://kotusev.com" },
  { label: "EA on a Page", href: "https://eaonapage.com" },
  { label: "Kotusev, Yet Another Taxonomy for EA Artifacts (JEA, 2019)", href: "https://kotusev.com/Yet%20Another%20Taxonomy%20for%20Enterprise%20Architecture%20Artifacts.pdf" },
];

export type InstallMethod = {
  id: string;
  label: string;
  hint: string;
  intro: string;
  blocks: { label?: string; code: string; chat?: boolean; plain?: boolean }[];
  note: string;
  // Commands shown after the note, such as how to update.
  update?: { label: string; code: string }[];
};

// The downloadable kit. Sizes, hashes and the file list come from content/kit-manifest.json,
// which scripts/build-kit.py writes before every build.
export const kit = {
  eyebrow: "Installation guide",
  title: "How to install",
  lede:
    "Everything the team needs: five architects, nine commands, nine templates, the Copilot copies and an optional exporter to HTML, PDF or Word. Plain text, tied to no project.",
  works: ["Claude Code", "GitHub Copilot"],
  // Short labels for the single-file links under the download card.
  oneArchitect: [
    { label: "enterprise", path: ".claude/agents/enterprise-architect.md" },
    { label: "solution", path: ".claude/agents/solution-architect.md" },
    { label: "cloud-infra", path: ".claude/agents/cloud-infra-architect.md" },
    { label: "security", path: ".claude/agents/security-architect.md" },
    { label: "research", path: ".claude/agents/research-architect.md" },
    { label: "board", path: ".claude/commands/arch-board.md" },
  ],
  treeTitle: "What is inside",
  treeNote: "Every file opens on GitHub, where you can read it before installing anything. The .github copies are generated from .claude: edit .claude and let the script do the rest.",
  // The ways to install. The zip method's panel is the download card; the rest are commands.
  // Every method ends with the same two steps, in `then`.
  methods: [
    {
      id: "command",
      label: "One command",
      hint: "macOS, Linux or Windows",
      intro: "Run it at the root of your repository. It downloads the kit, checks it against its SHA-256 and adds the files you do not have. It never overwrites one.",
      blocks: [
        { label: "macOS and Linux", code: `curl -fsSL ${kitManifest.install.sh} | sh` },
        { label: "Windows PowerShell", code: `irm ${kitManifest.install.ps1} | iex` },
      ],
      note: "To refresh the kit's own files later, run it again with the update option. Your project.yaml and the architects' documents are never replaced.",
      update: [
        { label: "Update on macOS and Linux", code: `curl -fsSL ${kitManifest.install.sh} | sh -s -- --update` },
        { label: "Update on Windows PowerShell", code: `& ([scriptblock]::Create((irm ${kitManifest.install.ps1}))) -Update` },
      ],
    },
    {
      id: "zip",
      label: "Download the zip",
      hint: "Read every file first",
      intro: "",
      blocks: [{ label: "Unzip it at the root of your repository", code: "unzip -n virtual-architects-kit.zip -d ." }],
      note: "It adds .claude/, .github/ and docs/architecture/. With -n, unzip never overwrites a file you already have.",
    },
    {
      id: "git",
      label: "Git",
      hint: "Clone it and copy",
      intro: "The kit/ folder in the repository is exactly what the zip holds.",
      blocks: [
        { code: `git clone --depth 1 ${site.repoUrl}.git /tmp/virtual-architects` },
        { label: "At the root of your repository", code: "cp -Rn /tmp/virtual-architects/kit/. ." },
      ],
      note: "With -n, cp never overwrites a file you have. A git pull in the clone gets the next version. On macOS, cp -n exits with status 1 when it skips a file you already have: that is expected, not a failure.",
    },
  ] as InstallMethod[],
  thenTitle: "Then, however you installed it",
  steps: [
    {
      title: "Describe your project once",
      code: "/arch-profile",
      chat: true,
      note: "It reads your repository for the stack, hosting and conventions, then asks only what the code cannot tell it: who decides, which rules apply, the data that matters most. Run it again whenever those change.",
    },
    {
      title: "Ask your first question",
      code: "/arch-board should we add a second payment provider?",
      note: "",
      chat: true,
    },
  ],
  where: [
    {
      id: "claude",
      label: "Claude Code",
      text: "Type it in a Claude Code session in the repository. The command runs each architect it needs as a subagent and reports back.",
      code: "",
    },
    {
      id: "copilot",
      label: "Copilot Chat",
      text: "Open Copilot Chat in VS Code, switch to agent mode, reload the window once, and type it. The / menu lists the prompt files. After editing an architect, regenerate the Copilot copies:",
      code: ".claude/scripts/sync-copilot.sh",
    },
  ],
  beforeTitle: "What you need first",
  before: [
    "Claude Code, or GitHub Copilot Chat in VS Code. You need one, not both.",
    "A plan you already pay for: the kit brings the architects, your plan brings the model.",
    "The agents ask for model: opus in their front matter. If your plan lacks it, change or delete that line.",
    "bash, awk and git for the sync script. On Windows, use WSL or Git Bash.",
    "The sync workflow pushes a commit. Give Actions write access, or delete the workflow and run the script yourself.",
    "Optional, for the exporter: Python 3.9+ for HTML, Node 20+ for diagrams, weasyprint or Chrome for PDF, pandoc for Word.",
  ],
};

export const faqHead = {
  title: "FAQ",
  lede: "What people ask before installing, including what it does not do. The kit's handbook has the rest.",
};

export const faq: [string, string][] = [
  [
    "Will it write my product for me?",
    "No. The architects research, design and review. Solution and security may edit docs and code when a design calls for it, but building the product is your team's job.",
  ],
  [
    "Does it replace an experienced architect's judgment?",
    "No. You get options, trade-offs and evidence, each claim labelled fact, claim or guess. It does not know what you promised your board or which customer is about to leave. A person decides. That is the point.",
  ],
  [
    "How good is the advice?",
    "Only as good as the profile and the model behind it. An empty project.yaml gets careful questions, not answers; a filled one gets designs that name your stack, your laws and your standards. Read it as you would a capable new hire's first design.",
  ],
  [
    "What does it cost?",
    "The kit is free. The architects run on the model in your Claude Code or Copilot plan, so you pay for that plan as you do today. No account, no server of ours, nothing to renew.",
  ],
  [
    "Do I need both Claude Code and Copilot?",
    "No. Either works on its own. The architects are written for Claude Code, and the sync script generates the Copilot copies in .github/.",
  ],
  [
    "Will an architect change my code, or commit?",
    "Solution and security may edit docs and code, then run the typecheck and test commands from your profile. Cloud may edit infrastructure files but never changes live resources. Research writes only in its research folder. None of them commits or pushes. You review and commit.",
  ],
  [
    "My project has no architecture docs yet. Does it still work?",
    "Yes, and you do not write the first document yourself. The architects write them from the kit's templates: the HLD and the SAD, threat models, change plans, ADRs and research briefs, saved into docs/architecture/ as they go, and they create the CSVLOD folders the first time they write into one. An empty profile is enough to begin, because they ask for the facts they need and write the answers back into it. Diagrams are drawn as code, in your pipeline where the profile names one and as Mermaid in the Markdown where it does not. Nothing is committed until you commit it.",
  ],
  [
    "Can I send a design to someone who does not read Markdown?",
    "Yes. An optional exporter, docs/architecture/tools/export.py, turns any architecture document into HTML, PDF or Word with the diagrams drawn. HTML needs only Python; PDF needs weasyprint or Chrome, Word pandoc, diagrams Node. It tells you what is missing. A workflow runs it on every pull request, so a diagram that does not parse fails the check.",
  ],
  [
    "Which model does it use?",
    "Any model that can hold a long instruction. The kit is a customization rather than a model: each architect's lane, the templates it writes from and the rules it keeps to are all plain text, so they work with whatever you run. In Claude Code the agents declare model: opus in their front matter as a default. Change that line to suit your plan, or delete it and the agent follows the model the session is set to. The sync script drops the line for Copilot, which uses the model you pick in Copilot Chat.",
  ],
  [
    "What happens if an architect finds a live security weakness?",
    "It never goes into the repository: not a threat model, a brief, a design, a diagram or a commit message. It goes to the restricted register you name in the profile, and straight to you.",
  ],
  [
    "Do I have to read Kotusev first?",
    "No. The agents carry the method, and the kit's EA playbook is the short version. Read the book to know why the folders and rules are as they are.",
  ],
  [
    "Can I remove an architect, or add one?",
    "Yes. Delete or copy an agent file and its command, update the board's list in arch-board.md and sync-copilot.sh, then run the sync script. The handbook lists every step.",
  ],
  [
    "How do I update the kit later?",
    "Run the installer again with its update option: curl -fsSL <url> | sh -s -- --update on macOS and Linux, or & ([scriptblock]::Create((irm <url>))) -Update in PowerShell. The Get the kit section has both, ready to copy. It refreshes the kit's own files and leaves your project.yaml and documents alone. With the zip, download it again, unzip into an empty folder and compare.",
  ],
];

