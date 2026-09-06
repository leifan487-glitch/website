import { Link } from "react-router-dom";
import { InternalStatus } from "./InternalStatus.jsx";

const productForm = ["双臂", "轮式", "快换"];

export function HomeMantisIntro() {
  return (
    <section
      className="home-mantis-intro"
      id="mantis"
      aria-labelledby="home-mantis-title"
    >
      <div className="home-mantis-intro__layout page-shell">
        <header className="home-mantis-intro__copy">
          <p className="home-mantis-intro__identity">Mantis Standard</p>
          <h2 id="home-mantis-title">
            <span>Mantis</span>
            <span>Standard</span>
          </h2>
          <p className="home-mantis-intro__definition">机器人 + 效率工具</p>
          <p className="home-mantis-intro__status">消费级 · 一脑多形，真模块化</p>

          <Link className="home-mantis-intro__link" to="/products/mantis-standard">
            <span>进入产品页</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <figure className="home-mantis-intro__visual">
          <img
            src="/assets/mantis-standard-a01790.webp"
            alt="Mantis 正面上部结构渲染局部"
            width="1800"
            height="1012"
            loading="lazy"
            decoding="async"
          />
          <InternalStatus as="figcaption" status="SOURCE">VISUAL · A01790 · INTERNAL V1</InternalStatus>
        </figure>

        <ol className="home-mantis-intro__keywords" aria-label="Mantis 产品形态关键词">
          {productForm.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>

        <div className="home-mantis-intro__drawing" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
