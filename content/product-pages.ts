export const productPageSlugs = ["ai-agent-kit", "incov", "gig"] as const;

export type ProductPageSlug = (typeof productPageSlugs)[number];

export type ProductPageAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type ProductPageConfig = {
  slug: ProductPageSlug;
  label: string;
  status: string;
  headline: string;
  summary: string;
  meta: string[];
  primaryAction: ProductPageAction;
  secondaryAction: ProductPageAction;
  media: {
    src: string;
    poster: string;
    label: string;
    duration: string;
    caption: string;
  };
  command?: string;
  problem: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  workflow: Array<{
    title: string;
    body: string;
  }>;
  capabilities: Array<{
    title: string;
    body: string;
  }>;
  evidence: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  statement?: string;
  boundary: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  finalCta: {
    headline: string;
    primary: ProductPageAction;
    secondary: ProductPageAction;
  };
};

export const productPages: Record<ProductPageSlug, ProductPageConfig> = {
  "ai-agent-kit": {
    slug: "ai-agent-kit",
    label: "AI Agent Kit / Control plane",
    status: "Open-source engineering platform",
    headline: "Give AI agents room to work. Keep control.",
    summary: "Repository context, explicit approval, and evidence in one workflow.",
    meta: ["Open source", "Governed", "Inspectable"],
    primaryAction: { label: "Watch the demo", href: "#demo" },
    secondaryAction: {
      label: "View source",
      href: "https://github.com/phamhungptithcm/ai-agent-kit",
      external: true,
    },
    media: {
      src: "/media/products/ai-agent-kit/bootstrap-demo.mp4",
      poster: "/media/products/ai-agent-kit/bootstrap-demo-poster.jpg",
      label: "Governed bootstrap",
      duration: "00:15",
      caption: "A real local bootstrap flow from the public AI Agent Kit repository.",
    },
    command: "npx --yes @hunpeolabs/ai-agent-kit@latest bootstrap",
    problem: {
      eyebrow: "01 / Why",
      headline: "Fast agents need firm boundaries.",
      body: "Speed without repository context, permission, and proof becomes risk.",
    },
    workflow: [
      { title: "Understand", body: "Read the repository." },
      { title: "Plan", body: "Define the change." },
      { title: "Authorize", body: "Ask before risk." },
      { title: "Execute", body: "Stay in scope." },
      { title: "Verify", body: "Record evidence." },
    ],
    capabilities: [
      { title: "Read the repo", body: "Use repository intelligence and local constraints." },
      { title: "Plan the change", body: "Make expected edits and checks reviewable." },
      { title: "Ask before risk", body: "Apply Allow, Ask, or Deny decisions." },
      { title: "Act within scope", body: "Tie execution to the approved diff." },
      { title: "Leave evidence", body: "Keep receipts another reviewer can inspect." },
    ],
    evidence: {
      eyebrow: "Evidence",
      headline: "Every action leaves a receipt.",
      body: "Authorization, verification, and the resulting change stay connected.",
    },
    boundary: {
      eyebrow: "03 / Current boundary",
      headline: "Open source. Inspectable by design.",
      body: "An engineering platform—not a promise of every production outcome.",
    },
    faq: [
      {
        question: "Where is the source?",
        answer: "The verified public source is available on GitHub.",
      },
      {
        question: "How do I install it?",
        answer: "Run the bootstrap command shown above from the repository you want to govern.",
      },
      {
        question: "How do I report an issue?",
        answer: "Use the public GitHub issue tracker so the report stays inspectable.",
      },
      {
        question: "What support is available?",
        answer: "Use the Hunpeo Labs contact page for product or implementation questions.",
      },
    ],
    finalCta: {
      headline: "Start with the source.",
      primary: {
        label: "Inspect GitHub",
        href: "https://github.com/phamhungptithcm/ai-agent-kit",
        external: true,
      },
      secondary: {
        label: "Read the docs",
        href: "https://github.com/phamhungptithcm/ai-agent-kit/tree/main/docs",
        external: true,
      },
    },
  },
  incov: {
    slug: "incov",
    label: "IncOv / Incident intelligence",
    status: "Applied AI / Under validation",
    headline: "Turn every incident into better judgment.",
    summary: "Match live signals with reviewed knowledge. Keep a human in control.",
    meta: ["Evidence-led", "Human-approved", "Reviewable"],
    primaryAction: { label: "Watch 30s demo", href: "#demo" },
    secondaryAction: { label: "See the workflow", href: "#workflow" },
    media: {
      src: "/media/products/incov/architecture-walkthrough.mp4",
      poster: "/media/products/incov/architecture-walkthrough-poster.jpg",
      label: "Incident walkthrough",
      duration: "00:30",
      caption: "Incident intake, reviewed knowledge, bounded assessment, and human approval.",
    },
    problem: {
      eyebrow: "01 / The gap",
      headline: "The fix exists. The context is scattered.",
      body: "IncOv turns reviewed incident knowledge into reusable decision support.",
    },
    workflow: [
      { title: "Intake", body: "Capture the incident." },
      { title: "Group", body: "Connect related signals." },
      { title: "Match", body: "Find reviewed knowledge." },
      { title: "Assess", body: "Bound the recommendation." },
      { title: "Approve", body: "Keep ownership human." },
    ],
    capabilities: [
      { title: "Incidents", body: "Normalize approved operational inputs." },
      { title: "Resolution Packs", body: "Reuse reviewed SME knowledge." },
      { title: "Evidence", body: "Keep the reasoning inspectable." },
      { title: "Approval", body: "Stop at the human decision boundary." },
    ],
    evidence: {
      eyebrow: "Evidence trail",
      headline: "AI recommends. People decide.",
      body: "The recommendation, reviewed evidence, and named approval point remain visible.",
    },
    statement: "Less guessing. More reviewed context.",
    boundary: {
      eyebrow: "03 / Current boundary",
      headline: "Under validation. Built to be reviewed.",
      body: "The workflow is public. Measured production outcomes are not claimed.",
    },
    faq: [
      {
        question: "What does IncOv ingest?",
        answer: "Approved incident inputs that can be normalized into the review workflow.",
      },
      {
        question: "How is knowledge matched?",
        answer: "Against reviewed Resolution Packs before bounded AI assessment.",
      },
      {
        question: "Where does approval happen?",
        answer: "At the human policy gate before any external action.",
      },
      {
        question: "What is validated today?",
        answer: "The public walkthrough shows the intended workflow and controls, not a measured production outcome.",
      },
    ],
    finalCta: {
      headline: "Make the next incident easier.",
      primary: { label: "Watch the workflow", href: "#demo" },
      secondary: { label: "Talk to Hunpeo Labs", href: "/contact" },
    },
  },
  gig: {
    slug: "gig",
    label: "Gig / Release intelligence",
    status: "Open-source engineering project",
    headline: "Know what changed. Know what shipped.",
    summary: "Trace source change to production truth in one reviewable trail.",
    meta: ["Open source", "Evidence-first", "Traceable"],
    primaryAction: { label: "Replay a release", href: "#demo" },
    secondaryAction: {
      label: "View source",
      href: "https://github.com/phamhungptithcm/gig",
      external: true,
    },
    media: {
      src: "/media/products/gig/release-showcase.mp4",
      poster: "/media/products/gig/release-showcase-poster.jpg",
      label: "Release trace",
      duration: "00:14",
      caption: "A real Gig demo moving from ticket inspection to release evidence.",
    },
    problem: {
      eyebrow: "01 / The problem",
      headline: "A release is more than a green check.",
      body: "Source, delivery, and production evidence belong in one story.",
    },
    workflow: [
      { title: "Source change", body: "Find the ticket." },
      { title: "Release path", body: "Follow delivery." },
      { title: "Evidence", body: "Collect checks." },
      { title: "Production state", body: "Confirm what is live." },
      { title: "Review", body: "Inspect the trail." },
    ],
    capabilities: [
      { title: "Trace the change", body: "Link a ticket to its source changes." },
      { title: "Follow delivery", body: "Map the release path end to end." },
      { title: "Collect evidence", body: "Keep checks beside the release step." },
      { title: "Confirm production", body: "Record the reviewable production state." },
      { title: "Review the story", body: "Inspect the complete release truth graph." },
    ],
    evidence: {
      eyebrow: "Release truth graph",
      headline: "See the whole trail. Then inspect any step.",
      body: "Ticket, commit, checks, delivery, and production state remain connected.",
    },
    statement: "Release confidence starts with traceability.",
    boundary: {
      eyebrow: "03 / Current boundary",
      headline: "Open source. Evidence first.",
      body: "An engineering project focused on inspectable release paths—not unverified production claims.",
    },
    faq: [
      {
        question: "Where is the source?",
        answer: "The verified public source is available on GitHub.",
      },
      {
        question: "What evidence can Gig trace?",
        answer: "Source changes, the release path, checks, production state, and review evidence.",
      },
      {
        question: "How does the trace work?",
        answer: "The gig trace command builds a release truth graph for one ticket.",
      },
      {
        question: "How do I report an issue?",
        answer: "Use the public GitHub issue tracker so the report stays connected to the source.",
      },
    ],
    finalCta: {
      headline: "Inspect the release trail.",
      primary: {
        label: "View GitHub",
        href: "https://github.com/phamhungptithcm/gig",
        external: true,
      },
      secondary: {
        label: "Read the demo guide",
        href: "https://github.com/phamhungptithcm/gig/blob/main/docs/25-demo-guide.md",
        external: true,
      },
    },
  },
};

export function getProductPage(slug: string): ProductPageConfig | undefined {
  return productPages[slug as ProductPageSlug];
}
