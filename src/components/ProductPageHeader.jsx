import { Navbar } from "./Navbar.jsx";
import { ArrowDown } from "@phosphor-icons/react";
import { standardCommercial } from "../data/standard/commercial.js";
import "./standard-brochure.css";

export function ProductPageHeader() {
  return (
    <section
      className="standard-product-hero brochure-hero"
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
          <p className="standard-product-hero__slogan">一脑多型，真模块化</p>
          <p className="standard-product-hero__price">{standardCommercial.publicStartingPrice}</p>
          <p className="standard-product-hero__definition">模块化双臂移动操作机器人，<br />支持任务组合与开发扩展。</p>
          <div className="brochure-hero__links"><a className="sp-button" href="#modular">探索产品形态<ArrowDown size={18} aria-hidden="true" /></a></div>
        </div>
        <picture className="standard-product-hero__visual">
          <img src="/media/mantis-standard/performance-v1/head.webp" alt="Mantis Standard 小白，视觉头部与上身正式产品图" width="1000" height="684" fetchPriority="high" decoding="async" />
        </picture>
      </div>
    </section>
  );
}
