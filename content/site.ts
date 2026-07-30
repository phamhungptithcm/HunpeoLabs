export type Service = {
  slug: string;
  name: string;
  summary: string;
  problem: string;
  bestFor: string;
  boundary: string;
  outcome: string;
  deliverables: string[];
  process: string[];
};

export type Product = {
  slug: string;
  name: string;
  summary: string;
  maturity: string;
  audience: string;
  purpose: string;
  boundary: string;
  capabilities: string[];
  flow: string[];
  repositoryUrl?: string;
};

export type WorkItem = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  focus: string[];
  status: string;
  productSlug?: string;
  context: string;
  decision: string;
  evidence: string[];
  trace: string[];
  repositoryUrl?: string;
};

export const services: Service[] = [
  {
    slug: "web-development",
    name: "Web Development",
    summary:
      "High-quality marketing sites, web applications, and SaaS experiences built around clarity, speed, and durable product foundations.",
    problem:
      "Teams need a web presence or product experience that communicates clearly and can evolve without a costly rebuild.",
    bestFor:
      "Teams launching or rebuilding a marketing site, SaaS interface, or web application that needs a maintainable product and content foundation.",
    boundary:
      "The engagement covers product and content structure plus frontend delivery. Backend systems, commerce, and ongoing content operations are included only when explicitly scoped.",
    outcome:
      "A reviewable web foundation with accessible interface behavior, content structure, delivery checks, and handoff documentation.",
    deliverables: [
      "Product and content architecture",
      "Responsive UX and visual direction",
      "Accessible frontend implementation",
      "SEO-ready delivery foundation",
      "Production and handoff documentation",
    ],
    process: ["Discover", "Design", "Build", "Validate", "Launch"],
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    summary:
      "Mobile products designed for real workflows, dependable interaction, and a coherent experience across the product ecosystem.",
    problem:
      "A mobile app must earn its place on a user’s device through utility, speed, and a carefully designed interaction model.",
    bestFor:
      "Teams shaping a new mobile product or improving a mobile workflow whose value depends on focused, dependable interaction.",
    boundary:
      "Platform choice, backend changes, device capabilities, and store submission support are confirmed during scoping rather than assumed.",
    outcome:
      "A defined mobile product direction with interaction, implementation, quality, and release-readiness decisions made explicit.",
    deliverables: [
      "Mobile product strategy",
      "Interaction and navigation model",
      "iOS, Android, or cross-platform implementation plan",
      "Quality and release readiness",
      "Store submission support when scoped",
    ],
    process: ["Frame", "Prototype", "Engineer", "Test", "Release"],
  },
  {
    slug: "ai-agent-development",
    name: "AI Agent Development",
    summary:
      "Custom agents and intelligent workflows with explicit tools, evaluation, evidence, and human decision boundaries.",
    problem:
      "Useful AI agents need more than a prompt: they need bounded capabilities, system context, verification, and accountable controls.",
    bestFor:
      "Teams automating a bounded workflow where an agent must use tools, act on system context, and remain within explicit approval boundaries.",
    boundary:
      "This service focuses on agent behavior, tools, evaluation, and governance. A broader user-facing AI experience is better framed as AI Product Engineering; an unbounded autonomous system is not the goal.",
    outcome:
      "A bounded agent workflow with named capabilities, integrations, evaluation scenarios, approval points, and an operational evidence plan.",
    deliverables: [
      "Agent workflow and capability model",
      "Tool and system integrations",
      "Evaluation and test scenarios",
      "Human approval boundaries",
      "Operational evidence and observability plan",
    ],
    process: ["Model intent", "Bound tools", "Build", "Evaluate", "Govern"],
  },
  {
    slug: "ai-product-engineering",
    name: "AI Product Engineering",
    summary:
      "AI features and products shaped around a real user journey, measurable behavior, and production constraints.",
    problem:
      "AI prototypes often fail when they meet product UX, latency, data, cost, safety, and operational reality.",
    bestFor:
      "Teams turning an AI capability or prototype into a user-facing feature or product with explicit experience and failure-state decisions.",
    boundary:
      "This service owns the product behavior around AI. A tool-using autonomous workflow with approval boundaries is better framed as AI Agent Development.",
    outcome:
      "A production-shaped AI product direction covering user value, interaction, model integration, evaluation, failure states, and readiness risks.",
    deliverables: [
      "AI product discovery",
      "Experience and failure-state design",
      "Model and integration architecture",
      "Evaluation strategy",
      "Production readiness roadmap",
    ],
    process: ["Find value", "Design behavior", "Integrate", "Evaluate", "Operate"],
  },
  {
    slug: "platform-modernization",
    name: "Platform Modernization",
    summary:
      "Practical modernization paths for teams constrained by fragmented systems, slow delivery, or fragile operational foundations.",
    problem:
      "Modernization becomes risky when architecture, migration sequence, ownership, and rollback are not treated as one system.",
    bestFor:
      "Teams that have decided change is necessary and need a phased path from the current platform to a more dependable operating foundation.",
    boundary:
      "The engagement focuses on modernization direction, sequencing, migration risk, and rollback. Ongoing governance policy is treated separately unless scoped.",
    outcome:
      "A phased modernization path connecting current-state architecture, target direction, delivery guardrails, migration evidence, and rollback decisions.",
    deliverables: [
      "Current-state architecture map",
      "Target platform direction",
      "Phased migration plan",
      "Delivery and operational guardrails",
      "Risk, evidence, and rollback model",
    ],
    process: ["Observe", "Map", "Prioritize", "Migrate", "Prove"],
  },
  {
    slug: "architecture-governance",
    name: "Architecture & Governance",
    summary:
      "Architecture review and engineering governance that turn technical decisions into an executable, reviewable change path.",
    problem:
      "Enterprise change stalls when technical direction, risk, evidence, and decision ownership live in separate conversations.",
    bestFor:
      "Teams that need to make or govern consequential technical decisions before committing to a migration or implementation path.",
    boundary:
      "The engagement establishes decision ownership, review evidence, approval, and sign-off. It does not imply delivery of the resulting modernization program.",
    outcome:
      "A reviewable decision system linking architecture, dependencies, risk, ownership, implementation direction, and verification expectations.",
    deliverables: [
      "Architecture and dependency review",
      "Risk and decision register",
      "Governance and approval model",
      "Implementation roadmap",
      "Verification and sign-off contract",
    ],
    process: ["Inspect", "Trace", "Decide", "Plan", "Verify"],
  },
];

export const products: Product[] = [
  {
    slug: "ai-agent-kit",
    name: "AI Agent Kit",
    summary:
      "A governed engineering system for building repository-aware AI agents.",
    maturity: "Open-source engineering platform",
    audience:
      "Engineering teams defining repository-aware agent workflows that require explicit authorization, source context, and reviewable evidence.",
    purpose:
      "Connect understanding, planning, authorization, execution, and verification in one governed workflow.",
    boundary:
      "The public profile describes the current engineering platform and its controls; it does not claim a customer outcome or universal production readiness.",
    capabilities: [
      "Allow / Ask / Deny decisions",
      "Approval-to-diff controls",
      "Evidence receipts",
      "Repository intelligence",
      "Governed memory boundaries",
    ],
    flow: ["Understand", "Plan", "Authorize", "Execute", "Verify"],
    repositoryUrl: "https://github.com/phamhungptithcm/ai-agent-kit",
  },
  {
    slug: "incov",
    name: "IncOv",
    summary:
      "Operational incident intelligence built around evidence, reusable resolution knowledge, and human approval.",
    maturity: "Applied AI product under validation",
    audience:
      "Teams exploring how reviewed incident knowledge can support repeatable operational decisions without removing human responsibility.",
    purpose:
      "Turn incident intake, trusted knowledge, bounded assessment, and approval into a reviewable decision-support flow.",
    boundary:
      "IncOv remains under validation. The public profile describes its intended workflow and controls, not a measured production outcome.",
    capabilities: [
      "Incident intake and normalization",
      "Deterministic knowledge matching",
      "Bounded AI assessment",
      "Policy and approval controls",
      "Reusable resolution evidence",
    ],
    flow: [
      "Incident intake",
      "Normalize and group",
      "Trusted knowledge",
      "Bounded assessment",
      "Policy and approval",
    ],
  },
  {
    slug: "gig",
    name: "Gig",
    summary:
      "Evidence-first release intelligence for tracing source change to production truth.",
    maturity: "Open-source engineering project",
    audience:
      "Engineering and release teams that need one reviewable trail across source changes, delivery evidence, and production state.",
    purpose:
      "Connect a ticket, release path, evidence, production state, and review in one release truth graph.",
    boundary:
      "Gig is an open-source engineering project. Its public profile describes inspectable release workflows, not an unverified production outcome.",
    capabilities: [
      "Ticket-aware source tracing",
      "Release path inspection",
      "Evidence collection",
      "Production-state review",
      "Human and JSON output",
    ],
    flow: ["Source change", "Release path", "Evidence", "Production state", "Review"],
    repositoryUrl: "https://github.com/phamhungptithcm/gig",
  },
];

export const work: WorkItem[] = [
  {
    slug: "ai-agent-kit",
    name: "AI Agent Kit",
    category: "AI systems / engineering governance",
    summary:
      "An open engineering foundation for repository-aware agent workflows with explicit authorization and evidence boundaries.",
    focus: ["Agent runtime", "Repository intelligence", "Governance", "Evidence"],
    status: "Open-source product work",
    productSlug: "ai-agent-kit",
    context:
      "The product profile is the canonical description of AI Agent Kit until a separate, evidence-backed case study is available.",
    decision:
      "Keep product capabilities and maturity in one canonical profile instead of publishing a second page with the same entity intent.",
    evidence: ["Current capabilities", "Maturity label", "Governance boundaries"],
    trace: ["Product need", "Governed workflow", "Capabilities", "Verification"],
  },
  {
    slug: "incov",
    name: "IncOv",
    category: "Applied AI / incident intelligence",
    summary:
      "A product exploration for turning operational incidents and reviewed knowledge into bounded, reusable decision support.",
    focus: ["Operational workflows", "Knowledge reuse", "Human approval", "Validation"],
    status: "Product under validation",
    productSlug: "incov",
    context:
      "The product profile is the canonical description of IncOv while the product remains under validation.",
    decision:
      "Keep the intended workflow, maturity, and boundaries together rather than presenting an unsupported case-study narrative.",
    evidence: ["Current workflow", "Validation status", "Human approval boundary"],
    trace: ["Incident context", "Reviewed knowledge", "Bounded assessment", "Approval"],
  },
  {
    slug: "gig",
    name: "Gig",
    category: "Release intelligence / open source",
    summary:
      "Evidence-first release intelligence focused on tracing the path from source change to production truth.",
    focus: ["Release evidence", "Source control", "Traceability", "Developer workflow"],
    status: "Open-source engineering project",
    productSlug: "gig",
    context:
      "A release becomes difficult to review when source control, delivery steps, and production evidence are considered separately.",
    decision:
      "Focus the work on traceability from a source change through release evidence to a reviewable production state.",
    evidence: ["Release evidence", "Source control", "Traceability", "Developer workflow"],
    trace: ["Source change", "Release path", "Evidence", "Production state", "Review"],
    repositoryUrl: "https://github.com/phamhungptithcm/gig",
  },
];

export const principles = [
  {
    title: "See the real system",
    body: "Start with what exists, not assumptions.",
    practice: "Read the code, workflow, users, and constraints.",
    avoid: "Designing for an imagined system.",
  },
  {
    title: "Make risk visible",
    body: "Show what changes, who owns it, and what can go wrong.",
    practice: "Map decisions, dependencies, and evidence.",
    avoid: "Hiding uncertainty.",
  },
  {
    title: "Start small",
    body: "Build the smallest useful, testable change.",
    practice: "Choose one real outcome.",
    avoid: "Calling a demo done.",
  },
  {
    title: "Prove it works",
    body: "Test, observe, and keep the evidence.",
    practice: "Connect behavior to proof.",
    avoid: "Replacing proof with confidence.",
  },
  {
    title: "Scale with care",
    body: "Expand only when value and failure modes are clear.",
    practice: "Add guardrails, an owner, and a rollback path.",
    avoid: "Scaling too early.",
  },
];

export const enterpriseDimensions = [
  "Deployment boundary",
  "Data ownership",
  "Approval model",
  "Auditability",
  "Integration strategy",
  "Rollback evidence",
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getWork(slug: string) {
  return work.find((item) => item.slug === slug);
}
