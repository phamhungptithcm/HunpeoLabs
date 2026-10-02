import { LineIcon } from "@/components/line-icon";
import type { ProductPageConfig, ProductPageSlug } from "@/content/product-pages";

const iconNames = [
  "code",
  "document",
  "approval",
  "platform",
  "database",
] as const;

const gigWorkflowIconNames = [
  "code",
  "document",
  "approval",
  "platform",
  "document",
] as const;

function DeployIcon() {
  return (
    <svg aria-hidden="true" className="line-icon" viewBox="0 0 24 24">
      <path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v7h14v-7" />
    </svg>
  );
}

export function ProductWorkflow({
  config,
}: {
  config: ProductPageConfig;
}) {
  return (
    <ol className="product-workflow__steps">
      {config.workflow.map((step, index) => (
        <li
          className={
            config.slug === "ai-agent-kit" && step.title === "Authorize"
              ? "is-active"
              : undefined
          }
          key={step.title}
        >
          <span className="product-workflow__number">
            {String(index + 1).padStart(2, "0")}
          </span>
          {config.slug === "incov" ? (
            <span className="product-workflow__pulse" aria-hidden="true">
              <svg viewBox="0 0 86 28">
                <path d="M1 14h22l4-5 4 11 5-19 5 25 5-12h39" />
              </svg>
            </span>
          ) : null}
          <LineIcon
            name={
              config.slug === "gig"
                ? gigWorkflowIconNames[index]
                : iconNames[index]
            }
          />
          <strong>{step.title}</strong>
          <small>{step.body}</small>
        </li>
      ))}
    </ol>
  );
}

function AgentControlMap() {
  const nodes = [
    ["code", "Repo context"],
    ["document", "Plan"],
    ["approval", "Policy gate"],
    ["document", "Evidence"],
  ] as const;

  return (
    <div className="agent-control-map" aria-label="AI Agent Kit control flow">
      <div className="agent-control-map__flow">
        {nodes.map(([icon, label], index) => (
          <div className={index === 2 ? "is-active" : undefined} key={label}>
            <LineIcon name={icon} />
            <strong>{label}</strong>
          </div>
        ))}
      </div>
      <div className="agent-control-map__gate">
        <span>Allow</span>
        <span>Ask</span>
        <span>Deny</span>
      </div>
      <strong className="agent-control-map__result">Evidence ready</strong>
    </div>
  );
}

function IncidentTimeline() {
  const events = [
    ["Incident detected", "High error rate on checkout service", "P1"],
    ["3 related signals", "Error spike · latency breach · timeout cluster", "Grouped"],
    ["Matched runbook", "Payment gateway timeouts", "Source reviewed"],
    ["Review required", "Recommendation is bounded", "Human check"],
    ["Approved", "Decision recorded", "Resolved"],
  ] as const;

  return (
    <ol className="incident-timeline" aria-label="IncOv incident review flow">
      {events.map(([title, detail, state], index) => (
        <li key={title}>
          <span className="incident-timeline__node">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
          <em>{state}</em>
        </li>
      ))}
    </ol>
  );
}

function GigReleasePath() {
  const steps = [
    ["document", "Ticket", "ABC-123"],
    ["code", "Commit", "a1b2c3"],
    ["approval", "Checks", "7f9d2e1"],
    ["platform", "Deploy", "d3e4f5a"],
    ["database", "Production", "prd-9a8b7c"],
  ] as const;

  return (
    <ol className="gig-release-path" aria-label="Gig release truth path">
      <svg
        aria-hidden="true"
        className="gig-release-path__connector"
        preserveAspectRatio="none"
        viewBox="0 0 1000 420"
      >
        <defs>
          <marker
            id="gig-release-arrow"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            orient="auto"
            overflow="visible"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path d="M0 0 8 4 0 8Z" />
          </marker>
        </defs>
        <path
          d="M80 390H300Q320 390 320 370V210Q320 190 340 190H460Q480 190 480 170V140Q480 120 500 120H650Q670 120 670 100V70Q670 50 690 50H840Q860 50 860 70V330Q860 350 840 350H760Q740 350 740 370V402"
          markerEnd="url(#gig-release-arrow)"
        />
        <circle cx="80" cy="390" r="5" />
        <circle cx="260" cy="390" r="5" />
        <circle cx="460" cy="190" r="5" />
        <circle cx="650" cy="120" r="5" />
        <circle cx="840" cy="50" r="5" />
      </svg>
      {steps.map(([icon, title, detail], index) => (
        <li key={title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          {title === "Deploy" ? <DeployIcon /> : <LineIcon name={icon} />}
          <strong>{title}</strong>
          <small>{detail}</small>
        </li>
      ))}
    </ol>
  );
}

export function ProductHeroVisual({ slug }: { slug: ProductPageSlug }) {
  if (slug === "incov") return <IncidentTimeline />;
  if (slug === "gig") return <GigReleasePath />;
  return <AgentControlMap />;
}

export function ProductProblemVisual({ slug }: { slug: ProductPageSlug }) {
  if (slug === "incov") {
    return (
      <div className="incident-context-map" aria-label="Noisy signals become trusted context">
        <div className="incident-context-map__noise">
          <span>Noisy signals</span>
          <svg aria-hidden="true" viewBox="0 0 300 190">
            <g className="incident-context-map__links">
              <path d="M35 52 94 29l60 33 77-7M35 52l34 86 78 20 91-55M94 29l53 129m7-96-85 76m0 0 169-35M35 52l119 10 84 41M94 29 69 138m85-76 77-7" />
              <path d="M56 95c28-47 94-62 147-31 38 23 46 59 20 88-25 28-73 33-116 12-47-23-66-44-51-69Z" />
              <path d="M78 48c42 8 72 37 70 72-1 25-21 48-48 57M176 45c-15 21-11 47 11 62 16 11 38 12 54 2" />
            </g>
            <g className="incident-context-map__minor-nodes">
              <circle cx="20" cy="90" r="2.5" />
              <circle cx="50" cy="22" r="2.5" />
              <circle cx="74" cy="72" r="2.5" />
              <circle cx="111" cy="54" r="2.5" />
              <circle cx="126" cy="94" r="2.5" />
              <circle cx="164" cy="29" r="2.5" />
              <circle cx="181" cy="89" r="2.5" />
              <circle cx="211" cy="27" r="2.5" />
              <circle cx="252" cy="78" r="2.5" />
              <circle cx="272" cy="127" r="2.5" />
              <circle cx="219" cy="159" r="2.5" />
              <circle cx="171" cy="176" r="2.5" />
              <circle cx="119" cy="151" r="2.5" />
              <circle cx="77" cy="169" r="2.5" />
              <circle cx="41" cy="136" r="2.5" />
            </g>
            <g className="incident-context-map__signal-nodes">
              <circle className="is-red" cx="35" cy="52" r="5" />
              <circle className="is-blue" cx="94" cy="29" r="5" />
              <circle className="is-orange" cx="154" cy="62" r="5" />
              <circle className="is-red" cx="231" cy="55" r="5" />
              <circle className="is-red" cx="69" cy="138" r="5" />
              <circle className="is-orange" cx="147" cy="158" r="5" />
              <circle className="is-red" cx="238" cy="103" r="5" />
              <path className="is-blue" d="m56 92 6 12H50Z" />
              <path className="is-blue" d="m181 119 6 12h-12Z" />
              <path className="is-blue" d="m116 164 7 13h-14Z" />
            </g>
          </svg>
        </div>
        <b aria-hidden="true">→</b>
        <div className="incident-context-map__target">
          <span>Trusted context</span>
          <svg aria-hidden="true" viewBox="0 0 300 190">
            <g className="incident-context-map__rings">
              <circle cx="125" cy="98" r="68" />
              <circle cx="125" cy="98" r="50" />
              <circle cx="125" cy="98" r="31" />
              <circle className="is-core" cx="125" cy="98" r="14" />
            </g>
            <g className="incident-context-map__outputs">
              <path d="M159 50h78M174 82h63M159 114h78M145 146h92" />
              <rect className="is-blue" x="239" y="44" width="12" height="12" />
              <circle className="is-blue" cx="245" cy="82" r="7" />
              <path className="is-blue" d="m245 106 8 15h-16Z" />
              <path className="is-blue" d="m245 137 9 9-9 9-9-9Z" />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  if (slug === "gig") {
    return (
      <div className="release-fragments" aria-label="Disconnected release evidence becomes one trace">
        <div className="release-fragments__before">
          <svg aria-hidden="true" viewBox="0 0 300 210">
            <path d="M72 52H222V72M72 52v112h58M222 72v92h-52M130 164h40" />
          </svg>
          <span className="is-ticket"><LineIcon name="document" /><b>Ticket</b><small>ABC-123</small></span>
          <span className="is-commit"><LineIcon name="code" /><b>Commit</b><small>a1b2c3</small></span>
          <span className="is-checks"><LineIcon name="approval" /><b>Checks</b><small>7f9d2e1</small></span>
          <span className="is-production"><LineIcon name="database" /><b>Production</b><small>prd-9a8b7c</small></span>
        </div>
        <b aria-hidden="true">→</b>
        <div className="release-fragments__after">
          <svg aria-hidden="true" viewBox="0 0 360 210">
            <path d="M45 52h90v38h83v42h82v45" />
            <circle cx="45" cy="52" r="4" />
            <circle cx="135" cy="90" r="4" />
            <circle cx="218" cy="132" r="4" />
            <circle cx="300" cy="177" r="4" />
          </svg>
          <span className="is-ticket"><LineIcon name="document" /><b>Ticket</b><small>ABC-123</small></span>
          <span className="is-commit"><LineIcon name="code" /><b>Commit</b><small>a1b2c3</small></span>
          <span className="is-checks"><LineIcon name="approval" /><b>Checks</b><small>7f9d2e1</small></span>
          <span className="is-deploy"><DeployIcon /><b>Deploy</b><small>d3e4f5a</small></span>
          <span className="is-production"><LineIcon name="database" /><b>Production</b><small>prd-9a8b7c</small></span>
        </div>
      </div>
    );
  }

  return (
    <div className="control-boundary" aria-label="Context permission and proof">
      <span><LineIcon name="code" />Understand</span>
      <span><LineIcon name="document" />Plan</span>
      <span><LineIcon name="approval" />Authorize</span>
      <span><LineIcon name="platform" />Execute</span>
      <span><LineIcon name="database" />Verify</span>
    </div>
  );
}

export function ProductEvidenceVisual({ slug }: { slug: ProductPageSlug }) {
  if (slug === "incov") {
    return (
      <div className="incov-evidence" aria-label="Example IncOv human review state">
        <div>
          <span>Recommendation</span>
          <strong>Review required</strong>
          <small>Apply mitigation from reviewed knowledge</small>
        </div>
        <div>
          <span>Evidence</span>
          <strong>3 related signals</strong>
          <small>Reviewed runbook attached</small>
        </div>
        <div>
          <span>Approver</span>
          <strong>Named owner</strong>
          <small>Human review recorded</small>
        </div>
        <div className="is-approved">
          <span>Status: approved</span>
          <strong aria-hidden="true">✓</strong>
          <small>Decision recorded</small>
        </div>
      </div>
    );
  }

  if (slug === "gig") {
    return (
      <div className="gig-evidence" aria-label="Example Gig release truth graph">
        <div className="gig-evidence__cards">
          <div className="gig-evidence__selected">
            <span>Selected step</span>
            <strong>Commit a1b2c3</strong>
            <small>Author · date · release intent</small>
          </div>
          <div className="is-active">
            <span>Commit diff</span>
            <pre>{`+ validate release()
+ record evidence()
+ require approval()`}</pre>
          </div>
          <div>
            <span>Check result</span>
            <strong>All checks passed</strong>
            <small>Lint · unit · integration · build</small>
          </div>
          <div>
            <span>Deployment</span>
            <strong>Deploy d3e4f5a</strong>
            <small>Environment and revision recorded</small>
          </div>
          <div>
            <span>Production confirmation</span>
            <strong>State recorded</strong>
            <small>Evidence ready for review</small>
          </div>
        </div>
        <div className="gig-evidence__player" aria-hidden="true">
          <b>▶</b>
          <span>00:06</span>
          <i><em /></i>
          <span>00:14</span>
          <b>⛶</b>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-evidence" aria-label="Example AI Agent Kit evidence receipt">
      <div>
        <span>Evidence (JSON)</span>
        <pre>{`{
  "policy": "ask",
  "status": "tested",
  "evidence": "recorded"
}`}</pre>
      </div>
      <div>
        <span>Approval (diff)</span>
        <pre>{`+ validate(input)
+ audit.log("approved")
+ tests.verify()`}</pre>
      </div>
      <div>
        <span>Test results</span>
        <pre>{`PASS  policy.test
PASS  validation.test

Evidence ready`}</pre>
      </div>
    </div>
  );
}
