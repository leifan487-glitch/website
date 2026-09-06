import { useRef } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { InternalStatus } from "../components/InternalStatus.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { SubpageMotion } from "../components/SubpageMotion.jsx";
import { companyIdentity, companyMission, intellectualPropertyCopy, leadership } from "../data/company.js";
import { companyPublicMode } from "../data/company/visibility.js";

export function AboutPage() {
  const mainRef = useRef(null);
  const leader = leadership[0];

  return (
    <>
      <main id="main-content" ref={mainRef} className="about-page">
        <SubpageMotion scopeRef={mainRef} />

        <section className="about-hero" data-immersive-hero aria-labelledby="about-title">
          <Navbar theme="dark" homeHref="/" />
          <div className="about-hero__media" data-hero-media>
            <img src="/assets/detail-standard-a01792.webp" alt="Mantis Standard 机器人本体细节" width="2200" height="1238" fetchPriority="high" data-parallax />
          </div>
          <div className="about-hero__shade" aria-hidden="true" />
          <div className="about-hero__content page-shell">
            <p data-hero-lead>{companyIdentity.legalNameZh}</p>
            <h1 id="about-title" data-hero-title><span>BLUE</span><span>WORM</span></h1>
            <blockquote data-hero-lead>{companyMission.text}</blockquote>
          </div>
        </section>

        <section className="about-story page-shell" data-motion-section aria-labelledby="about-story-title">
          <div className="about-story__identity">
            <p data-motion-copy>Xi'an / Robotics / Artificial intelligence</p>
            <h2 id="about-story-title" data-motion-heading>从机器人本体出发，走向真实任务。</h2>
          </div>
          <div className="about-story__copy">
            <p data-motion-copy>蓝虫具身围绕机器人本体、工程系统与智能模型持续推进研发与任务实践。</p>
            <p data-motion-copy>{companyIdentity.legalNameEn}</p>
            {!companyPublicMode ? <InternalStatus status={companyIdentity.contentStatus}>PAGE {companyIdentity.sourcePage}</InternalStatus> : null}
            <Link className="subpage-line-link" to="/products/mantis-standard" data-motion-copy><span>认识 Mantis Standard</span><span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="about-belief" data-motion-section aria-labelledby="about-belief-title">
          <div className="about-belief__copy page-shell">
            <p data-motion-copy>研发方向 / RESEARCH IN MOTION</p>
            <h2 id="about-belief-title" data-motion-heading><span>从机器人本体，</span><span>到人的任务。</span></h2>
            <p className="about-belief__lead" data-motion-copy>蓝虫具身围绕机器人本体、工程系统与智能模型，持续推进研发与任务实践。</p>
          </div>
          <figure className="about-belief__media" data-motion-media>
            <img src="/assets/hero-standard-series-a01644.webp" alt="Mantis Standard 产品系列" width="2400" height="1350" loading="lazy" decoding="async" data-parallax />
          </figure>
        </section>

        <section className="about-practice page-shell" data-motion-section aria-labelledby="about-practice-title">
          <header>
            <p data-motion-copy>People and practice</p>
            <h2 id="about-practice-title" data-motion-heading>团队、研发与长期积累。</h2>
          </header>
          <div className="about-practice__rows">
            <article data-motion-item>
              <span>核心团队</span>
              <h3>{leader.name}</h3>
              <div><strong>{leader.role}</strong><p>{leader.education}</p></div>
              {!companyPublicMode ? <InternalStatus status={leader.contentStatus}>PAGE {leader.sourcePage} · PORTRAIT NOT APPROVED</InternalStatus> : null}
            </article>
            <article data-motion-item>
              <span>研发方向</span>
              <h3>Research &amp;<br />Engineering</h3>
              <p>从机器人本体、工程系统到智能模型，持续推进研发与任务实践。</p>
            </article>
            <article data-motion-item>
              <span>知识产权</span>
              <h3>Intellectual<br />Property</h3>
              <p>{intellectualPropertyCopy.text}</p>
            </article>
          </div>
          <Link className="subpage-line-link about-practice__progress" to="/news" data-motion-copy><span>查看公司进展</span><span aria-hidden="true">→</span></Link>
        </section>

        <section className="subpage-contact subpage-contact--dark page-shell" data-motion-section>
          <p data-motion-copy>Work with Blue Worm</p>
          <h2 data-motion-heading>一起把下一项任务变成现实。</h2>
          <Link className="subpage-line-link" to="/inquiry" data-motion-copy><span>商务询盘</span><span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
