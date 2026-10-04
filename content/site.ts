export type Service = {
  headline: string;
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
    "slug": "web-development",
    "name": "Web Development",
    "headline": "A website that explains your business. A web app that gets work done.",
    "summary": "We design and build marketing websites, e-commerce websites, customer portals, and web application interfaces that make your offer clear and your users' next step easy.",
    "problem": "You are launching a business, replacing an outdated website, or turning a product idea into a usable web experience.",
    "bestFor": "You are launching a business, replacing an outdated website, or turning a product idea into a usable web experience.",
    "boundary": "Backend services, carts and checkout, payments, shipping, inventory and CMS integrations, hosting setup, and ongoing content support are agreed separately when needed.",
    "outcome": "A working website or web interface, reviewed against the agreed scope, with the materials your team needs to maintain it.",
    "deliverables": [
      "Page structure and content organized around your audience and offer.",
      "Responsive interface designs for desktop and mobile.",
      "Implemented pages, reusable components, and the agreed user journeys.",
      "Technical SEO foundations and accessibility and performance checks.",
      "Source code, setup instructions, test results, and release guidance."
    ],
    "process": [
      "Understand",
      "Design",
      "Build",
      "Test",
      "Hand over"
    ]
  },
  {
    "slug": "mobile-app-development",
    "name": "Mobile App Development",
    "headline": "Bring your service into your customers' hands.",
    "summary": "We turn a mobile product idea into an app built around the actions your users need most, from the first screen through the core workflow.",
    "problem": "You need a first mobile release, a better experience in an existing app, or a mobile companion to your web product.",
    "bestFor": "You need a first mobile release, a better experience in an existing app, or a mobile companion to your web product.",
    "boundary": "iOS, Android, or cross-platform delivery, backend work, device integrations, and store submission support are confirmed before development. Store approval remains subject to the platform's review.",
    "outcome": "A tested app build covering the agreed journeys, plus the source and release materials needed for the next step.",
    "deliverables": [
      "A focused release scope and clear user journeys.",
      "Navigation, screen designs, and an interactive prototype.",
      "An implemented app for the platform or platforms agreed for the project.",
      "Device and workflow testing, including loading, error, and empty states.",
      "Source code, build instructions, release checklist, and handover documentation."
    ],
    "process": [
      "Define",
      "Prototype",
      "Build",
      "Test",
      "Prepare release"
    ]
  },
  {
    "slug": "ai-agent-development",
    "name": "AI Agent Development",
    "headline": "Turn repeatable work into an AI-assisted workflow.",
    "summary": "We build agents that work with your approved tools and information to complete defined tasks, with clear limits on what they can do and when they need your team's approval.",
    "problem": "Your team repeatedly gathers information, prepares outputs, or moves work between systems, and you want to automate a specific part of that process.",
    "bestFor": "Your team repeatedly gathers information, prepares outputs, or moves work between systems, and you want to automate a specific part of that process.",
    "boundary": "We agree on data access, actions, model providers, and usage costs before implementation. For a complete user-facing AI experience, choose AI Product Engineering.",
    "outcome": "A working agent for the agreed task, with reviewed evaluation results and a clear way for your team to supervise it.",
    "deliverables": [
      "A workflow map defining inputs, actions, outputs, and approval steps.",
      "Agent implementation with the agreed tool and system integrations.",
      "Access rules and human review for sensitive actions.",
      "Evaluation scenarios for successful tasks, incorrect outputs, and tool failures.",
      "Run logs, operating instructions, and a handover of known limitations."
    ],
    "process": [
      "Map the task",
      "Connect tools",
      "Build",
      "Evaluate",
      "Hand over"
    ]
  },
  {
    "slug": "ai-product-engineering",
    "name": "AI Product Engineering",
    "headline": "Make AI a useful part of your product.",
    "summary": "We design and build AI features that fit a real user journey, connecting the interface, model, and approved data with clear behavior when an answer is missing or wrong.",
    "problem": "You have an AI idea or prototype and need to turn it into a feature people can use, understand, and give feedback on.",
    "bestFor": "You have an AI idea or prototype and need to turn it into a feature people can use, understand, and give feedback on.",
    "boundary": "Data preparation, provider charges, hosting, and ongoing model evaluation are agreed for each project. For an agent that takes actions across tools, choose AI Agent Development.",
    "outcome": "An integrated AI feature tested against the agreed use case, with the evidence and instructions needed to assess release readiness.",
    "deliverables": [
      "A defined use case and acceptance criteria for the first release.",
      "Interface and interaction designs, including feedback and fallback paths.",
      "An implemented AI feature with the agreed model and data integrations.",
      "Quality evaluations and latency and usage-cost checks for agreed scenarios.",
      "Release documentation, operating guidance, and documented limitations."
    ],
    "process": [
      "Define value",
      "Design",
      "Integrate",
      "Evaluate",
      "Prepare release"
    ]
  },
  {
    "slug": "platform-modernization",
    "name": "Platform Modernization",
    "headline": "Improve the system your business already depends on.",
    "summary": "We assess your existing platform and carry out agreed improvements in manageable stages, with checks and a rollback approach for each release.",
    "problem": "An existing application is difficult to change, integrations are fragile, or an aging platform is holding back the next release.",
    "bestFor": "An existing application is difficult to change, integrations are fragile, or an aging platform is holding back the next release.",
    "boundary": "Assessment can be purchased separately. Implementation, data migration, deployment windows, and production access require explicit agreement for each phase.",
    "outcome": "A completed modernization phase, reviewed against its acceptance criteria, and a documented path for the remaining work.",
    "deliverables": [
      "A map of the current system and its important dependencies.",
      "Prioritized changes tied to your operational and product needs.",
      "A phased modernization plan with clear acceptance criteria.",
      "Implemented improvements for the agreed phase, with migration work where scoped.",
      "Validation results, rollback instructions, and updated operating documentation."
    ],
    "process": [
      "Assess",
      "Prioritize",
      "Implement",
      "Validate",
      "Hand over"
    ]
  },
  {
    "slug": "architecture-governance",
    "name": "Architecture & Governance",
    "headline": "Make the next technical decision with a clear path forward.",
    "summary": "We review your architecture and delivery practices, identify the decisions that matter, and turn them into a practical roadmap your team can follow.",
    "problem": "You need an independent review before a major build, clearer engineering standards, or a consistent way to approve and verify changes.",
    "bestFor": "You need an independent review before a major build, clearer engineering standards, or a consistent way to approve and verify changes.",
    "boundary": "This is an advisory engagement. Implementation can be scoped as a follow-on project. Reviews do not constitute legal advice, certification, or a compliance audit.",
    "outcome": "A documented technical direction, clear responsibilities, and an actionable plan for delivery.",
    "deliverables": [
      "Architecture and dependency review with prioritized findings.",
      "Technical options and trade-offs linked to your requirements.",
      "A decision register with decision ownership and next actions.",
      "Practical review, approval, and verification checklists.",
      "An implementation roadmap and a walkthrough with your team."
    ],
    "process": [
      "Inspect",
      "Compare options",
      "Decide",
      "Document",
      "Walk through"
    ]
  }
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
