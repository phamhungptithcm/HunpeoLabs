import type { CatalogProduct } from "@/content/product-catalog";
import styles from "@/app/products/products.module.css";

export function ProductCatalogVisual({ product, compact = false }: { product: CatalogProduct; compact?: boolean }) {
  const visual = product.visual;
  if (compact || !visual || visual.kind === "letter") {
    const letter = visual?.kind === "letter" ? visual.letter : product.name.slice(0, 1);
    return (
      <div className={`${styles.monogram} ${visual?.kind === "letter" && visual.tone === "warm" ? styles.warm : ""}`} aria-hidden="true">
        {letter}
      </div>
    );
  }
  return (
    <figure className={`${styles.visual} ${visual.kind === "workflow" ? styles.workflow : styles.auditVisual}`}>
      <div className={styles.visualLabel}><span>{visual.label}</span><span>Illustration</span></div>
      {visual.kind === "workflow" ? (
        <ol className={styles.flow}>
          {visual.steps.map((step, index) => (
            <li key={step} className={index === 1 ? styles.selected : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>{step}
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.audit}>
          <div className={styles.auditTop}><span aria-hidden="true">S</span>Know what needs attention.</div>
          <ol>
            {visual.steps.map((step, index) => (
              <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div></li>
            ))}
          </ol>
        </div>
      )}
      <figcaption>{visual.caption}</figcaption>
    </figure>
  );
}
