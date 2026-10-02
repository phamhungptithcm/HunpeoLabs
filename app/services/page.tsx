import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ServicesCta, ServicesDelivery } from "@/components/services-content";
import { services } from "@/content/site";

export const metadata = createPageMetadata({
  title: "Software Development & AI Services",
  description: "Explore web development, mobile apps, AI agents, AI product engineering, platform modernization, and architecture services from Hunpeo Labs.",
  path: "/services",
});

const groups = [
  { label: "01 / DIGITAL PRODUCTS", title: "Build the experience.", body: "Websites and applications built around what your customers need to do.", entries: [
    { slug: "web-development", symbol: "</>", summary: "Websites and web apps, designed, built, and ready for handover." },
    { slug: "mobile-app-development", symbol: "[↗]", summary: "Mobile experiences, from first prototype to a tested app build." },
  ] },
  { label: "02 / AI SYSTEMS", title: "Put AI to work.", body: "Useful intelligence, connected to real tasks and designed for human oversight.", entries: [
    { slug: "ai-agent-development", symbol: "{ai}", summary: "Agents that complete defined tasks with your team in control." },
    { slug: "ai-product-engineering", symbol: "✳", summary: "Useful AI features, connected to your product and your data." },
  ] },
  { label: "03 / PLATFORMS & ARCHITECTURE", title: "Move your systems forward.", body: "Practical improvements to the software and technical decisions behind your business.", entries: [
    { slug: "platform-modernization", symbol: "≋", summary: "Agreed platform improvements, implemented one phase at a time." },
    { slug: "architecture-governance", symbol: "⌘", summary: "Technical direction your team can turn into a delivery plan." },
  ] },
];
const projects = [
  { name: "AI Agent Kit", slug: "ai-agent-kit", status: "Open-source engineering platform", summary: "Repository-aware agent workflows with explicit controls and reviewable evidence.", steps: ["Context", "Agent", "Review"] },
  { name: "Gig", slug: "gig", status: "Open-source engineering project", summary: "Connect source changes, release paths, and the evidence behind a delivery.", steps: ["Source", "Release", "Evidence"] },
  { name: "IncOv", slug: "incov", status: "Under validation", summary: "Explore incident decision support with trusted knowledge and human review.", steps: ["Incident", "Knowledge", "Decision"] },
];
const questions = [
  ["Can we start with an idea?", "Yes. Start with the problem, the intended users, and the outcome you want. Discovery defines the first scope and the decisions needed before development."],
  ["What will we receive at handover?", "The agreed deliverables, relevant source code and documentation, test results, and any accepted limitations. The exact handover is defined before work begins."],
  ["Can you work on an existing product?", "Yes. We first review the relevant product and technical constraints, then agree on a focused change and how it will be verified."],
  ["Are launch and ongoing support included?", "Hosting, store submission, deployment, and ongoing support are agreed in the project scope. Platform approvals and third-party charges are separate considerations."],
];

export default function ServicesPage() {
  return (
    <main className="services-surface">
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="eyebrow">SOFTWARE SERVICES / HUNPEO LABS</span>
            <h1>Your next product.<br /><em>Built and delivered.</em></h1>
            <p>We design and build websites, mobile apps, and AI systems, and improve the platforms behind them. From a clear scope to a practical handover.</p>
            <div className="actions">
              <Link className="btn primary" href="/contact">Tell us what you want to build <span aria-hidden="true">↗</span></Link>
              <a className="btn" href="#work">Explore our work ↓</a>
            </div>
          </div>
          <div className="abstract" role="img" aria-label="Concept illustration: an idea becomes a delivered product">
            <div className="orbit" /><div className="orbit two" />
            <span className="tag one">01 / YOUR IDEA</span>
            <div className="core"><small>HUNPEO LABS</small><strong>Design.<br />Engineer.<br />Deliver.</strong><small>BUILT AROUND YOUR GOAL ↗</small></div>
            <span className="tag two">02 / YOUR NEXT RELEASE</span>
            <span className="tag three">WEB · MOBILE · AI</span>
          </div>
        </section>
        <div className="strip">
          {["Defined deliverables", "Working increments", "Reviewed results", "Documented handover"].map((item, i) => <span key={item}><b>0{i + 1}</b>{item}</span>)}
        </div>
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">WHAT WE CAN BUILD TOGETHER</span><h2>Start with the outcome<br />you need.</h2></div>
            <p>A first product, a useful AI workflow, or a stronger existing system. Find the service that fits your next step.</p>
          </div>
          {groups.map((group) => (
            <div className="group" key={group.label}>
              <div className="group-title"><span className="eyebrow">{group.label}</span><h3>{group.title}</h3><p>{group.body}</p></div>
              <div className="service-grid">
                {group.entries.map((entry) => (
                  <Link className="service-card" href={`/services/${entry.slug}`} key={entry.slug}>
                    <span className="symbol" aria-hidden="true">{entry.symbol}</span>
                    <h3>{services.find(({ slug }) => slug === entry.slug)?.name}</h3>
                    <p>{entry.summary}</p>
                    <span className="link">Explore the service <span aria-hidden="true">↗</span></span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
      <div><ServicesDelivery /></div>
      <div className="wrap">
        <section className="section" id="work">
          <div className="section-head">
            <div><span className="eyebrow">OUR OWN ENGINEERING PROJECTS</span><h2>Explore how we build.</h2></div>
            <p>A look at our engineering approaches and the problems we explore. These are our own projects, each at its stated stage.</p>
          </div>
          <div className="projects">
            {projects.map((project) => (
              <article className="project" key={project.slug}>
                <div className="project-art" aria-hidden="true">
                  {project.steps.map((step, index) => <div className="project-node" key={step}>{index > 0 && <i>→</i>}<span>{step}</span></div>)}
                </div>
                <span className="status">{project.status}</span><h3>{project.name}</h3><p>{project.summary}</p>
                <Link className="text-link" href={`/products/${project.slug}`}>Explore project ↗</Link>
              </article>
            ))}
          </div>
        </section>
        <section className="section faq">
          <div><span className="eyebrow">BEFORE WE START</span><h2>A few practical<br />questions.</h2></div>
          <div>{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>
        <ServicesCta />
      </div>
    </main>
  );
}
