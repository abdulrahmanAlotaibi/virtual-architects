// Worked examples for /examples: one requirements document followed through every command.
// Both are simulations written from the kit's commands, agents and templates. Samra Pay,
// its vendors, code paths and costs are invented; the regulatory details are illustrative.

export type Lane = "research" | "enterprise" | "solution" | "cloud" | "security" | "board" | "you";

// The --tint-N each lane draws with (see globals.css), and the name it goes by.
export const lanes: Record<Lane, { tint: number; name: string }> = {
  enterprise: { tint: 0, name: "Enterprise" },
  solution: { tint: 1, name: "Solution" },
  cloud: { tint: 2, name: "Cloud and infra" },
  security: { tint: 3, name: "Security" },
  research: { tint: 4, name: "Research" },
  board: { tint: 5, name: "The board" },
  you: { tint: 6, name: "You decide" },
};

// A table cell: plain text, a severity or result tag, or an owning architect.
export type Cell = string | { tag: string; tone: "high" | "med" | "low" | "ok" } | { owner: Lane };

export type Block =
  | { kind: "table"; caption?: string; head: string[]; rows: Cell[][]; pick?: number; numeric?: number[] }
  | { kind: "file"; name: string; text: string }
  | { kind: "voices"; voices: { lane: Lane; text: string }[] }
  | { kind: "states"; label: string; states: string[]; note: string }
  | { kind: "note"; text: string }
  | { kind: "pair"; blocks: Block[] };

export type Step = {
  lane: Lane;
  rail: string; // short label for the step list
  title: string;
  why: string; // why this command, at this point
  command: string;
  routed: string; // who picks it up, and anything it does on the way
  reads: string[];
  writes: { path: string; change: "new" | "mod" }[];
  blocks: Block[];
  decision?: { verdict: string; text: string };
};

export type RouteNode = { lane: Lane; cmd: string; out: string; step?: number } | { parallel: RouteNode[] };

export type Example = {
  id: string;
  tab: string;
  hint: string;
  code: string;
  title: string;
  summary: string;
  brsd: { file: string; name: string; reqs: [string, string][]; nfr: [string, string][] };
  profile: { name: string; lines: string[]; note: string };
  routeNote: string;
  route: RouteNode[];
  steps: Step[];
  coverage: [string, string, string, string][]; // command, steps, triggered by, left behind
};

// One profile for the company. Every BRSD reads it and none of them edits it: it holds
// what is true of Samra Pay whatever is being built, so it is complete before the first one.
const samraProfile = [
  "project:",
  "  name: Samra Pay",
  "  summary: Consumer wallet, licensed as a payments company",
  "  stage: live, about 400,000 customers",
  "  decision_maker: CTO; the MLRO for AML policy",
  "stack:",
  "  backend: Node 20, TypeScript, NestJS",
  "  database: PostgreSQL 16 on Cloud SQL, HA",
  "  auth: OIDC, device binding, step-up OTP",
  "hosting:",
  "  primary_cloud: GCP",
  "  region: me-central2 (Dammam)",
  "  residency_note: customer data stays in the Kingdom",
  "integrations:",
  "  - name: Sponsor bank",
  "    purpose: IBAN accounts, instant payments",
  "regulation:",
  "  - SAMA rules for payment service providers",
  "  - SAMA AML and CTF rules",
  "  - Anti-Money Laundering Law",
  "  - SAMA Cyber Security Framework",
  "  - PDPL",
  "data_protection:",
  "  most_sensitive: national ID and Iqama numbers,",
  "    IBANs, balances, screening results",
  "  abuse_cases:",
  "    - customer reads another customer's data",
  "    - staff open a record not assigned to them",
  "    - customer learns they were flagged",
  "  log_rules: no ID numbers, IBANs or tokens",
];

const transfers: Example = {
  id: "transfers",
  tab: "Instant transfers",
  hint: "Payments: a bank link, a vendor, an HSM",
  code: "BRSD-014",
  title: "Instant transfers to any Saudi bank",
  summary:
    "Samra Pay, a made-up Saudi wallet, wants customers to send money to any Saudi bank account in seconds. It reads like one feature, but it buys a fraud service, pays the bank per transfer and signs payment messages. So it goes through research and a demand assessment before anyone designs.",
  brsd: {
    file: "docs/brsd/BRSD-014-instant-transfers.pdf",
    name: "Instant transfers to any Saudi bank",
    reqs: [
      ["BR-1", "A customer sends money from the wallet to any Saudi IBAN, at any hour, settled in seconds through the sponsor bank's instant payments link."],
      ["BR-2", "The recipient's name is shown before the customer confirms."],
      ["BR-3", "Every transfer is screened for fraud and sanctions in under 300 ms."],
      ["BR-4", "Customers can share a request-to-pay link with an amount."],
      ["BR-5", "Daily limit of SAR 20,000 per customer."],
      ["BR-6", "Compliance asks for transfer records to be kept for 10 years."],
    ],
    nfr: [
      ["NFR-1", "99.95% availability for sending."],
      ["NFR-2", "All customer data stays in the Kingdom."],
    ],
  },
  profile: {
    name: "docs/architecture/project.yaml",
    lines: samraProfile,
    note: "The company profile. It is the same for every BRSD; this one doesn't change it.",
  },
  routeNote:
    "A BRSD enters as a business requirement. It has a source to read and it buys things, so research and a demand assessment come before design. You decide twice.",
  route: [
    { lane: "research", cmd: "/arch-research", out: "brief, 6 questions", step: 1 },
    { lane: "enterprise", cmd: "/arch-enterprise", out: "outline, 3 options", step: 2 },
    { lane: "you", cmd: "Demand", out: "Go" },
    { lane: "board", cmd: "/arch-board", out: "where it lives, sync or async", step: 3 },
    { lane: "solution", cmd: "/arch-doc", out: "HLD", step: 4 },
    { parallel: [
      { lane: "security", cmd: "/arch-security", out: "threat model", step: 5 },
      { lane: "cloud", cmd: "/arch-cloud-infra", out: "change plan", step: 6 },
    ] },
    { lane: "solution", cmd: "/arch-doc", out: "LLD, ADRs from 3 lanes", step: 7 },
    { lane: "you", cmd: "Design", out: "approve, SAR 5,000 cap" },
    { lane: "solution", cmd: "/arch-solution", out: "a build question", step: 8 },
    { lane: "solution", cmd: "/arch-conform fix", out: "before the PR", step: 9 },
    { lane: "solution", cmd: "/arch-solution", out: "mark Built", step: 10 },
  ],
  steps: [
    {
      lane: "research",
      rail: "Read the BRSD",
      title: "Read the BRSD before anyone designs",
      why: "There is a source nobody has read in full, so research goes first. It checks the question bank for anything already answered, then separates what the BRSD proves from what it only claims.",
      command: "/arch-research docs/brsd/BRSD-014-instant-transfers.pdf",
      routed: "research-architect, in its own context",
      reads: ["project.yaml", "practice/research/questions.yaml", "practice/research/sources.yaml", "the BRSD"],
      writes: [
        { path: "practice/research/2026-10-27-brsd-014.md", change: "new" },
        { path: "practice/research/questions.yaml (Q-001 to Q-006)", change: "mod" },
        { path: "practice/research/sources.yaml (S-BRSD-014)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "table", caption: "Brief: facts vs claims", head: ["Statement", "Kind"], rows: [
            ["Daily limit SAR 20,000 (§3.1)", "Fact"],
            ["The sponsor bank screens every transfer (§5)", "Claim. No contract clause cited"],
            ["Settled within 10 seconds", "Claim. Rests on a bank SLA nobody has seen"],
            ["10 year retention (BR-6)", "Claim. Check against the regulation"],
          ] },
          { kind: "table", caption: "Questions, one owner each", head: ["Question", "Owner"], rows: [
            ["Q-001 Does the bank contract include fraud screening, or only sanctions?", { owner: "enterprise" }],
            ["Q-002 Which payment message keys do we hold, and must they sit in an HSM?", { owner: "security" }],
            ["Q-003 Can the bank call us back, and does it need private connectivity?", { owner: "cloud" }],
            ["Q-004 Is a transfer its own bounded context, or part of Wallet?", { owner: "solution" }],
            ["Q-005 What can someone do with a forged request-to-pay link?", { owner: "security" }],
            ["Q-006 What retention actually applies to transfer records?", { owner: "enterprise" }],
          ] },
        ] },
      ],
    },
    {
      lane: "enterprise",
      rail: "Build or buy",
      title: "Should we do it, and buy or build the fraud screening?",
      why: "BR-3 needs a fraud service, the bank charges per transfer, and a bank integration is hard to undo. Any one of those calls for a demand assessment. You want the options first, so the enterprise architect writes an outline.",
      command: "/arch-enterprise Outline for BRSD-014: build, buy, or use the bank's fraud screening? Brief: practice/research/2026-10-27-brsd-014.md",
      routed: "enterprise-architect, answering Q-001 and Q-006 on the way",
      reads: ["the research brief", "practice/ea-playbook.md §2", "practice/templates/outline.md", "visions/roadmaps/"],
      writes: [
        { path: "outlines/solutions/instant-transfers.md", change: "new" },
        { path: "questions.yaml (Q-001, Q-006 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "table", caption: "Outline: options scored 1 to 5", head: ["Option", "Function", "Feasibility", "Fit", "Cost", "Note"], numeric: [1, 2, 3, 4], pick: 1, rows: [
          ["A. Build a rules engine in house", "2", "4", "5", "4", "No device or network signals, so weak against account takeover"],
          ["B. Buy an in-Kingdom fraud scoring service, behind our own interface", "5", "4", "4", "2", "Recommended. Data stays in Saudi; the interface keeps A open"],
          ["C. Use the bank's screening only", "3", "5", "3", "5", "Q-001: the contract covers sanctions only. Keep it for sanctions"],
        ] },
      ],
      decision: { verdict: "Go", text: "Option B for fraud, with the bank's sanctions screening (C) alongside. Budget for 12 months, revisit at the vendor's renewal. On Q-006 the regulation sets the floor and BR-6's 10 years is a business choice, which you accept." },
    },
    {
      lane: "board",
      rail: "Cross-lane call",
      title: "Two questions that cross lanes",
      why: "Where does the transfer ledger live, and do we call the bank inside the customer's request? Solution, cloud and security each own part of the answer, so the board runs them in parallel and merges what they say.",
      command: "/arch-board Should instant transfers get their own service and database, and should we call the bank synchronously in the customer's request?",
      routed: "Picks solution, cloud and security. Enterprise sits out: no vendor, cost or roadmap change beyond the approved outline",
      reads: ["the outline", "the research brief", "src/wallet/ and src/ledger/"],
      writes: [{ path: "questions.yaml (Q-004 answered)", change: "mod" }],
      blocks: [
        { kind: "voices", voices: [
          { lane: "solution", text: "A Transfers module inside the existing API, with its own schema and an outbox table. A worker submits to the bank. One deploy and one database to reason about." },
          { lane: "security", text: "Whatever can sign a payment message is the crown jewel. If the main API is compromised, it must not be able to sign. Wants a separate service." },
          { lane: "cloud", text: "A second full service doubles the private connectivity and the on-call surface. Fine with a tiny service if it holds no business logic." },
        ] },
        { kind: "file", name: "The board's merged reply", text:
`Recommendation  Transfers stays a module with an outbox. Bank submission is
                async from a worker; the customer sees "Sending", then "Sent".
                Signing moves to a small signer service, the only identity
                allowed to use the HSM key.
Disagreement    Security against solution on a separate service. Settled by
                splitting out only the signer.
Decision type   Technology and design (EA playbook). Settled in the HLD.
Next            The solution architect writes the HLD.` },
      ],
    },
    {
      lane: "solution",
      rail: "HLD",
      title: "The HLD: the design you say yes or no to",
      why: "/arch-doc hands the solution architect its solution-design skill and the HLD template. The approved outline and the board's answer go in as context, so the HLD builds on them instead of reopening them.",
      command: "/arch-doc feature Instant transfers to any Saudi bank (BRSD-014). Outline: outlines/solutions/instant-transfers.md. Board: module, outbox, separate signer.",
      routed: "solution-architect, with the solution-design skill, scope F (feature)",
      reads: ["practice/templates/hld.md (v4)", "the outline and the brief", "standards/guidelines/", "src/wallet/, src/auth/ (cited by file:line)"],
      writes: [
        { path: "designs/solutions/instant-transfers/hld.md", change: "new" },
        { path: "questions.yaml (Q-007 for security, Q-008 for cloud)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "file", name: "hld.md §4.1 Pillars", text:
`1. Money is integer halalas, never a float.
2. Every transfer has one idempotency key.
3. A transfer is a state machine; the bank
   is the source of truth for "settled".
4. Nothing signs except the signer.` },
          { kind: "table", caption: "hld.md §7 Data governance", head: ["Data", "Class", "Kept", "Leaves KSA"], rows: [
            ["Transfer record", "Confidential", "10 years", "No"],
            ["Recipient IBAN and name", "Personal", "10 years", "No"],
            ["Device signals sent to the fraud vendor", "Personal", "90 days, at the vendor", "No"],
          ] },
        ] },
        { kind: "table", caption: "hld.md §8.2 Who can do what", head: ["Role", "Create a transfer", "Read a transfer"], rows: [
          ["Customer", "From their own wallet only", "Their own only"],
          ["Support agent", "No", "Masked IBAN only"],
          ["Signer service", "Sign only", "No"],
        ] },
        { kind: "note", text: "The HLD ends with a question for each of the next two architects: threat-model the flows and the request-to-pay link, and plan the bank link, the HSM, the worker and the cost. Those two run at the same time." },
      ],
    },
    {
      lane: "security",
      rail: "Threat model",
      title: "Threat model, in parallel with the change plan",
      why: "The security architect models the HLD's flows, not the BRSD's wishes. It answers Q-002, Q-005 and Q-007, and names the abuse-case tests the build must contain.",
      command: "/arch-security Threat model the flows in designs/solutions/instant-transfers/hld.md, including request-to-pay links.",
      routed: "security-architect",
      reads: ["hld.md §6, §7, §8", "practice/templates/threat-model.md", "project.yaml regulation and abuse_cases"],
      writes: [
        { path: "designs/solutions/instant-transfers/threat-model.md", change: "new" },
        { path: "questions.yaml (Q-002, Q-005, Q-007 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "table", caption: "threat-model.md, ranked", head: ["Rank", "Threat", "Planned control"], rows: [
          [{ tag: "1", tone: "high" }, "Account takeover, then the balance drained to a mule account", "Step-up OTP for a new payee; a lower limit for 24 hours on a new device"],
          [{ tag: "2", tone: "high" }, "A customer reads another customer's transfer by its id", "Ownership check in the service, not the route. Abuse test required"],
          [{ tag: "3", tone: "high" }, "A replay or a double tap sends money twice", "Idempotency key with a unique index; a replay returns the original"],
          [{ tag: "4", tone: "med" }, "A forged request-to-pay link changes the amount or payee", "Signed links; payee and amount come from the server, never the URL"],
          [{ tag: "5", tone: "med" }, "Misuse of the signing key", "Key in Cloud HSM, only the signer may use it, alert on volume spikes"],
          [{ tag: "6", tone: "med" }, "A customer is talked into paying a scammer", "Name check shown (BR-2); extra confirmation on a first large transfer"],
        ] },
        { kind: "file", name: "threat-model.md · tests the build must contain", text:
`customer_cannot_read_another_customers_transfer
replayed_idempotency_key_returns_original_transfer
request_to_pay_link_with_altered_amount_is_rejected` },
      ],
    },
    {
      lane: "cloud",
      rail: "Change plan",
      title: "Change plan: what changes in the cloud, and what it costs",
      why: "The design adds a worker, a signer, a private link to the bank and an HSM key. The cloud and infra architect writes the steps, the cost and the rollback, and answers Q-003 and Q-008.",
      command: "/arch-cloud-infra Change plan for designs/solutions/instant-transfers/hld.md: private link to the sponsor bank, HSM signing, transfers worker, cost.",
      routed: "cloud-infra-architect",
      reads: ["hld.md §5, §10", "practice/templates/change-plan.md", "landscapes/infra/"],
      writes: [
        { path: "designs/solutions/instant-transfers/change-plan.md", change: "new" },
        { path: "questions.yaml (Q-003, Q-008 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "file", name: "change-plan.md · Steps", text:
`1. Reserve a static egress IP (Cloud NAT)
   for the bank to allowlist.
2. HA VPN to the bank, which requires
   IPsec. Q-003: it calls back over it.
3. KMS key ring at HSM protection level in
   me-central2. Signer identity only.
4. Deploy transfers-worker and signer on
   Cloud Run, minimum one instance each.
5. Migrate the transfers schema.
6. Scheduler: reconcile every 5 minutes.` },
          { kind: "table", caption: "Monthly cost, illustrative", head: ["Item", "SAR"], numeric: [1], rows: [
            ["HA VPN, 2 tunnels", "270"],
            ["Cloud NAT and static IP", "150"],
            ["Two always-on Cloud Run services", "400"],
            ["HSM key and operations", "50"],
            ["Total, before bank and vendor fees", "870"],
          ] },
        ] },
        { kind: "note", text: "Rollback: turn the feature flag off and let the worker drain the outbox. The VPN and the key stay, since they carry no customer traffic on their own." },
      ],
    },
    {
      lane: "solution",
      rail: "LLD and ADRs",
      title: "The LLD (the SAD) and the ADRs",
      why: "With the threat model and the change plan in, the same command writes the software architecture document on arc42. Each lasting decision becomes an ADR written by the architect whose lane it is in, so the fraud vendor is enterprise's and the HSM signer is security's. Then you take the design decision.",
      command: "/arch-doc feature instant-transfers: write the LLD from the HLD, threat-model.md and change-plan.md",
      routed: "solution-architect, with the solution-design skill",
      reads: ["practice/templates/lld.md (v3, arc42)", "hld.md, threat-model.md, change-plan.md"],
      writes: [
        { path: "designs/solutions/instant-transfers/lld.md", change: "new" },
        { path: "decisions/0001 to 0004", change: "new" },
        { path: "decisions/README.md", change: "mod" },
        { path: "landscapes/app/ (logical view)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "table", caption: "ADRs, as Proposed", head: ["ADR", "Decision", "Lane"], rows: [
            ["0001", "Submit to the bank through an outbox and a worker", { owner: "solution" }],
            ["0002", "Buy fraud scoring from an in-Kingdom vendor", { owner: "enterprise" }],
            ["0003", "Store money as integer halalas", { owner: "solution" }],
            ["0004", "Sign payment messages only in a separate signer with an HSM key", { owner: "security" }],
          ] },
          { kind: "file", name: "lld.md §16 Rollout", text:
`Phase 1  staff wallets only, 1 week
Phase 2  5% of customers, SAR 5,000 a day
Phase 3  everyone, SAR 5,000 a day
Phase 4  SAR 20,000 a day (BR-5)

Exit, each phase: no reconcile mismatches,
fraud losses under the agreed threshold` },
        ] },
      ],
      decision: { verdict: "Approve, with a condition", text: "Launch at SAR 5,000 a day for 30 days before raising it to BR-5's SAR 20,000. The four ADRs move from Proposed to Accepted." },
    },
    {
      lane: "solution",
      rail: "Build question",
      title: "A question comes up while building",
      why: "You build with your coding assistant from lld.md. In staging, the bank's settlement callback sometimes arrives before the worker has committed. Ask the solution architect in its own context, so your coding chat stays clean.",
      command: "/arch-solution The bank's settlement callback sometimes arrives before our worker commits the submission. How should the state machine handle it?",
      routed: "solution-architect",
      reads: ["lld.md §6", "ADR-0001", "src/transfers/"],
      writes: [{ path: "designs/solutions/instant-transfers/lld.md §6.3", change: "mod" }],
      blocks: [
        { kind: "file", name: "The reply", text:
`Never answer the bank with a 404. Store the callback in bank_events, keyed by
the bank's reference, and return 200. After the worker commits, it looks for an
early event and applies it. The 5 minute reconcile job picks up anything left.

This fits ADR-0001, so there is no new ADR. Added the runtime scenario
"callback before commit" to lld.md §6.3, and the test
early_settlement_callback_is_applied_after_commit.` },
      ],
    },
    {
      lane: "solution",
      rail: "Pre-PR check",
      title: "Check the branch against the standards before the PR",
      why: "/arch-conform reads every guideline, the accepted ADRs and the threat model's required tests, and checks the branch against them. With fix, it repairs what it finds and keeps each guideline's Appendix A true.",
      command: "/arch-conform feature/instant-transfers fix",
      routed: "solution-architect, as a conformance check against main",
      reads: ["standards/guidelines/", "decisions/0001 to 0004", "threat-model.md", "the diff against main"],
      writes: [
        { path: "src/ and test/ (5 fixes)", change: "mod" },
        { path: "standards/guidelines/*.md Appendix A", change: "mod" },
      ],
      blocks: [
        { kind: "table", caption: "Breaches found and fixed", head: ["Severity", "Where", "Rule", "Result"], rows: [
          [{ tag: "High", tone: "high" }, "src/transfers/transfer.service.ts:88", "Observability R7: logs the full recipient IBAN", { tag: "Fixed: logs transfer_id", tone: "ok" }],
          [{ tag: "High", tone: "high" }, "src/transfers/transfer.entity.ts:14", "ADR-0003: amount typed as a float", { tag: "Fixed: bigint halalas", tone: "ok" }],
          [{ tag: "High", tone: "high" }, "test/transfers/", "Threat model: a required abuse test is missing", { tag: "Fixed: test added", tone: "ok" }],
          [{ tag: "Med", tone: "med" }, "src/transfers/transfers.controller.ts:41", "API layering R2: limit check in the controller", { tag: "Fixed: moved to the service", tone: "ok" }],
          [{ tag: "Low", tone: "low" }, "src/bank/callback.controller.ts:23", "Observability R4: a 4xx logged as an error", { tag: "Fixed: logged as info", tone: "ok" }],
        ] },
        { kind: "note", text: "It also proposes two checks so nobody has to remember these: a lint rule that rejects number on any field named amount, and a CI step that fails when a threat model's required test is missing." },
      ],
    },
    {
      lane: "solution",
      rail: "Ship",
      title: "Ship, and make the documents true again",
      why: "The PR is reviewed against the design and export.py --check passes. After the merge, one command marks the design Built and updates every view that changed.",
      command: "/arch-solution mark instant-transfers Built",
      routed: "solution-architect",
      reads: ["the merged code", "hld.md, lld.md", "landscapes/"],
      writes: [
        { path: "hld.md, lld.md (status: Built)", change: "mod" },
        { path: "landscapes/app/ integration view (bank, fraud vendor)", change: "mod" },
        { path: "landscapes/inventory.md (2 vendors)", change: "mod" },
        { path: "questions.yaml (Q-001 to Q-008 closed)", change: "mod" },
      ],
      blocks: [
        { kind: "note", text: "Template gap reported: the HLD template has no prompt for money and rounding. It suggests adding one to practice/templates/hld.md as v5, with a changelog line." },
      ],
    },
  ],
  coverage: [
    ["/arch-research", "1", "A document nobody had read in full", "A brief and 6 owned questions"],
    ["/arch-enterprise", "2", "A purchase, a per-transfer fee, a bank link hard to undo", "An outline with 3 scored options"],
    ["/arch-board", "3", "A question three lanes each owned part of", "One recommendation, the disagreement settled"],
    ["/arch-doc", "4, 7", "An approved demand that needs a design", "The HLD, then the LLD (SAD), with 4 ADRs from three lanes"],
    ["/arch-security", "5", "The HLD's question for security", "A threat model and 3 required tests"],
    ["/arch-cloud-infra", "6", "New infrastructure in the HLD", "A change plan with cost and rollback"],
    ["/arch-solution", "8, 10", "A question during the build; then the merge", "An answer and an LLD update; status Built"],
    ["/arch-conform", "9", "A branch about to become a PR", "5 breaches fixed, 2 checks proposed"],
  ],
};

const kyc: Example = {
  id: "kyc",
  tab: "eKYC onboarding",
  hint: "Identity: regulation, rules, insiders",
  code: "BRSD-021",
  title: "Remote onboarding with eKYC",
  summary:
    "Months later, the same wallet wants customers to open an account in minutes without visiting a branch. KYC is a legal duty, so the route is heavier: more regulation to read, a vendor to buy, rules that compliance owns, and data the law treats as the most sensitive the company holds.",
  brsd: {
    file: "docs/brsd/BRSD-021-ekyc-onboarding.pdf",
    name: "Remote onboarding with eKYC",
    reqs: [
      ["BR-1", "A new customer opens a wallet in under 3 minutes, fully remote, by verifying with Nafath."],
      ["BR-2", "Name, date of birth, nationality and ID expiry come from government records, never typed."],
      ["BR-3", "Every customer is screened against sanctions and PEP lists at onboarding, and again every day."],
      ["BR-4", "Each customer gets a risk rating. A high-risk customer waits for compliance review before the wallet works."],
      ["BR-5", "Two tiers: Tier 1 after Nafath, with low limits; Tier 2 after occupation and source of funds."],
      ["BR-6", "Re-verify when a national ID or Iqama expires."],
      ["BR-7", "Existing customers, onboarded the old way, are brought up to the new standard."],
    ],
    nfr: [
      ["NFR-1", "Fewer than 25% of people who start onboarding drop out."],
      ["NFR-2", "All identity data stays in the Kingdom."],
    ],
  },
  profile: {
    name: "docs/architecture/project.yaml",
    lines: samraProfile,
    note: "The same profile as the transfers example. AML law, ID numbers and tipping off were already in it, because they are true of the company, not of this BRSD. Nafath and Yakeen join integrations once the build ships.",
  },
  routeNote:
    "The same entry, with one difference: the board meets on a business question, who owns the risk rules. So the enterprise architect sits on it and the cloud architect sits out.",
  route: [
    { lane: "research", cmd: "/arch-research", out: "brief, 7 questions", step: 1 },
    { lane: "enterprise", cmd: "/arch-enterprise", out: "outline, 3 options", step: 2 },
    { lane: "you", cmd: "Demand", out: "Go" },
    { lane: "board", cmd: "/arch-board", out: "who owns the risk rules", step: 3 },
    { lane: "solution", cmd: "/arch-doc", out: "HLD", step: 4 },
    { parallel: [
      { lane: "security", cmd: "/arch-security", out: "threat model", step: 5 },
      { lane: "cloud", cmd: "/arch-cloud-infra", out: "change plan", step: 6 },
    ] },
    { lane: "solution", cmd: "/arch-doc", out: "LLD, ADRs from 3 lanes", step: 7 },
    { lane: "you", cmd: "Design", out: "approve, MLRO signs the rules" },
    { lane: "solution", cmd: "/arch-solution", out: "a shortcut refused", step: 8 },
    { lane: "solution", cmd: "/arch-conform fix", out: "before the PR", step: 9 },
    { lane: "solution", cmd: "/arch-solution", out: "mark Built", step: 10 },
  ],
  steps: [
    {
      lane: "research",
      rail: "Read the rules",
      title: "Read the regulation and the provider guides first",
      why: "KYC design rests on what the rules require and what Nafath and Yakeen actually return. Nobody should design from memory, so research reads four sources and separates fact from assumption.",
      command: "/arch-research docs/brsd/BRSD-021-ekyc-onboarding.pdf, the SAMA AML and CTF rules, and the Nafath and Yakeen guides in docs/vendors/",
      routed: "research-architect. It finds Q-006 on retention already answered for transfers, and asks only what differs for KYC records",
      reads: ["project.yaml", "practice/research/questions.yaml", "the BRSD and the AML rules", "docs/vendors/nafath-guide.pdf", "docs/vendors/yakeen-guide.pdf"],
      writes: [
        { path: "practice/research/2026-10-27-brsd-021.md", change: "new" },
        { path: "practice/research/questions.yaml (Q-009 to Q-015)", change: "mod" },
        { path: "practice/research/sources.yaml (4 sources)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "table", caption: "Brief: facts vs claims", head: ["Statement", "Kind"], rows: [
            ["Due diligence must finish before the relationship starts", "Fact, AML rules"],
            ["Yakeen gives us the customer's address", "Claim. The guide lists identity fields only"],
            ["Nafath covers every customer", "Claim. Citizens and residents, not visitors"],
            ["We need a selfie and liveness check", "Claim. Depends on Q-015"],
          ] },
          { kind: "table", caption: "Questions, one owner each", head: ["Question", "Owner"], rows: [
            ["Q-009 Can we contract Yakeen directly, or only through a licensed aggregator?", { owner: "enterprise" }],
            ["Q-010 How long are KYC records kept after the relationship ends?", { owner: "enterprise" }],
            ["Q-011 Do we need to store an ID image at all?", { owner: "security" }],
            ["Q-012 Does Nafath call us back, and from which addresses?", { owner: "cloud" }],
            ["Q-013 Is KYC its own context, or part of Identity (login)?", { owner: "solution" }],
            ["Q-014 Which sanctions lists are mandatory, and how fresh must they be?", { owner: "enterprise" }],
            ["Q-015 With Nafath, is a selfie liveness check still needed?", { owner: "security" }],
          ] },
        ] },
      ],
    },
    {
      lane: "enterprise",
      rail: "Build or buy",
      title: "What to build, what to buy, and who to contract with",
      why: "Per-check fees for Yakeen, a screening vendor, and a regulated process compliance will live with for years. That is a demand assessment, and you want the options first.",
      command: "/arch-enterprise Outline for BRSD-021: build, buy or mix for eKYC, screening and monitoring. Brief: practice/research/2026-10-27-brsd-021.md",
      routed: "enterprise-architect, answering Q-009, Q-010 and Q-014",
      reads: ["the research brief", "practice/ea-playbook.md §2", "practice/templates/outline.md", "landscapes/inventory.md (vendors already held)"],
      writes: [
        { path: "outlines/solutions/ekyc-onboarding.md", change: "new" },
        { path: "questions.yaml (3 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "table", caption: "Outline: options scored 1 to 5", head: ["Option", "Function", "Feasibility", "Fit", "Cost", "Note"], numeric: [1, 2, 3, 4], pick: 2, rows: [
          ["A. Build on direct government integrations and raw list feeds", "4", "2", "4", "3", "Months of approvals, and we maintain list matching ourselves"],
          ["B. Buy one all-in-one eKYC and AML platform", "4", "5", "2", "2", "Fast, but the risk rules live in the vendor's product, not ours"],
          ["C. Nafath and Yakeen through a licensed aggregator; buy screening; build rating and case review", "5", "4", "5", "3", "Recommended. We own the rules the regulator will ask us to explain"],
        ] },
      ],
      decision: { verdict: "Go with C", text: "Q-009: the aggregator holds the Yakeen licence and we hold a contract with the aggregator. Q-010: keep KYC records 10 years after the relationship ends. Q-014: UN and local lists are mandatory and refreshed daily, which BR-3 already meets." },
    },
    {
      lane: "board",
      rail: "Who owns the rules",
      title: "Who owns the risk-rating rules, and where do they live?",
      why: "Compliance writes the rules, engineering runs them, and a changed rule can quietly let risky customers through. That crosses business, design and security, so the board convenes.",
      command: "/arch-board Who owns the KYC risk-rating rules, where do they live (code, config or a rules engine), and is KYC part of Identity?",
      routed: "Picks enterprise, solution and security. Cloud sits out: nothing here changes where it runs",
      reads: ["the outline", "src/identity/", "considerations/policies/"],
      writes: [
        { path: "considerations/policies/kyc-risk-rating.md (Draft)", change: "new" },
        { path: "questions.yaml (Q-013 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "voices", voices: [
          { lane: "enterprise", text: "The rules are policy. The MLRO owns them, and every change needs an approval trail the regulator can read. Write it down as a policy." },
          { lane: "solution", text: "No rules-engine product. Rules are versioned config in the repo, changed by pull request. KYC is its own context; Identity keeps login only." },
          { lane: "security", text: "A rule change is a fraud vector. Four-eyes approval, and every rating stores the rule version it was made with, so any past decision can be replayed." },
        ] },
        { kind: "file", name: "The board's merged reply", text:
`Recommendation  Rules are versioned config. A change needs a PR approved by an
                engineer and the MLRO. Every rating records its inputs, the
                rule version and the outcome. KYC is its own bounded context.
Disagreement    Enterprise wanted compliance to edit rules in an admin screen.
                Solution and security preferred PRs. Settled on PRs now, and a
                screen later if compliance edits more than monthly.
Decision type   Business (a policy the MLRO owns) and design (an ADR).
Next            Enterprise drafts the policy; solution writes the HLD.` },
      ],
    },
    {
      lane: "solution",
      rail: "HLD",
      title: "The HLD: onboarding as a state machine you can explain",
      why: "The outline and the board's answer go in as context. The HLD's job is to make every KYC decision traceable, and to keep as little identity data as the law allows.",
      command: "/arch-doc feature eKYC onboarding (BRSD-021). Outline: outlines/solutions/ekyc-onboarding.md. Board: rules as versioned config, KYC its own context.",
      routed: "solution-architect, with the solution-design skill, scope F (feature)",
      reads: ["practice/templates/hld.md (v4)", "the outline, the brief, the draft policy", "src/identity/ (cited by file:line)", "standards/guidelines/"],
      writes: [
        { path: "designs/solutions/ekyc-onboarding/hld.md", change: "new" },
        { path: "questions.yaml (Q-016 for security, Q-017 for cloud)", change: "mod" },
      ],
      blocks: [
        { kind: "states", label: "hld.md §6 Onboarding states", states: ["Started", "Nafath verified", "Records fetched", "Screened", "Rated", "Active"], note: "From Rated, a high-risk customer goes to In review, which ends in Active or Rejected. Any step can resume where it stopped." },
        { kind: "pair", blocks: [
          { kind: "file", name: "hld.md §4.1 Pillars", text:
`1. Government records over typed data.
2. Keep the minimum: no ID images for
   Nafath-verified customers.
3. Every decision is explainable:
   inputs, rule version, outcome.
4. Never tip off. A customer under review
   sees the same message as any slow
   application.` },
          { kind: "table", caption: "hld.md §7 Data governance", head: ["Data", "Class", "Kept"], rows: [
            ["National ID or Iqama number", "Restricted", "10 years after exit"],
            ["Name, birth date, nationality", "Personal", "10 years after exit"],
            ["Nafath transaction reference", "Evidence", "10 years after exit"],
            ["Screening hits", "Restricted", "10 years after exit"],
            ["Rating, inputs, rule version", "Confidential", "10 years after exit"],
          ] },
        ] },
        { kind: "table", caption: "hld.md §8.2 Who can do what", head: ["Role", "Sees", "Can do"], rows: [
          ["Customer", "Their own status, never the rating", "Start, resume, add Tier 2 details"],
          ["Compliance analyst", "Cases assigned to them", "Approve or reject a case"],
          ["MLRO", "All cases", "Approve rule changes, reassign cases"],
          ["Support agent", "Status and a masked ID", "Nothing on KYC"],
          ["Engineer", "No production KYC data", "Deploy"],
        ] },
      ],
    },
    {
      lane: "security",
      rail: "Threat model",
      title: "Threat model: identity fraud, insiders, and tipping off",
      why: "It runs at the same time as the change plan. The security architect models the HLD's flows and answers Q-011, Q-015 and Q-016.",
      command: "/arch-security Threat model designs/solutions/ekyc-onboarding/hld.md, including insiders and the review flow.",
      routed: "security-architect",
      reads: ["hld.md §6, §7, §8", "practice/templates/threat-model.md", "project.yaml abuse_cases"],
      writes: [
        { path: "designs/solutions/ekyc-onboarding/threat-model.md", change: "new" },
        { path: "questions.yaml (Q-011, Q-015, Q-016 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "table", caption: "threat-model.md, ranked", head: ["Rank", "Threat", "Planned control"], rows: [
          [{ tag: "1", tone: "high" }, "A fraudster starts onboarding with a victim's ID and talks the victim into approving the Nafath request", "Show the number to match in Nafath; cap attempts per ID; alert on repeats"],
          [{ tag: "2", tone: "high" }, "Real people paid to open wallets for others (money mules)", "Device and velocity signals, low Tier 1 limits, a shared-device flag"],
          [{ tag: "3", tone: "high" }, "An insider browses identity data", "Access by assigned case only; every read logged; alert on volume"],
          [{ tag: "4", tone: "high" }, "A customer or analyst reads a profile or case that is not theirs", "Ownership check in the service. Abuse tests required"],
          [{ tag: "5", tone: "med" }, "Tipping off through a message, a status code or timing", "One identical customer response for In review and Rejected"],
          [{ tag: "6", tone: "med" }, "A rule change lets risky customers through", "Four-eyes PR; the rule version stored on every rating"],
          [{ tag: "7", tone: "med" }, "ID numbers leak into logs or analytics", "A token outside the KYC store; a scrubber on the log sink"],
        ] },
        { kind: "pair", blocks: [
          { kind: "file", name: "threat-model.md · tests the build must contain", text:
`customer_cannot_read_another_customers_kyc_profile
analyst_cannot_open_case_not_assigned
in_review_and_rejected_return_same_customer_response
risk_rating_records_rule_version` },
          { kind: "file", name: "Answers", text:
`Q-011  No ID images for Nafath-verified
       customers. Storing them adds risk
       and proves nothing the records
       don't already prove.
Q-015  No selfie liveness for Tier 1 when
       Nafath succeeds. Revisit if a flow
       for visitors without Nafath is
       added.` },
        ] },
      ],
    },
    {
      lane: "cloud",
      rail: "Change plan",
      title: "Change plan: a separate store for identity data",
      why: "The HLD keeps KYC data apart from the wallet. The cloud and infra architect plans the store, its key, the daily re-screening job and the provider connectivity, and answers Q-012 and Q-017.",
      command: "/arch-cloud-infra Change plan for designs/solutions/ekyc-onboarding/hld.md: KYC data store, keys, daily re-screening job, aggregator connectivity, cost.",
      routed: "cloud-infra-architect, reusing the static egress IP from instant transfers",
      reads: ["hld.md §5, §7, §10", "designs/solutions/instant-transfers/change-plan.md", "landscapes/infra/"],
      writes: [
        { path: "designs/solutions/ekyc-onboarding/change-plan.md", change: "new" },
        { path: "questions.yaml (Q-012, Q-017 answered)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "file", name: "change-plan.md · Steps", text:
`1. A new Cloud SQL database for KYC, HA,
   me-central2, with its own identity.
2. A customer-managed key in KMS; only
   the KYC service may decrypt.
3. Q-012: the aggregator calls us back.
   Allowlist its addresses on one route;
   reuse the static egress IP outbound.
4. A Cloud Run job re-screens every
   customer daily at 02:00 Riyadh time.
5. A log sink filter that drops 10-digit
   numbers starting 1 or 2 (ID, Iqama).` },
          { kind: "table", caption: "Monthly cost, illustrative", head: ["Item", "SAR"], numeric: [1], rows: [
            ["Cloud SQL HA instance for KYC", "1,400"],
            ["Daily re-screening job", "60"],
            ["KMS keys and operations", "20"],
            ["Static egress IP", "0, reused"],
            ["Total, before per-check fees", "1,480"],
          ] },
        ] },
        { kind: "note", text: "Rollback: send new sign-ups back to the old manual flow with a flag. The KYC database stays, because records already written fall under the retention rule." },
      ],
    },
    {
      lane: "solution",
      rail: "LLD and ADRs",
      title: "The LLD (the SAD) and the ADRs",
      why: "With the threat model and the change plan in hand, the same command writes the SAD. Each lasting decision becomes an ADR from the architect whose lane it is in: solution, security or enterprise. Then you take the design decision.",
      command: "/arch-doc feature ekyc-onboarding: write the LLD from the HLD, threat-model.md and change-plan.md",
      routed: "solution-architect, with the solution-design skill",
      reads: ["practice/templates/lld.md (v3, arc42)", "hld.md, threat-model.md, change-plan.md"],
      writes: [
        { path: "designs/solutions/ekyc-onboarding/lld.md", change: "new" },
        { path: "decisions/0005 to 0008", change: "new" },
        { path: "decisions/README.md", change: "mod" },
        { path: "landscapes/app/ (logical and trust-boundary views)", change: "mod" },
      ],
      blocks: [
        { kind: "pair", blocks: [
          { kind: "table", caption: "ADRs, as Proposed", head: ["ADR", "Decision", "Lane"], rows: [
            ["0005", "Keep KYC in its own bounded context and database", { owner: "solution" }],
            ["0006", "Do not store ID images for Nafath-verified customers", { owner: "security" }],
            ["0007", "Keep risk rules as versioned config approved by the MLRO", { owner: "solution" }],
            ["0008", "Buy screening; build risk rating and case review", { owner: "enterprise" }],
          ] },
          { kind: "file", name: "lld.md §16 Rollout", text:
`Phase 1  staff only, 1 week
Phase 2  10% of new sign-ups, with the
         manual flow as a fallback
Phase 3  all new sign-ups
Phase 4  existing customers re-verify
         with Nafath at next login (BR-7)

Exit, each phase: drop-off under 25%,
no unassigned case older than 48 hours` },
        ] },
      ],
      decision: { verdict: "Approve, with two conditions", text: "The MLRO signs the first rule set and the policy before Phase 2, and Phase 4 finishes within 6 months. The policy moves to Agreed and the ADRs to Accepted." },
    },
    {
      lane: "solution",
      rail: "Build question",
      title: "A shortcut is proposed while building",
      why: "In staging, the records lookup sometimes times out, and product suggests letting customers type their details instead. Ask the solution architect before anyone does that.",
      command: "/arch-solution Yakeen sometimes times out during onboarding. Can we let the customer type their details and continue?",
      routed: "solution-architect",
      reads: ["hld.md §4.1", "lld.md §6", "ADR-0005", "src/kyc/"],
      writes: [{ path: "designs/solutions/ekyc-onboarding/lld.md §6.2", change: "mod" }],
      blocks: [
        { kind: "file", name: "The reply", text:
`No. Typed details break pillar 1 and BR-2, and a wallet must not activate
before due diligence finishes. Instead:

- Hold the onboarding before "Records fetched" and tell the customer:
  "We're finishing your checks. We'll notify you in a few minutes."
- Retry with backoff behind a circuit breaker, 5 seconds per call.
- Log the event kyc.records.fetch_failed at warn, with customer_id only.

This fits ADR-0005, so there is no new ADR. Added the runtime scenario
"records source down" to lld.md §6.2, and the test
onboarding_resumes_after_records_timeout.` },
      ],
    },
    {
      lane: "solution",
      rail: "Pre-PR check",
      title: "Check the branch against the standards before the PR",
      why: "KYC is where a breach costs the most, so the check runs against every guideline, the accepted ADRs and the threat model's required tests.",
      command: "/arch-conform feature/ekyc-onboarding fix",
      routed: "solution-architect, as a conformance check against main",
      reads: ["standards/guidelines/", "decisions/0005 to 0008", "threat-model.md", "the diff against main"],
      writes: [
        { path: "src/ and test/ (5 fixes)", change: "mod" },
        { path: "standards/guidelines/*.md Appendix A", change: "mod" },
      ],
      blocks: [
        { kind: "table", caption: "Breaches found and fixed", head: ["Severity", "Where", "Rule", "Result"], rows: [
          [{ tag: "High", tone: "high" }, "src/kyc/kyc.service.ts:57", "Observability R7: logs the national ID number", { tag: "Fixed: logs customer_id", tone: "ok" }],
          [{ tag: "High", tone: "high" }, "src/kyc/review.controller.ts:30", "Threat 5: tells the customer \"Rejected: sanctions match\"", { tag: "Fixed: same message as review", tone: "ok" }],
          [{ tag: "High", tone: "high" }, "test/kyc/", "Threat model: analyst_cannot_open_case_not_assigned is missing", { tag: "Fixed: test added", tone: "ok" }],
          [{ tag: "Med", tone: "med" }, "src/kyc/risk.ts:112", "ADR-0007: thresholds written into the code", { tag: "Fixed: moved to versioned config", tone: "ok" }],
          [{ tag: "Med", tone: "med" }, "src/kyc/yakeen.client.ts:18", "Communication patterns: an outbound call with no timeout", { tag: "Fixed: 5 s timeout and retry", tone: "ok" }],
        ] },
        { kind: "note", text: "Two checks proposed: a test that fails when any log line holds a 10-digit number starting with 1 or 2, and a contract test that the In review and Rejected responses are byte for byte the same." },
      ],
    },
    {
      lane: "solution",
      rail: "Ship",
      title: "Ship, and make the documents true again",
      why: "The PR is reviewed against the design and the export check passes. After the merge, the design is marked Built and every view that changed is updated.",
      command: "/arch-solution mark ekyc-onboarding Built",
      routed: "solution-architect",
      reads: ["the merged code", "hld.md, lld.md", "landscapes/"],
      writes: [
        { path: "hld.md, lld.md (status: Built)", change: "mod" },
        { path: "landscapes/app/ integration view (Nafath, Yakeen through the aggregator, screening vendor)", change: "mod" },
        { path: "landscapes/inventory.md (2 vendors)", change: "mod" },
        { path: "considerations/policies/kyc-risk-rating.md (Agreed)", change: "mod" },
        { path: "questions.yaml (Q-009 to Q-017 closed)", change: "mod" },
      ],
      blocks: [
        { kind: "note", text: "Template gap reported: the HLD template has nowhere to list the decisions a regulator may ask you to explain. It suggests an explainability prompt in practice/templates/hld.md §7, as v5." },
      ],
    },
  ],
  coverage: [
    ["/arch-research", "1", "A BRSD, a regulation and two provider guides", "A brief and 7 owned questions"],
    ["/arch-enterprise", "2", "Per-check fees, a vendor, a long-lived regulated process", "An outline with 3 scored options"],
    ["/arch-board", "3", "Rule ownership, across business, design and security", "One recommendation and a draft policy"],
    ["/arch-doc", "4, 7", "An approved demand that needs a design", "The HLD, then the LLD (SAD), with 4 ADRs from three lanes"],
    ["/arch-security", "5", "The HLD's flows and identity data", "A threat model and 4 required tests"],
    ["/arch-cloud-infra", "6", "A new data store, a key and a scheduled job", "A change plan with cost and rollback"],
    ["/arch-solution", "8, 10", "A shortcut proposed during the build; then the merge", "A refusal with a safe alternative; status Built"],
    ["/arch-conform", "9", "A branch about to become a PR", "5 breaches fixed, 2 checks proposed"],
  ],
};

export const examples: Example[] = [transfers, kyc];

export const examplesCopy = {
  eyebrow: "Worked examples",
  title: ["One requirement, ", "every command", ", start to finish"],
  lede:
    "Two requirements documents from a made-up Saudi wallet, followed through the whole team. Each step shows what you type, which architect picks it up, what it reads, what it writes, and where you decide.",
  disclaimer:
    "These are simulations. No agent ran. They are written from the kit's own commands, agents and templates, so the routing, file paths and document sections match what the team produces. Samra Pay, its vendors, the code paths and the costs are invented, and the regulatory details are illustrative. Before building either for real, run /arch-research on the current rules.",
};
