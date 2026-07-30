import styles from "@/app/company/principles/principles.module.css";

const stages = ["See", "Map", "Build", "Prove", "Scale"];
const desktopPositions = [30, 235, 440, 645, 850];
const mobilePositions = [38, 148, 258, 368, 478];

export function PrinciplesFlow() {
  return (
    <figure className={styles.flow} aria-labelledby="principles-flow-caption">
      <figcaption className={styles.visuallyHidden} id="principles-flow-caption">
        Our work follows a repeatable loop: see, map, build, prove, and scale.
        Then we look again.
      </figcaption>

      <div className={styles.flowDesktop} aria-hidden="true">
        <svg
          className={styles.flowDiagram}
          viewBox="0 0 1000 330"
          role="presentation"
        >
          <defs>
            <mask id="principles-return-mask-desktop">
              <path
                className={styles.returnMask}
                d="M 910 160 V 286 H 90 V 184"
                pathLength="1"
                data-flow-return-mask
              />
            </mask>
          </defs>
          {desktopPositions.slice(0, -1).map((x, index) => {
            const nextX = desktopPositions[index + 1];
            return (
              <g
                className={styles.flowConnector}
                data-flow-segment
                data-step={index}
                key={`${x}-${nextX}`}
              >
                <path
                  d={`M ${x + 120} 100 H ${nextX - 16}`}
                  pathLength="1"
                  data-flow-path
                />
                <path
                  d={`M ${nextX - 30} 88 L ${nextX - 16} 100 L ${nextX - 30} 112`}
                  data-flow-arrow
                />
                <circle
                  className={styles.flowSignal}
                  cx={x + 120}
                  cy="100"
                  r="4"
                  data-flow-signal
                />
              </g>
            );
          })}
          <path
            className={styles.returnPath}
            d="M 910 160 V 286 H 90 V 184"
            mask="url(#principles-return-mask-desktop)"
          />
          <path
            className={styles.returnArrow}
            d="M 78 198 L 90 184 L 102 198"
            data-flow-return-arrow
          />
          {desktopPositions.map((x, index) => (
            <g
              className={styles.flowStage}
              data-flow-stage
              data-step={index}
              key={stages[index]}
            >
              <rect
                className={index === 0 ? styles.flowBoxActive : styles.flowBox}
                height="120"
                width="120"
                x={x}
                y="40"
              />
              <text x={x + 60} y="107">
                {stages[index]}
              </text>
            </g>
          ))}
          <circle
            className={styles.flowRingOuter}
            cx="90"
            cy="40"
            r="15"
            pathLength="1"
            data-flow-origin-ring
          />
          <circle
            className={styles.flowTraveler}
            cx="90"
            cy="40"
            r="9"
            data-flow-origin
            data-flow-traveler
          />
        </svg>
      </div>

      <div className={styles.flowMobile} aria-hidden="true">
        <svg
          className={styles.flowDiagramMobile}
          viewBox="0 0 340 560"
          role="presentation"
        >
          <defs>
            <mask id="principles-return-mask-mobile">
              <path
                className={styles.returnMask}
                d="M 130 498 H 28 V 58 H 116"
                pathLength="1"
                data-flow-return-mask
              />
            </mask>
          </defs>
          {mobilePositions.slice(0, -1).map((y, index) => {
            const nextY = mobilePositions[index + 1];
            return (
              <g
                className={styles.flowConnectorMobile}
                data-flow-segment
                data-step={index}
                key={`${y}-${nextY}`}
              >
                <path
                  className={styles.mobileTrack}
                  d={`M 150 ${y + 40} V ${nextY}`}
                  pathLength="1"
                  data-flow-mobile-path
                  data-flow-path
                />
                <circle
                  className={styles.flowSignalMobile}
                  cx="150"
                  cy={y + 40}
                  r="4"
                  data-flow-signal
                />
              </g>
            );
          })}
          <path
            className={styles.returnPath}
            d="M 130 498 H 28 V 58 H 116"
            mask="url(#principles-return-mask-mobile)"
          />
          <path
            className={styles.returnArrow}
            d="M 102 46 L 116 58 L 102 70"
            data-flow-return-arrow
          />
          {mobilePositions.map((y, index) => (
            <g
              className={styles.flowStage}
              data-flow-stage
              data-step={index}
              key={stages[index]}
            >
              <rect
                className={index === 0 ? styles.flowBoxActive : styles.flowBoxMobile}
                height="40"
                width="40"
                x="130"
                y={y}
              />
              <text x="214" y={y + 27}>
                {stages[index]}
              </text>
            </g>
          ))}
          <circle
            className={styles.flowTravelerMobile}
            cx="150"
            cy="58"
            r="8"
            data-flow-traveler
          />
        </svg>
      </div>
    </figure>
  );
}
