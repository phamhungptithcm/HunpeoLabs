type DiagramVariant = "thinking" | "work";

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
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
  );
}

const thinkingNodes = [
  ["Problem space", "Needs · constraints"],
  ["Design", "Define · model"],
  ["Build", "Engineer · test"],
  ["Evidence", "Measure · learn"],
  ["Production", "Operate · improve"],
] as const;

function ThinkingDiagram() {
  const marker = "system-arrow-thinking";

  return (
    <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox="0 0 900 360">
      <ArrowMarker id={marker} />
      <g className="system-diagram__connectors">
        {[184, 350, 516, 682].map((x) => (
          <path d={`M${x} 112H${x + 20}`} key={x} markerEnd={`url(#${marker})`} />
        ))}
        <path d="M445 152V206H270V230" markerEnd={`url(#${marker})`} />
        <path d="M445 152V206H670V230" markerEnd={`url(#${marker})`} />
        <path
          className="visual-feedback"
          d="M848 112H870V320H20V112H38"
          markerEnd={`url(#${marker})`}
        />
      </g>

      {thinkingNodes.map(([title, detail], index) => {
        const x = 42 + index * 166;
        return (
          <g className="system-diagram__node" key={title}>
            <rect height="80" rx="3" width="142" x={x} y="72" />
            <circle cx={x + 22} cy="94" r="7" />
            <path d={`M${x + 18} 94h8M${x + 22} 90v8`} />
            <text className="visual-title" x={x + 16} y="122">{title.toUpperCase()}</text>
            <text x={x + 16} y="140">{detail}</text>
          </g>
        );
      })}

      {[
        ["Guardrails", "Context · boundaries", 190],
        ["Knowledge store", "Evidence · decisions", 590],
      ].map(([title, detail, x]) => (
        <g className="system-diagram__node system-diagram__node--support" key={title}>
          <rect height="62" rx="3" width="160" x={Number(x)} y="234" />
          <text className="visual-title" textAnchor="middle" x={Number(x) + 80} y="261">
            {String(title).toUpperCase()}
          </text>
          <text textAnchor="middle" x={Number(x) + 80} y="280">{detail}</text>
        </g>
      ))}
    </svg>
  );
}

const collaborationNodes = [
  ["Shared context", "Problem · constraints", 80, 62],
  ["Clear ownership", "Decisions · outcomes", 640, 62],
  ["Open review", "Feedback · evidence", 640, 230],
  ["Continuous learning", "Reflect · improve", 80, 230],
] as const;

function WorkDiagram() {
  const marker = "system-arrow-work";

  return (
    <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox="0 0 900 360">
      <ArrowMarker id={marker} />
      <g className="system-diagram__connectors system-diagram__connectors--work">
        <path d="M260 98H636" markerEnd={`url(#${marker})`} />
        <path d="M730 134V226" markerEnd={`url(#${marker})`} />
        <path d="M640 266H264" markerEnd={`url(#${marker})`} />
        <path d="M170 230V138" markerEnd={`url(#${marker})`} />
      </g>

      {collaborationNodes.map(([title, detail, x, y]) => (
        <g className="system-diagram__node system-diagram__node--collaboration" key={title}>
          <rect height="72" rx="3" width="180" x={x} y={y} />
          <circle cx={x + 22} cy={y + 22} r="7" />
          <path d={`M${x + 18} ${y + 22}h8M${x + 22} ${y + 18}v8`} />
          <text className="visual-title" x={x + 16} y={y + 48}>{title.toUpperCase()}</text>
          <text x={x + 16} y={y + 65}>{detail}</text>
        </g>
      ))}

      <g className="system-diagram__core">
        <rect height="72" rx="36" width="250" x="325" y="144" />
        <text className="visual-title" textAnchor="middle" x="450" y="174">WORKING TOGETHER</text>
        <text textAnchor="middle" x="450" y="195">Context · craft · responsibility</text>
      </g>
    </svg>
  );
}

export function SystemDiagram({ label, variant }: { label: string; variant: DiagramVariant }) {
  return (
    <figure className={`system-diagram system-diagram--${variant}`} aria-label={label}>
      <figcaption className="mono">{label}</figcaption>
      <div className="system-diagram__canvas">
        {variant === "thinking" ? <ThinkingDiagram /> : <WorkDiagram />}
      </div>
    </figure>
  );
}
