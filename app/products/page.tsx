import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { ProductSystemVisual } from "@/components/product-system-visual";
import { products } from "@/content/site";

export const metadata = createPageMetadata({
  title: "Products",
  description: "AI Agent Kit, IncOv, and Gig, products built by Hunpeo Labs.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <main className="concept-page">
      <section className="product-showcase">
        <header>
          <h1>
            Products built from real engineering problems<span>.</span>
          </h1>
        </header>
        <div className="product-showcase__stories">
          {products.map((product, productIndex) => (
            <article
              className={[
                "product-feature",
                `product-feature--${product.slug}`,
                product.slug === "incov" ? "product-feature--dark" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={product.slug}
            >
              <div className="product-feature__intro">
                <span className="product-feature__index">
                  {String(productIndex + 1).padStart(2, "0")}
                </span>
                <h2>{product.name}</h2>
                <p>{product.summary}</p>
                <p className="mono">{product.maturity}</p>
                <ul>
                  {product.capabilities.slice(0, 4).map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
                <Link className="text-link" href={`/products/${product.slug}`}>
                  Explore {product.name}
                  <ArrowIcon />
                </Link>
              </div>
              <div className="product-feature__system">
                <ProductSystemVisual slug={product.slug} />
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="final-cta final-cta--compact">
        <h2>Looking for engineering decisions, status, and evidence?</h2>
        <Link className="button button--secondary" href="/work">
          Review selected work
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
