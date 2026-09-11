import { useRef } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { EditorialHeading } from "../components/EditorialHeading.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { StandardMediaPlayer } from "../components/StandardMediaPlayer.jsx";
import { SubpageMotion } from "../components/SubpageMotion.jsx";
import { potentialApplications } from "../data/applications.js";
import { selectCompanyContent } from "../data/company/visibility.js";
import { getStandardMediaByUsage } from "../data/standard/index.js";

export function ApplicationsPage() {
  const mainRef = useRef(null);
  const directions = selectCompanyContent(potentialApplications, { publicMode: true });
  const mediaStories = getStandardMediaByUsage("applications", { publicMode: true });
  const heroMedia = mediaStories[0];
  const sceneMedia = mediaStories.slice(1);

  return (
    <>
      <main id="main-content" ref={mainRef} className="applications-page">
        <SubpageMotion scopeRef={mainRef} />

        <section className="applications-hero" data-immersive-hero aria-labelledby="applications-title">
          <Navbar theme="dark" homeHref="/" />
          {heroMedia ? (
            <div className="applications-hero__media" data-hero-media>
              <StandardMediaPlayer media={heroMedia} homeLoop className="applications-hero__player" label={`播放${heroMedia.titleZh}场景视频`} />
            </div>
          ) : null}
          <div className="applications-hero__shade" aria-hidden="true" />
          <div className="applications-hero__content page-shell">
            <h1 id="applications-title" data-hero-title>
              <span>APPLICATIONS</span>
              <span>让机器人进入真实任务。</span>
            </h1>
            {heroMedia ? (
              <div className="applications-hero__caption" data-hero-lead>
                <strong>{heroMedia.titleZh}</strong>
                <span>{heroMedia.titleEn}</span>
              </div>
            ) : null}
            <p data-hero-lead>从服务场景到工业设备操作，以实际影像呈现任务过程。</p>
          </div>
        </section>

        <section className="application-spectrum page-shell" data-motion-section aria-labelledby="application-spectrum-title">
          <header>
            <p className="application-spectrum__eyebrow" data-motion-copy>应用方向 / APPLICATION DIRECTIONS</p>
            <h2 id="application-spectrum-title" data-motion-heading><span>应用方向，</span><span>按任务现场展开。</span></h2>
            <p data-motion-copy>当前公开内容表达研究与场景拓展方向，不代表客户部署或商业交付。</p>
          </header>
          <ol>
            {directions.map((item) => (
              <li key={item.id} data-motion-item>
                <strong>{item.name}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ol>
        </section>

        {sceneMedia.length ? (
          <section className="application-scenes" data-motion-section aria-labelledby="application-scenes-title">
            <EditorialHeading
              className="page-shell"
              meta="Scene records"
              title="任务记录，来自真实现场。"
              titleId="application-scenes-title"
              tone="dark"
              motion
            />
            <div className="application-scenes__list">
              {sceneMedia.map((media) => (
                <article key={media.id} className="application-scene" data-motion-item>
                  <div className="application-scene__media" data-motion-media>
                    <StandardMediaPlayer media={media} className="application-scene__player" />
                  </div>
                  <div className="application-scene__shade" aria-hidden="true" />
                  <div className="application-scene__copy page-shell">
                    <p>{media.category}</p>
                    <h3>{media.titleZh}</h3>
                    <span>{media.titleEn}</span>
                    <p>{media.descriptionZh}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="subpage-contact page-shell" data-motion-section>
          <p data-motion-copy>项目合作 / PROJECT INQUIRY</p>
          <h2 data-motion-heading><span>提交任务现场，</span><span>明确合作目标。</span></h2>
          <Link className="subpage-line-link" to="/inquiry" data-motion-copy><span>填写任务简报</span><span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
