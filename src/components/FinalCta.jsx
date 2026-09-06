import { Link } from "react-router-dom";

export function FinalCta({ title = "Explore Mantis Standard", primary = "/products/mantis-standard" }) {
  return (
    <section className="final-cta">
      <div className="final-cta__media" aria-hidden="true">
        <img src="/assets/hero-standard-series-a01644.webp" alt="" width="2200" height="1238" loading="lazy" decoding="async" />
      </div>
      <div className="final-cta__inner page-shell">
        <div className="final-cta__copy">
          <p>下一步 / Mantis Standard</p>
          <h2>
            <span>认识</span>
            <strong>Mantis Standard</strong>
          </h2>
          <span className="sr-only">{title}</span>
        </div>
        <div className="final-cta__links">
          <Link to={primary}><span>探索产品</span><span aria-hidden="true">↗</span></Link>
          <Link to="/inquiry"><span>商务询盘</span><span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
