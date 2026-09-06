import { useState } from "react";
import { InternalStatus } from "./InternalStatus.jsx";

const detailViews = [
  {
    id: "front-three-quarter",
    label: "侧前视图",
    assetId: "A01791",
    desktopSrc: "/assets/hero-standard-a01791.webp",
    mobileSrc: "/assets/hero-standard-a01791-mobile.webp",
    desktopWidth: 2200,
    desktopHeight: 1238,
    alt: "Mantis Standard 侧前上部结构渲染局部",
  },
  {
    id: "rear-three-quarter",
    label: "侧后视图",
    assetId: "A01792",
    desktopSrc: "/assets/detail-standard-a01792.webp",
    mobileSrc: "/assets/detail-standard-a01792-mobile.webp",
    desktopWidth: 2200,
    desktopHeight: 1238,
    alt: "Mantis Standard 侧后上部结构渲染局部",
  },
];

export function MantisProductDetail() {
  const [activeViewId, setActiveViewId] = useState(detailViews[0].id);
  const activeView =
    detailViews.find((view) => view.id === activeViewId) ?? detailViews[0];

  return (
    <section
      className="product-detail"
      id="standard"
      aria-labelledby="product-detail-title"
    >
      <header className="product-detail__header page-shell">
        <p className="section-index">03 · PRODUCT DETAIL</p>
        <h2 id="product-detail-title">
          <span>Mantis</span>
          <span>Product Detail</span>
        </h2>
        <InternalStatus as="p" status="TODO">
          Standard 产品设计说明待确认
        </InternalStatus>
      </header>

      <div className="product-detail__stage">
        <div
          className="product-detail__selector"
          role="group"
          aria-label="选择产品渲染视图"
        >
          {detailViews.map((view, index) => (
            <button
              key={view.id}
              type="button"
              aria-pressed={view.id === activeView.id}
              onClick={() => setActiveViewId(view.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{view.label}</strong>
            </button>
          ))}
        </div>

        <picture key={activeView.id} className="product-detail__media">
          <source media="(max-width: 680px)" srcSet={activeView.mobileSrc} />
          <img
            src={activeView.desktopSrc}
            alt={activeView.alt}
            width={activeView.desktopWidth}
            height={activeView.desktopHeight}
            loading="lazy"
            decoding="async"
          />
        </picture>

        <InternalStatus
          as="p"
          className="asset-note asset-note--dark"
          status="SOURCE"
          aria-live="polite"
        >
          VISUAL · {activeView.assetId} · INTERNAL V1
        </InternalStatus>
      </div>
    </section>
  );
}
