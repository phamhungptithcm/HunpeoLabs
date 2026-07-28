const stages = [
  ["01", "Web Interface", "Intuitive web experiences that scale with your product."],
  ["02", "Mobile Experience", "Native apps engineered for performance and usability."],
  ["03", "AI Agent Workflow", "Custom AI agents that automate workflows and create outcomes."],
  ["04", "Evidence", "Evaluations, observability, and guardrails for trust."],
  ["05", "Production", "Secure, reliable delivery that runs in the real world."],
] as const;

function StageIcon({ index }: { index: number }) {
  const icons = [
    <g key="web">
      <rect x="2.5" y="4" width="19" height="16" />
      <path d="M2.5 8h19M5.3 6h.01M7.6 6h.01M5.5 10.5h6v6.5h-6zM13.5 11h5M13.5 14h5M13.5 17h3.5" />
    </g>,
    <g key="mobile">
      <rect x="7.5" y="2.5" width="9" height="19" rx="1.5" />
      <path d="M10.5 5h3M7.5 18.5h9M12 20h.01" />
    </g>,
    <g key="agent">
      <path d="M3 17.5 8.5 12l5 5 7.5-8M8.5 12 8 5l5 3 8 1" />
      <circle cx="3" cy="17.5" r="1.5" />
      <circle cx="8" cy="5" r="1.5" />
      <circle cx="8.5" cy="12" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
      <circle cx="13.5" cy="17" r="1.5" />
      <circle cx="21" cy="9" r="1.5" />
    </g>,
    <g key="evidence">
      <ellipse cx="12" cy="5" rx="7.5" ry="3" />
      <path d="M4.5 5v5c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3V5M4.5 10v5c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3v-5M4.5 15v4c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3v-4" />
    </g>,
    <g key="production">
      <rect x="2.5" y="4" width="19" height="6.5" />
      <rect x="2.5" y="13.5" width="19" height="6.5" />
      <circle cx="6" cy="7.25" r="1" />
      <circle cx="6" cy="16.75" r="1" />
      <path d="M10 7.25h8M10 16.75h8" />
    </g>,
  ];

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icons[index]}
    </svg>
  );
}

function SignalTrace() {
  return (
    <svg
      aria-hidden="true"
      className="signal__trace"
      preserveAspectRatio="none"
      viewBox="0 0 72 112"
    >
      <path className="signal__rail" d="M36 0v112" />
      <path
        className="signal__wave"
        d="M4 56h14l4-10 5 22 5-36 6 48 6-31 6 15 5-8h13"
        pathLength="1"
      />
      <circle className="signal__trace-node" cx="36" cy="96" r="5.5" />
    </svg>
  );
}

export function EngineeringSignal() {
  return (
    <div className="signal" aria-label="Engineering signal workflow">
      <div className="signal__header">
        <span>Engineering signal</span>
        <svg aria-hidden="true" className="signal__header-trace" viewBox="0 0 360 56">
          <path
            d="M0 28h286c9 0 13 5 16 18l6-34 7 44 8-52 8 36 8-18 8 6h13"
            pathLength="1"
          />
        </svg>
      </div>
      <ol>
        {stages.map(([number, title, body], index) => (
          <li key={title}>
            <span className="signal__icon">
              <StageIcon index={index} />
            </span>
            <span className="signal__number">{number}</span>
            <span className="signal__copy">
              <strong>{title}</strong>
              <span>{body}</span>
            </span>
            <SignalTrace />
          </li>
        ))}
      </ol>
      <svg
        aria-hidden="true"
        className="signal__feedback"
        preserveAspectRatio="none"
        viewBox="0 0 88 560"
      >
        <defs>
          <marker
            id="signal-feedback-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="2"
            refY="4"
          >
            <path d="M8 0 0 4l8 4z" />
          </marker>
        </defs>
        <path
          d="M18 520h58V72H18"
          markerEnd="url(#signal-feedback-arrow)"
          pathLength="1"
        />
      </svg>
    </div>
  );
}
