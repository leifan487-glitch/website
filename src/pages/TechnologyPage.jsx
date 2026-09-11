import { useRef } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { EditorialHeading } from "../components/EditorialHeading.jsx";
import { InternalStatus } from "../components/InternalStatus.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { SubpageMotion } from "../components/SubpageMotion.jsx";
import { TechnologyExplorer } from "../components/TechnologyExplorer.jsx";
import { companyPublicMode, selectCompanyContent } from "../data/company/visibility.js";
import { companyTechnologyPlatforms, technologySystem } from "../data/technology.js";

export function TechnologyPage() {
  const mainRef = useRef(null);
  const platforms = selectCompanyContent(companyTechnologyPlatforms);

  return (
    <>
      <main id="main-content" ref={mainRef} className="technology-page">
        <SubpageMotion scopeRef={mainRef} />

        <section className="technology-hero" data-immersive-hero aria-labelledby="technology-title">
          <Navbar theme="dark" homeHref="/" />
          <div className="technology-hero__media" data-hero-media>
            <img src="/assets/hero-standard-a01791.webp" alt="Mantis Standard 机器人本体结构局部" width="2200" height="1238" fetchPriority="high" data-parallax />
          </div>
          <div className="technology-hero__beam" aria-hidden="true" />
          <div className="technology-hero__content page-shell">
            <h1 id="technology-title" data-hero-title>
              <span>TECHNOLOGY</span>
              <span>连接本体、<br className="technology-hero__title-break" aria-hidden="true" />控制与智能。</span>
            </h1>
            <p data-hero-lead>{technologySystem.summary}</p>
            {!companyPublicMode ? <InternalStatus status="SOURCE" data-hero-lead>PAGES {technologySystem.sourcePage} · RELATIONSHIP PARTIAL</InternalStatus> : null}
          </div>
        </section>

        <TechnologyExplorer platforms={platforms} />

        <section className="technology-field" data-motion-section aria-labelledby="technology-field-title">
          <div className="technology-field__media" data-motion-media>
            <img src="/assets/detail-standard-a01792.webp" alt="Mantis Standard 机器人本体细节" width="2200" height="1238" loading="lazy" decoding="async" data-parallax />
          </div>
          <EditorialHeading
            as="div"
            className="technology-field__copy page-shell"
            meta="Robot body / system / workflow"
            title="本体承载动作，系统连接任务。"
            titleId="technology-field-title"
            tone="dark"
            motion
            detail={<div>
              <p>机器人本体承载动作，平台系统连接控制、感知、模型与数据工作流。</p>
              <Link className="subpage-line-link" to="/products/mantis-standard"><span>了解 Mantis Standard</span><span aria-hidden="true">↗</span></Link>
            </div>}
          />
        </section>

        <section className="subpage-contact subpage-contact--blue page-shell" data-motion-section>
          <p data-motion-copy>技术合作 / TECHNOLOGY INQUIRY</p>
          <h2 data-motion-heading><span>从任务条件开始，</span><span>讨论技术方案。</span></h2>
          <Link className="subpage-line-link" to="/inquiry" data-motion-copy><span>提交技术需求</span><span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
