import { useRef } from "react";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { StandardMediaPlayer } from "../components/StandardMediaPlayer.jsx";
import { SubpageMotion } from "../components/SubpageMotion.jsx";
import { alignedScenarios } from "../data/alignment.js";
import { getStandardMediaByUsage } from "../data/standard/index.js";
import "../alignment.css";

export function ApplicationsPage() {
  const mainRef = useRef(null);
  const heroMedia = getStandardMediaByUsage("applicationsHero", { publicMode: true })[0];
  const sceneMedia = getStandardMediaByUsage("applications", { publicMode: true });
  return <>
    <main id="main-content" ref={mainRef} className="aligned-page applications-aligned">
      <SubpageMotion scopeRef={mainRef} compact />
      <section className="applications-hero" aria-labelledby="applications-title">
        <Navbar theme="dark" homeHref="/" />
        {heroMedia ? <div className="applications-hero__media"><StandardMediaPlayer media={heroMedia} homeLoop className="applications-hero__player" label={"播放" + heroMedia.titleZh + "场景视频"} /></div> : null}
        <div className="applications-hero__shade" aria-hidden="true" />
        <div className="applications-hero__content page-shell">
          <h1 id="applications-title">真实任务与应用</h1>
          <p>从服务场景到工业设备操作，以实际影像呈现任务过程。</p>
          {heroMedia ? <div className="applications-hero__caption"><strong>{heroMedia.titleZh}</strong><span>{heroMedia.titleEn}</span></div> : null}
        </div>
      </section>
      <section className="aligned-section page-shell" data-motion-section aria-labelledby="directions-title">
        <h2 id="directions-title" data-motion-copy>六个方向，具体到任务</h2><p>以下为研究与场景拓展方向，不代表客户部署或商业交付。具体任务需结合场景条件、配置与开发方案。</p>
        <div className="aligned-scenarios">{alignedScenarios.map(item => <article key={item.id} data-motion-item>
          <h3>{item.name}<span>{item.label}</span></h3><p>{item.description}</p><ul aria-label={item.name + "典型任务"}>{item.keywords.map(keyword => <li key={keyword}>{keyword}</li>)}</ul>
        </article>)}</div>
      </section>
      {sceneMedia.length ? <section className="aligned-section aligned-tint" data-motion-section aria-labelledby="scenes-title"><div className="page-shell">
        <h2 id="scenes-title" data-motion-copy>看看机器人正在做什么</h2><p>三段已公开任务记录。影像说明具体操作过程，不对应未经批准的客户身份或交付承诺。</p>
        <div className="aligned-scenes">{sceneMedia.map(media => <figure key={media.id} data-motion-item>
          <StandardMediaPlayer media={media} />
          <figcaption><h3>{media.titleZh}</h3><p>{media.descriptionZh}</p></figcaption>
        </figure>)}</div>
      </div></section> : null}
    </main><Footer />
  </>;
}
