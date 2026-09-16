import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { SubpageMotion } from "../components/SubpageMotion.jsx";
import { companyIdentity, companyMission, intellectualPropertyCopy, leadership } from "../data/company.js";
import { selectCompanyContent } from "../data/company/visibility.js";
import { alignedPlatforms } from "../data/alignment.js";
import "../alignment.css";

export function AboutPage() {
  const mainRef = useRef(null);
  const leaders = selectCompanyContent(leadership, {publicMode:true});
  return <>
    <main id="main-content" ref={mainRef} className="aligned-page about-aligned">
      <SubpageMotion scopeRef={mainRef} compact />
      <Navbar theme="light" homeHref="/" />
      <section className="aligned-hero page-shell" aria-labelledby="about-title">
        <div><h1 id="about-title">关于蓝虫</h1><p className="aligned-lead">{companyIdentity.legalNameZh}</p><p>{companyIdentity.legalNameEn}</p><p>围绕机器人本体、工程系统与智能模型，持续推进研发与任务实践。</p></div>
        <img src="/assets/detail-standard-a01792.webp" alt="Mantis Standard 机器人本体细节" width="2200" height="1238" fetchPriority="high" />
      </section>
      <section className="aligned-mission" data-motion-section aria-labelledby="mission-title"><div className="page-shell"><h2 id="mission-title" data-motion-copy>公司使命</h2><p data-motion-copy>{companyMission.text}</p></div></section>
      <section className="aligned-section page-shell" data-motion-section aria-labelledby="build-title">
        <h2 id="build-title" data-motion-copy>产品与技术体系</h2>
        <div className="aligned-build"><div><h3>Mantis Standard</h3><p>一脑多型，真模块化。围绕不同任务组合机器人形态，连接操作与开发。</p><Link className="aligned-link" to="/products/mantis-standard">了解 Mantis Standard<ArrowRight size={20} aria-hidden="true" /></Link></div>
          <dl>{alignedPlatforms.map(p => <div key={p.id}><dt>{p.nameZh}<span>{p.name}</span></dt><dd>{p.roleZh}</dd></div>)}</dl>
        </div>
      </section>
      <section className="aligned-section aligned-tint" data-motion-section aria-labelledby="people-title"><div className="page-shell aligned-people">
        <div><h2 id="people-title" data-motion-copy>核心团队</h2>{leaders.map(leader => <article key={leader.id}><h3>{leader.name}</h3><p>{leader.role}</p><p>{leader.education}</p></article>)}</div>
        <div><h2>研发与进展</h2><p>{intellectualPropertyCopy.text}</p><Link className="aligned-link" to="/news">查看新闻与动态<ArrowRight size={20} aria-hidden="true" /></Link></div>
      </div></section>
    </main><Footer />
  </>;
}
