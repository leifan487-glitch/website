import { productHeroProducts } from "../data/productHeroProducts.js";
import { Navbar } from "./Navbar.jsx";
import { Link } from "react-router-dom";
import { InternalStatus } from "./InternalStatus.jsx";
import { standardCommercial } from "../data/standard/commercial.js";

export function ProductHero() {
  const activeProduct = productHeroProducts[0];
  const mediaStyle = {
    "--hero-media-fit-desktop": activeProduct.mediaLayout.desktop.objectFit,
    "--hero-media-position-desktop":
      activeProduct.mediaLayout.desktop.objectPosition,
    "--hero-media-scale-desktop": activeProduct.mediaLayout.desktop.scale,
    "--hero-media-shift-desktop": activeProduct.mediaLayout.desktop.translateY,
    "--hero-media-fit-mobile": activeProduct.mediaLayout.mobile.objectFit,
    "--hero-media-position-mobile":
      activeProduct.mediaLayout.mobile.objectPosition,
    "--hero-media-scale-mobile": activeProduct.mediaLayout.mobile.scale,
    "--hero-media-fit-compact": activeProduct.mediaLayout.compact.objectFit,
    "--hero-media-position-compact":
      activeProduct.mediaLayout.compact.objectPosition,
    "--hero-media-scale-compact": activeProduct.mediaLayout.compact.scale,
  };

  return (
    <section
      className="product-hero"
      id="top"
      data-product={activeProduct.id}
      data-theme={activeProduct.theme}
      data-media-mode={activeProduct.mediaMode}
      data-visual-mode={activeProduct.visualMode}
      aria-labelledby="product-hero-title"
    >
      <Navbar theme={activeProduct.theme} />

      <div className="product-hero__content page-shell">
        <div className="product-hero__copy">
          <h1
            key={`identity-${activeProduct.id}`}
            className="product-hero__identity product-hero__swap"
            id="product-hero-title"
            aria-label={`${activeProduct.name} ${activeProduct.variant}`}
          >
            <span className="product-hero__name">{activeProduct.name}</span>
            <span className="product-hero__variant">{activeProduct.variant}</span>
          </h1>

          <div className="product-hero__details">
            <div
              key={`content-${activeProduct.id}`}
              className="product-hero__product-content product-hero__swap"
            >
              <p className="product-hero__positioning">
                {activeProduct.heroDefinition || activeProduct.positioning}
              </p>

              <p className="product-hero__price">{standardCommercial.publicStartingPrice}</p>

              <Link className="text-link product-hero__cta" to={activeProduct.cta.href}>
                <span>{activeProduct.cta.label}</span>
                <span className="text-link__arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <picture
          key={`media-${activeProduct.id}`}
          className="product-hero__media product-hero__swap"
          data-media-mode={activeProduct.mediaMode}
          style={mediaStyle}
        >
          <source
            media="(max-width: 600px)"
            srcSet={activeProduct.poster.compact.src}
          />
          <source
            media="(max-width: 900px)"
            srcSet={activeProduct.poster.mobile.src}
          />
          <img
            src={activeProduct.poster.desktop.src}
            alt={activeProduct.poster.alt}
            width={activeProduct.poster.desktop.width}
            height={activeProduct.poster.desktop.height}
            fetchPriority="high"
          />
        </picture>

        <ul className="product-hero__values" aria-label="Mantis Standard 核心价值">
          {activeProduct.valueWords.map((word) => <li key={word}>{word}</li>)}
        </ul>

        <InternalStatus as="p" className="product-hero__asset-note" status="SOURCE">
          <span className="product-hero__asset-id product-hero__asset-id--desktop">{activeProduct.poster.desktop.assetId}</span>
          <span className="product-hero__asset-id product-hero__asset-id--mobile">{activeProduct.poster.mobile.assetId}</span>{` · INTERNAL V1`}
        </InternalStatus>
      </div>
    </section>
  );
}
