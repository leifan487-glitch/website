import { Navbar } from "./Navbar.jsx";
import { ArrowDown } from "@phosphor-icons/react";
import { standardCommercial } from "../data/standard/commercial.js";

export function ProductPageHeader() {
  return (
    <section
      className="standard-product-hero"
      id="product-top"
      aria-labelledby="product-page-title"
    >
      <Navbar theme="light" homeHref="/" />

      <div className="standard-product-hero__layout page-shell">
        <div className="standard-product-hero__copy">
          <h1 id="product-page-title">
            <span>Mantis</span>
            <span>Standard</span>
          </h1>
          <p className="standard-product-hero__slogan">一脑多形，真模块化</p>
          <p className="standard-product-hero__price">{standardCommercial.publicStartingPrice}</p>
          <p className="standard-product-hero__definition">面向任务组合与开发扩展的<br />模块化双臂移动操作机器人。</p>
          <a className="sp-button" href="#capability-system">查看产品结构<ArrowDown size={18} aria-hidden="true" /></a>
        </div>
        <picture className="standard-product-hero__visual">
          <source media="(max-width: 600px)" srcSet="/assets/hero-standard-series-a01644-mobile-focus.webp" />
          <img src="/assets/hero-standard-series-a01644.webp" alt="Mantis Standard 模块化机器人产品阵列" width="2400" height="1350" fetchPriority="high" decoding="async" />
        </picture>
      </div>
    </section>
  );
}
