/** Buyer guidance grounded in the existing service scope. No prices or timing promises. */
export type ServiceDiscovery = {
  productIds: readonly string[];
  questions: readonly { question: string; answer: string }[];
};

/** Explicit editorial matches; unrelated or newly published articles get no guessed CTA. */
export const articleServiceIds: Readonly<Record<string, readonly string[]>> = {
  "ai-agent-kit-a-story-that-began-with-a-small-worry": ["ai-agent-development", "architecture-governance"],
  "you-can-run-a-company-with-ai-agents-but-who-is-running-the-agents": ["ai-agent-development", "ai-product-engineering"],
};

export const serviceDiscovery: Readonly<Record<string, ServiceDiscovery>> = {
  "web-development": {
    productIds: ["satsunic-seo"],
    questions: [
      { question: "What should I prepare for a website project?", answer: "Share your audience, the pages or workflows you need, existing content, and any integrations. These help define the first release and its acceptance criteria." },
      { question: "Does website development include SEO?", answer: "The agreed delivery includes technical SEO foundations and accessibility and performance checks. Search rankings, ongoing content work, hosting, and third-party charges need their own discussion." },
    ],
  },
  "mobile-app-development": {
    productIds: ["befam"],
    questions: [
      { question: "Can the project cover iOS and Android?", answer: "The target platforms and native or cross-platform approach are confirmed before development. Backend integrations and store submission support are scoped alongside the app." },
      { question: "What is delivered before a store launch?", answer: "The agreed delivery includes tested app builds, source code, build instructions, a release checklist, and handover documentation. Store approval is decided by the platform." },
    ],
  },
  "ai-agent-development": {
    productIds: ["ai-agent-kit"],
    questions: [
      { question: "How does an AI agent differ from an AI product feature?", answer: "An agent performs a defined task across approved tools and information. AI Product Engineering covers a user-facing feature, including its interface, data integration, feedback, and fallback behavior." },
      { question: "How are access and model costs handled?", answer: "Data access, allowed actions, model providers, and usage costs are agreed before implementation. Sensitive actions need clear approval steps, and evaluations cover incorrect outputs and tool failures." },
    ],
  },
  "ai-product-engineering": {
    productIds: ["ai-agent-kit"],
    questions: [
      { question: "What does an AI feature project include?", answer: "The scope defines a real user journey, interface behavior, approved model and data integrations, feedback, fallback paths, and quality evaluations. Data preparation, hosting, and provider charges are agreed for the project." },
      { question: "Can we start with one use case?", answer: "The first release is defined around an agreed use case and acceptance criteria. That gives the team specific behavior to evaluate before deciding on further work." },
    ],
  },
  "platform-modernization": {
    productIds: ["ai-agent-kit"],
    questions: [
      { question: "Can we assess the platform before committing to a rebuild?", answer: "Assessment can be scoped separately. It maps dependencies and priorities so the team can decide which modernization phase to implement." },
      { question: "How are migration and release risks addressed?", answer: "Each agreed phase defines acceptance checks and rollback instructions. Migration work, deployment windows, and production access require explicit agreement." },
    ],
  },
  "architecture-governance": {
    productIds: ["ai-agent-kit"],
    questions: [
      { question: "What do we receive from an architecture review?", answer: "The agreed review provides prioritized findings, technical options and trade-offs, a decision register, practical verification checklists, and an implementation roadmap." },
      { question: "Does the review include implementation or certification?", answer: "This is an advisory engagement. Implementation can be scoped separately. The review does not constitute legal advice, certification, or a compliance audit." },
    ],
  },
};
