import { LineIcon } from "@/components/line-icon";

const agentNodes = ["Developer", "Agent orchestrator", "Policy engine", "Repositories"] as const;
const incovSteps = [
  ["platform", "Incident intake"],
  ["boundary", "Normalize & group"],
  ["database", "Trusted knowledge"],
  ["agent", "Bounded AI assessment"],
  ["approval", "Policy & approval"],
] as const;
const gigSteps = ["Ticket", "Commit", "Checks", "Deploy", "Production"] as const;

function AgentKitVisual() {
  return (
    <div className="product-architecture" aria-label="AI Agent Kit governed workflow">
      <svg aria-hidden="true" className="product-architecture__links" preserveAspectRatio="none" viewBox="0 0 1000 220">
        <defs>
          <marker
            id="product-arrow"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            orient="auto"
            overflow="visible"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path className="visual-arrow" d="M0 0 8 4 0 8Z" />
          </marker>
        </defs>
        <path className="product-architecture__connector" d="M232 92H252" markerEnd="url(#product-arrow)" />
        <path className="product-architecture__connector" d="M488 92H508" markerEnd="url(#product-arrow)" />
        <path className="product-architecture__connector" d="M744 92H764" markerEnd="url(#product-arrow)" />
        <path className="product-architecture__feedback" d="M372 166V190H628V166" />
      </svg>
      <div className="product-architecture__nodes">
        {agentNodes.map((node, index) => (
          <div className={index === 1 ? "is-accent" : ""} key={node}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <strong>{node}</strong>
            <small>{["Request", "Plan · tools · act", "Allow · ask · deny", "GitHub · GitLab"][index]}</small>
          </div>
        ))}
      </div>
      <pre aria-label="AI Agent Kit evidence sample">{`{
  "decision": "allow",
  "reason": "tests added for error handling",
  "evidence": "reviewable diff"
}`}</pre>
    </div>
  );
}

function IncovVisual() {
  return (
    <div className="incov-architecture" aria-label="IncOv incident intelligence workflow">
      <ol>
        {incovSteps.map(([icon, label], index) => (
          <li key={label}>
            <LineIcon name={icon} />
            <strong>{label}</strong>
            {index < incovSteps.length - 1 ? (
              <svg aria-hidden="true" className="incov-architecture__arrow" viewBox="0 0 36 16">
                <path d="M2 8h28M25 3l5 5-5 5" />
              </svg>
            ) : null}
          </li>
        ))}
      </ol>
      <pre aria-label="IncOv evidence sample">{`01  [incov] intake       source=incident
02  [incov] normalize    group=related-signals
03  [incov] knowledge    match=verified-runbook
04  [incov] assess       recommendation=review
05  [incov] approval     approver=human
06  [incov] execute      status=success`}</pre>
    </div>
  );
}

function GigVisual() {
  return (
    <div className="gig-architecture" aria-label="Gig release truth path">
      <ol>
        {gigSteps.map((step, index) => (
          <li key={step}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <LineIcon
              name={
                ["document", "code", "approval", "rollback", "platform"][index] as
                  | "document"
                  | "code"
                  | "approval"
                  | "rollback"
                  | "platform"
              }
            />
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
      <pre aria-label="Gig release evidence sample">{`gig trace ABC-123
ticket       connected
source       reviewable
checks       recorded
production   review ready`}</pre>
    </div>
  );
}

export function ProductSystemVisual({ slug }: { slug: string }) {
  if (slug === "incov") return <IncovVisual />;
  if (slug === "gig") return <GigVisual />;
  return <AgentKitVisual />;
}
