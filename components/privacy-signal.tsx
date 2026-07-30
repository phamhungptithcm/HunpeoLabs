export function PrivacySignal() {
  return (
    <figure className="privacy-signal">
      <figcaption className="mono">Information flow</figcaption>

      <svg
        aria-hidden="true"
        className="privacy-signal__diagram privacy-signal__diagram--desktop"
        viewBox="0 0 900 520"
      >
        <g className="privacy-signal__tech">
          <path d="M18 10v10m-5-5h10M250 10v10m-5-5h10M482 10v10m-5-5h10M714 10v10m-5-5h10M882 10v10m-5-5h10" />
          <path d="M18 500v10m-5-5h10M176 500v10m-5-5h10M482 500v10m-5-5h10M790 500v10m-5-5h10M882 500v10m-5-5h10" />
          <path d="M96 110v10m-5-5h10M252 62v10m-5-5h10M620 96v10m-5-5h10M856 142v10m-5-5h10" />
          <path d="M98 418v10m-5-5h10M258 454v10m-5-5h10M636 442v10m-5-5h10M846 392v10m-5-5h10" />
          <path className="privacy-signal__guide" d="M176 72v112M176 350v98M376 38v90M376 386v92M628 126v278M858 70v152" />
          <path className="privacy-signal__micro-wave" d="M380 164h22l6-18 9 35 10-54 11 70 10-46 9 25h25" />
        </g>

        <g className="privacy-signal__streaks">
          <path d="M24 270h56M36 263h44M48 277h32" />
          <path d="M156 270h124M350 270h115M550 270h124M735 270h120" />
          <path d="M855 270h28M855 263h20M855 277h20" />
        </g>

        <g className="privacy-signal__main">
          <path className="privacy-signal__path-base" d="M78 270H860" />
          <path className="privacy-signal__path-draw" d="M78 270H860" />
          <circle className="privacy-signal__traveler" cx="78" cy="270" r="5" />
          <path className="privacy-signal__arrowhead" d="m278 270-15-8v16Zm186 0-15-8v16Zm210 0-15-8v16Zm186 0-15-8v16Z" />
        </g>

        <g className="privacy-signal__branch privacy-signal__branch--sell">
          <path className="privacy-signal__branch-base" d="M510 220V102q0-20 20-20h204" />
          <path className="privacy-signal__branch-runner" d="M510 220V102q0-20 20-20h204" />
          <g className="privacy-signal__stop">
            <circle cx="666" cy="82" r="14" />
            <path d="M659 82h14" />
          </g>
          <g className="privacy-signal__gate">
            <rect x="734" y="54" width="56" height="56" />
            <rect className="privacy-signal__gate-dash" x="730" y="50" width="64" height="64" />
            <circle cx="762" cy="82" r="14" />
            <path d="m755 75 14 14m0-14-14 14" />
          </g>
          <text x="832" y="88">SELL</text>
        </g>

        <g className="privacy-signal__branch privacy-signal__branch--ads">
          <path className="privacy-signal__branch-base" d="M510 320V438q0 20 20 20h204" />
          <path className="privacy-signal__branch-runner" d="M510 320V438q0 20 20 20h204" />
          <g className="privacy-signal__stop">
            <circle cx="666" cy="458" r="14" />
            <path d="M659 458h14" />
          </g>
          <g className="privacy-signal__gate">
            <rect x="734" y="430" width="56" height="56" />
            <rect className="privacy-signal__gate-dash" x="730" y="426" width="64" height="64" />
            <circle cx="762" cy="458" r="14" />
            <path d="m755 451 14 14m0-14-14 14" />
          </g>
          <text x="832" y="464">ADS</text>
        </g>

        <g className="privacy-signal__node privacy-signal__node--share">
          <rect className="privacy-signal__node-frame" x="92" y="232" width="68" height="76" />
          <circle className="privacy-signal__icon-ring" cx="126" cy="270" r="18" />
          <circle className="privacy-signal__icon-ring" cx="126" cy="270" r="13" />
          <circle className="privacy-signal__icon-ring" cx="126" cy="270" r="9" />
          <circle className="privacy-signal__icon-fill" cx="126" cy="270" r="5" />
          <text x="80" y="348">YOU SHARE</text>
        </g>

        <g className="privacy-signal__node privacy-signal__node--understand">
          <rect className="privacy-signal__node-frame" x="282" y="232" width="68" height="76" />
          <circle className="privacy-signal__icon-fill" cx="302" cy="254" r="2.5" />
          <circle className="privacy-signal__icon-fill" cx="302" cy="270" r="2.5" />
          <circle className="privacy-signal__icon-fill" cx="302" cy="286" r="2.5" />
          <path className="privacy-signal__icon-line" d="M312 254h22M312 270h22M312 286h22" />
          <text x="248" y="348">WE UNDERSTAND</text>
        </g>

        <g className="privacy-signal__core">
          <circle className="privacy-signal__core-halo privacy-signal__core-halo--wide" cx="510" cy="270" r="86" />
          <circle className="privacy-signal__core-halo" cx="510" cy="270" r="68" />
          <circle className="privacy-signal__core-ring" cx="510" cy="270" r="52" />
          <rect className="privacy-signal__core-frame" x="470" y="220" width="80" height="100" />
          <path
            className="privacy-signal__core-corners"
            d="M458 234v-24h24M538 210h24v24M562 306v24h-24M482 330h-24v-24"
          />
          <circle className="privacy-signal__core-eye" cx="510" cy="270" r="19" />
          <circle className="privacy-signal__icon-fill" cx="510" cy="270" r="9" />
        </g>

        <g className="privacy-signal__node privacy-signal__node--reply">
          <rect className="privacy-signal__node-frame" x="674" y="232" width="64" height="76" />
          <path className="privacy-signal__reply-bubble" d="M691 253h30v23h-18l-8 7v-7h-4z" />
          <path className="privacy-signal__reply-lines" d="M698 261h7m4 0h6m-17 6h12" />
          <text x="662" y="348">WE REPLY</text>
        </g>
      </svg>

      <svg
        aria-hidden="true"
        className="privacy-signal__diagram privacy-signal__diagram--mobile"
        viewBox="0 0 360 430"
      >
        <g className="privacy-signal__tech">
          <path d="M8 18v8m-4-4h8M176 4v8m-4-4h8M348 18v8m-4-4h8M8 410v8m-4-4h8M176 418v8m-4-4h8M348 410v8m-4-4h8" />
          <path d="M46 104v8m-4-4h8M212 52v8m-4-4h8M328 116v8m-4-4h8M46 340v8m-4-4h8M292 362v8m-4-4h8" />
          <path className="privacy-signal__guide" d="M48 116v220M210 46v106M316 108v250" />
        </g>

        <g className="privacy-signal__streaks" transform="translate(-31 0)">
          <path d="M94 6v25M87 13v18M101 13v18M94 399v25M87 399v18M101 399v18" />
        </g>

        <g className="privacy-signal__main" transform="translate(-31 0)">
          <path className="privacy-signal__path-base" d="M94 28V404" />
          <path className="privacy-signal__path-draw" d="M94 28V404" />
          <circle className="privacy-signal__traveler" cx="94" cy="28" r="4" />
          <path className="privacy-signal__arrowhead" d="m94 127-7-13h14Zm0 99-7-13h14Zm0 128-7-13h14Z" />
        </g>

        <g className="privacy-signal__branch privacy-signal__branch--sell">
          <path className="privacy-signal__branch-base" d="M93 260h59q20 0 20-20v-17q0-18 18-18h70" />
          <path className="privacy-signal__branch-runner" d="M93 260h59q20 0 20-20v-17q0-18 18-18h70" />
          <g className="privacy-signal__stop">
            <circle cx="219" cy="205" r="9.5" />
            <path d="M214 205h10" />
          </g>
          <g className="privacy-signal__gate">
            <rect x="261" y="186" width="38" height="38" />
            <rect className="privacy-signal__gate-dash" x="258" y="183" width="44" height="44" />
            <circle cx="280" cy="205" r="9.5" />
            <path d="m275 200 10 10m0-10-10 10" />
          </g>
          <text x="318" y="210">SELL</text>
        </g>

        <g
          className="privacy-signal__branch privacy-signal__branch--ads"
          transform="translate(0 10)"
        >
          <path className="privacy-signal__branch-base" d="M93 274h59q20 0 20 20v17q0 18 18 18h70" />
          <path className="privacy-signal__branch-runner" d="M93 274h59q20 0 20 20v17q0 18 18 18h70" />
          <g className="privacy-signal__stop">
            <circle cx="219" cy="329" r="9.5" />
            <path d="M214 329h10" />
          </g>
          <g className="privacy-signal__gate">
            <rect x="261" y="310" width="38" height="38" />
            <rect className="privacy-signal__gate-dash" x="258" y="307" width="44" height="44" />
            <circle cx="280" cy="329" r="9.5" />
            <path d="m275 324 10 10m0-10-10 10" />
          </g>
          <text x="318" y="334">ADS</text>
        </g>

        <g
          className="privacy-signal__node privacy-signal__node--share"
          transform="translate(-31 0)"
        >
          <rect className="privacy-signal__node-frame" x="72" y="42" width="44" height="48" />
          <circle className="privacy-signal__icon-ring" cx="94" cy="66" r="11" />
          <circle className="privacy-signal__icon-ring" cx="94" cy="66" r="8" />
          <circle className="privacy-signal__icon-fill" cx="94" cy="66" r="4.5" />
          <text x="134" y="72">YOU SHARE</text>
        </g>

        <g
          className="privacy-signal__node privacy-signal__node--understand"
          transform="translate(-31 0)"
        >
          <rect className="privacy-signal__node-frame" x="72" y="136" width="44" height="48" />
          <circle className="privacy-signal__icon-fill" cx="83" cy="150" r="1.7" />
          <circle className="privacy-signal__icon-fill" cx="83" cy="160" r="1.7" />
          <circle className="privacy-signal__icon-fill" cx="83" cy="170" r="1.7" />
          <path className="privacy-signal__icon-line" d="M90 150h17M90 160h17M90 170h17" />
          <text x="134" y="166">WE UNDERSTAND</text>
        </g>

        <g className="privacy-signal__core" transform="translate(-31 8)">
          <circle className="privacy-signal__core-halo privacy-signal__core-halo--wide" cx="94" cy="267" r="52" />
          <circle className="privacy-signal__core-halo" cx="94" cy="267" r="40" />
          <rect className="privacy-signal__core-frame" x="72" y="237" width="44" height="60" />
          <path
            className="privacy-signal__core-corners"
            d="M64 241v-12h14M110 229h14v12M124 293v12h-14M78 305H64v-12"
          />
          <circle className="privacy-signal__core-eye" cx="94" cy="267" r="14" />
          <circle className="privacy-signal__icon-fill" cx="94" cy="267" r="7" />
        </g>

        <g
          className="privacy-signal__node privacy-signal__node--reply"
          transform="translate(-31 10)"
        >
          <rect className="privacy-signal__node-frame" x="72" y="354" width="44" height="48" />
          <path className="privacy-signal__reply-bubble" d="M81 366h26v19H92l-7 6v-6h-4z" />
          <path className="privacy-signal__reply-lines" d="M87 372h6m4 0h5m-15 6h10" />
          <text x="134" y="384">WE REPLY</text>
        </g>
      </svg>
    </figure>
  );
}
