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

function DigitalProductVisual() {
  return (
    <svg aria-label="Responsive digital product interface" className="service-svg" role="img" viewBox="0 0 520 320">
      <rect className="visual-frame visual-shadow" x="24" y="38" width="356" height="226" rx="8" />
      <path className="visual-line" d="M24 72h356M48 55h2M62 55h2M76 55h2" />
      <rect className="visual-soft" x="44" y="92" width="78" height="150" rx="4" />
      <rect className="visual-accent-soft" x="54" y="110" width="58" height="20" rx="3" />
      <path className="visual-line visual-muted" d="M55 151h46M55 172h38M55 193h44M55 214h32" />
      <text x="144" y="111">OVERVIEW</text>
      <rect className="visual-soft" x="144" y="128" width="96" height="72" rx="4" />
      <rect className="visual-soft" x="254" y="128" width="102" height="72" rx="4" />
      <text className="visual-value" x="158" y="154">12,540</text>
      <text className="visual-value" x="268" y="154">$438,420</text>
      <path className="visual-accent-line" d="M157 181l15-9 13 7 17-18 24 10M267 180l13-7 13 6 18-16 14 8 17-11" />
      <rect className="visual-soft" x="144" y="214" width="212" height="28" rx="4" />
      <path className="visual-line visual-muted" d="M158 228h94M286 228h50" />
      <rect className="visual-frame visual-shadow" x="332" y="102" width="142" height="198" rx="18" />
      <path className="visual-line" d="M382 116h42M332 264h142" />
      <text x="352" y="148">PROJECTS</text>
      <rect className="visual-accent-soft" x="350" y="166" width="106" height="24" rx="3" />
      <rect className="visual-soft" x="350" y="198" width="106" height="24" rx="3" />
      <rect className="visual-soft" x="350" y="230" width="106" height="24" rx="3" />
      <circle className="visual-line" cx="403" cy="282" r="5" />
    </svg>
  );
}

function AiSystemVisual() {
  return (
    <svg aria-label="AI agent orchestration architecture" className="service-svg" role="img" viewBox="0 0 520 320">
      <ArrowMarker id="ai-arrow" />
      <g className="visual-connectors">
        <path d="M118 116H170" markerEnd="url(#ai-arrow)" />
        <path d="M316 116H364" markerEnd="url(#ai-arrow)" />
        <path d="M245 186V214H135V226" markerEnd="url(#ai-arrow)" />
        <path d="M245 186V214H387V226" markerEnd="url(#ai-arrow)" />
        <path className="visual-dashed" d="M435 178V214H405V226" markerEnd="url(#ai-arrow)" />
        <path className="visual-dashed" d="M194 264H245V190" markerEnd="url(#ai-arrow)" />
      </g>
      <g className="visual-node">
        <rect x="18" y="54" width="100" height="124" rx="4" />
        <text className="visual-title" x="32" y="76">INPUTS</text>
        <path d="M32 92h72M32 116h72M32 140h72M32 164h72" />
        <text x="38" y="108">User request</text><text x="38" y="132">Files / data</text><text x="38" y="156">Signals</text>
      </g>
      <g className="visual-node visual-node--accent">
        <rect x="174" y="40" width="142" height="146" rx="4" />
        <text className="visual-title" x="190" y="62">AGENT ORCHESTRATION</text>
        <rect x="190" y="76" width="110" height="22" rx="3" />
        <rect x="190" y="104" width="110" height="22" rx="3" />
        <rect x="190" y="132" width="110" height="22" rx="3" />
        <rect x="190" y="160" width="110" height="14" rx="3" />
        <text x="199" y="91">Intent & planning</text><text x="199" y="119">Tool selection</text>
        <text x="199" y="147">Execution</text><text x="199" y="171">Response</text>
      </g>
      <g className="visual-node">
        <rect x="368" y="54" width="134" height="124" rx="4" />
        <text className="visual-title" x="384" y="76">TOOLS</text>
        <path d="M384 92h102M384 116h102M384 140h102M384 164h102" />
        <text x="390" y="108">Search / RAG</text><text x="390" y="132">Code execution</text><text x="390" y="156">API calls</text>
      </g>
      <g className="visual-node">
        <rect x="76" y="230" width="118" height="68" rx="4" />
        <text className="visual-title" x="92" y="252">MEMORY</text>
        <text x="92" y="274">Short + long term</text>
      </g>
      <g className="visual-node visual-node--accent">
        <rect x="320" y="230" width="134" height="68" rx="4" />
        <text className="visual-title" x="336" y="252">EVALUATION</text>
        <text x="336" y="274">Tests · guardrails</text>
      </g>
    </svg>
  );
}

function EnterpriseVisual() {
  return (
    <svg aria-label="Enterprise platform architecture" className="service-svg" role="img" viewBox="0 0 520 320">
      <ArrowMarker id="platform-arrow" />
      <g className="visual-connectors">
        <path d="M260 52V78" markerEnd="url(#platform-arrow)" />
        <path d="M260 108V128" markerEnd="url(#platform-arrow)" />
        <path d="M98 132H422" />
        <path d="M98 132V156" markerEnd="url(#platform-arrow)" />
        <path d="M206 132V156" markerEnd="url(#platform-arrow)" />
        <path d="M314 132V156" markerEnd="url(#platform-arrow)" />
        <path d="M422 132V156" markerEnd="url(#platform-arrow)" />
        <path className="visual-dashed" d="M462 181H502V270H482" markerEnd="url(#platform-arrow)" />
      </g>
      <g className="visual-node">
        <rect x="42" y="18" width="436" height="34" rx="4" />
        <text className="visual-title" x="58" y="39">CLIENTS</text>
        <text x="207" y="39">WEB</text><text x="266" y="39">MOBILE</text><text x="345" y="39">PARTNERS</text>
        <rect x="42" y="82" width="436" height="26" rx="3" />
        <text className="visual-title" x="193" y="99">API GATEWAY / EDGE</text>
      </g>
      <rect className="visual-boundary" x="42" y="132" width="436" height="92" rx="5" />
      {[
        [58, "AUTH"], [166, "USER"], [274, "BILLING"], [382, "NOTIFY"],
      ].map(([x, label]) => (
        <g className="visual-node" key={label}>
          <rect x={Number(x)} y="160" width="80" height="42" rx="3" />
          <text className="visual-title" x={Number(x) + 40} y="185" textAnchor="middle">{label}</text>
        </g>
      ))}
      <g className="visual-node">
        <rect x="42" y="242" width="308" height="56" rx="4" />
        <text className="visual-title" x="58" y="262">DATA PLATFORM</text>
        <text x="58" y="284">DATABASE</text><text x="154" y="284">EVENT STREAM</text><text x="270" y="284">CACHE</text>
        <rect x="366" y="242" width="112" height="56" rx="4" />
        <text className="visual-title" x="422" y="262" textAnchor="middle">PLATFORM</text>
        <text x="422" y="284" textAnchor="middle">SECURITY · CI/CD</text>
      </g>
    </svg>
  );
}

export function ServiceVisual({ type }: { type: "digital" | "ai" | "enterprise" }) {
  return (
    <div className={`service-visual service-visual--${type}`}>
      {type === "digital" ? <DigitalProductVisual /> : null}
      {type === "ai" ? <AiSystemVisual /> : null}
      {type === "enterprise" ? <EnterpriseVisual /> : null}
    </div>
  );
}
