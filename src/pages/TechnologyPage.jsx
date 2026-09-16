import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { SubpageMotion } from "../components/SubpageMotion.jsx";
import { TechnologyExplorer } from "../components/TechnologyExplorer.jsx";
import { alignedPlatforms } from "../data/alignment.js";
import { standardDevelopmentPaths } from "../data/standard/story.js";
import "../alignment.css";

export function TechnologyPage() {
  const mainRef = useRef(null);
  return <>
    <main id="main-content" ref={mainRef} className="aligned-page technology-aligned">
      <SubpageMotion scopeRef={mainRef} compact />
      <Navbar theme="light" homeHref="/" />
      <section className="aligned-hero page-shell" aria-labelledby="technology-title">
        <div><h1 id="technology-title">技术体系</h1><p className="aligned-lead">从机器人本体到遥操作、具身模型与云平台。</p><p>春茧、量子、虫洞与蜂巢分别连接本体、操作、模型和数据工作流。</p>
          <nav className="aligned-index" aria-label="技术平台定位">{alignedPlatforms.map(p => <a key={p.id} href={"#" + p.id}>{p.nameZh}<ArrowRight size={16} aria-hidden="true" /></a>)}</nav>
        </div>
        <img src="/assets/hero-standard-a01791.webp" alt="Mantis Standard 机器人本体结构局部" width="2200" height="1238" fetchPriority="high" />
      </section>
      <TechnologyExplorer platforms={alignedPlatforms} />
      <section className="aligned-section aligned-tint" data-motion-section aria-labelledby="ecosystem-title"><div className="page-shell">
        <h2 id="ecosystem-title" data-motion-copy>开发生态</h2><p>连接仿真、控制、数据与操作验证。以下工具按具体配置与开发方案选用，不表示所有设备默认配备。</p>
        <dl className="aligned-ecosystem">{standardDevelopmentPaths.map(item => <div key={item.id} data-motion-item><dt>{item.title}</dt><dd>{item.tools.join(" / ")}</dd></div>)}</dl>
        <p className="aligned-note">BlueWorm SDK 为蓝虫开发接口；ROS 2、MoveIt 2、Isaac Sim、Genesis、LeRobot 及相关外部模型属于开发生态。</p>
      </div></section>
      <section className="aligned-related page-shell"><div><h2>Mantis Standard</h2><p>查看机器人形态、核心能力、公开参数与开发资料。</p></div><Link className="aligned-link" to="/products/mantis-standard">了解 Mantis Standard<ArrowRight size={20} aria-hidden="true" /></Link></section>
    </main><Footer />
  </>;
}
