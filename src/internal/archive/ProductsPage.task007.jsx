import { Link } from "react-router-dom";
import { products } from "../data/products.js";
import { PageHero } from "../components/PageHero.jsx";
import { Footer } from "../components/Footer.jsx";
import { InternalStatus } from "../components/InternalStatus.jsx";
import { FinalCta } from "../components/FinalCta.jsx";

export function ProductsPage() {
  return <><main id="main-content"><PageHero eyebrow="PRODUCTS / MANTIS FAMILY" title="Mantis" intro="机器人与效率工具的产品家族入口。" />
    <section className="product-family page-shell">
      {products.map((product) => <article className={`product-family__item product-family__item--${product.id}`} key={product.id}>
        <div className="product-family__copy"><p>{product.eyebrow}</p><h2>{product.name}</h2><InternalStatus as="p" status={product.contentStatus}>{product.positioning}</InternalStatus><Link className="text-link" to={product.route}>Explore {product.id === "standard" ? "Standard" : "Pro"}</Link></div>
        <picture><source media="(max-width: 680px)" srcSet={product.mobileAsset}/><img src={product.desktopAsset} alt={product.alt} loading="lazy"/><InternalStatus as="figcaption" status="SOURCE">VISUAL · {product.assetId}</InternalStatus></picture>
      </article>)}
    </section><FinalCta /></main><Footer /></>;
}
