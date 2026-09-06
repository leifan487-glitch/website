import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero.jsx";
import { Footer } from "../components/Footer.jsx";
import { InternalStatus } from "../components/InternalStatus.jsx";

export function MantisProPage() {
  return <><main id="main-content"><PageHero eyebrow="PRODUCTS / MANTIS PRO" title="Mantis Pro" intro="单一完整产品视觉；正式产品定位与参数待确认。" />
    <section className="pro-overview page-shell"><div><p className="section-index">02 · PRODUCT OVERVIEW</p><h2>One product.<br/>A complete form.</h2><InternalStatus as="p" status="TODO">Pro 产品概述与产品参数待确认</InternalStatus></div><picture><source media="(max-width:680px)" srcSet="/assets/hero-pro-p00002-mobile.webp"/><img src="/assets/hero-pro-p00001.webp" alt="Mantis Pro 完整整机渲染"/><InternalStatus as="figcaption" status="SOURCE">P00001 / P00002</InternalStatus></picture></section>
    <section className="pro-details"><header className="section-title page-shell"><p className="section-index section-index--light">03 · PRODUCT VISUALS</p><h2>Details</h2><p>仅呈现已筛选工业设计画面，不推断结构性能。</p></header><div className="pro-details__grid page-shell"><figure><img src="/assets/technology-pro-head-p00003.webp" alt="Mantis Pro 头部与立柱细节" loading="lazy"/><InternalStatus as="figcaption" status="SOURCE">P00003</InternalStatus></figure><figure><img src="/assets/pro-arm-detail-p00004.webp" alt="Mantis Pro 肩部和手臂连接细节" loading="lazy"/><InternalStatus as="figcaption" status="SOURCE">P00004</InternalStatus></figure></div></section>
    <section className="page-placeholder page-shell"><p className="section-index">04 · REAL WORLD / DEMO</p><h2>Real-world evidence pending.</h2><InternalStatus as="p" status="TODO">Pro 真实任务与型号归属待确认</InternalStatus><Link className="text-link" to="/products">Back to Products</Link></section>
  </main><Footer /></>;
}
