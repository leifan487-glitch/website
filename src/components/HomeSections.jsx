import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { companyTechnologyPlatforms } from "../data/technology.js";
import { newsItems } from "../data/news.js";
import { companyIdentity, companyMission } from "../data/company.js";
import { getStandardMediaByUsage } from "../data/standard/index.js";
import { InternalStatus } from "./InternalStatus.jsx";
import { companyPublicMode } from "../data/company/visibility.js";
import { HomeApplicationGallery } from "./HomeApplicationGallery.jsx";

function getNextIndex(index, key, length) {
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  if (key === "ArrowDown" || key === "ArrowRight") return (index + 1) % length;
  if (key === "ArrowUp" || key === "ArrowLeft") return (index - 1 + length) % length;
  return null;
}

export function HomeTechnology() {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef([]);
  const activePlatform = companyTechnologyPlatforms[activeIndex];

  function handleKeyDown(index, event) {
    const nextIndex = getNextIndex(index, event.key, companyTechnologyPlatforms.length);
    if (nextIndex === null) return;
    event.preventDefault();
    setActiveIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="home-technology" id="technology" aria-labelledby="home-technology-title">
      <header className="home-technology__masthead page-shell">
        <div>
          <p className="home-section-name">Technology System</p>
          <h2 id="home-technology-title">技术系统</h2>
        </div>
        <p>{companyPublicMode ? "Mantis 机器人本体与四个技术平台共同构成蓝虫具身的技术体系。" : "四个技术平台的内部来源与公开边界。"}</p>
      </header>

      <div className="home-technology__body page-shell">
        <aside className="home-technology__active" aria-live="polite">
          <div className="home-technology__active-index">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span>{String(companyTechnologyPlatforms.length).padStart(2, "0")}</span>
          </div>
          <div className="home-technology__active-content" key={activePlatform.id}>
            <p>{activePlatform.label}</p>
            <h3>{activePlatform.name}</h3>
            <p>{activePlatform.summary}</p>
          </div>
          <Link className="home-section-link" to="/technology">
            <span>查看完整技术体系</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </aside>

        <div className="home-technology__diagram">
          <div className="home-technology__body-node">
            <span>00</span>
            <strong>Mantis</strong>
            <small>Robot Body</small>
          </div>
          <ol>
            {companyTechnologyPlatforms.map((item, index) => (
              <li className={index === activeIndex ? "is-active" : undefined} key={item.id}>
                <button
                  type="button"
                  aria-pressed={index === activeIndex}
                  ref={(element) => { buttonRefs.current[index] = element; }}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.name}</strong>
                  <small>{item.label}</small>
                  <i aria-hidden="true">↗</i>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function HomeApplications() {
  const applicationScenes = getStandardMediaByUsage("applications", { publicMode: true }).slice(0, 3);
  return (
    <section className="home-applications" id="applications" aria-labelledby="home-applications-title">
      <header className="home-applications__masthead page-shell">
        <div>
          <p className="home-section-name">Applications / Mantis Standard</p>
          <h2 id="home-applications-title">任务现场</h2>
        </div>
        <p>{companyPublicMode ? "从真实任务记录出发，探索机器人在不同场景中的应用方向。" : "匿名项目文字记录；未批准媒体不进入公开页面。"}</p>
      </header>

      <div className="home-applications__gallery page-shell">
        <HomeApplicationGallery items={applicationScenes} />
      </div>

      <div className="home-applications__footer page-shell">
        <p>三段经过公开复核的 Mantis Standard 任务记录</p>
        <Link className="home-section-link" to="/applications">
          <span>查看全部应用</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}

export function HomeLatest() {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef([]);
  const activeItem = newsItems[activeIndex];

  function handleKeyDown(index, event) {
    const nextIndex = getNextIndex(index, event.key, newsItems.length);
    if (nextIndex === null) return;
    event.preventDefault();
    setActiveIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="home-latest" aria-labelledby="home-latest-title">
      <header className="home-latest__masthead page-shell">
        <div>
          <p className="home-section-name">Progress Archive</p>
          <h2 id="home-latest-title">进展记录</h2>
        </div>
        <p>{companyPublicMode ? "赛事与公开报道构成公司的阶段性进展记录。" : "活动与任务记录的内部核对入口。"}</p>
      </header>

      <div className="home-latest__archive page-shell">
        <article className="home-latest__active" aria-live="polite">
          <div>
            <span>{activeItem.year || "Record"}</span>
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(newsItems.length).padStart(2, "0")}</span>
          </div>
          <p>{activeItem.category}</p>
          <h3>{activeItem.title}</h3>
          <strong>{activeItem.result}</strong>
          <InternalStatus status="VERIFIED">PUBLIC RECORD</InternalStatus>
        </article>

        <ol className="home-latest__index">
          {newsItems.map((item, index) => (
            <li className={index === activeIndex ? "is-active" : undefined} key={item.id}>
              <button
                type="button"
                aria-pressed={index === activeIndex}
                ref={(element) => { buttonRefs.current[index] = element; }}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(index, event)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.year || "Record"}</span>
                <strong>{item.title}</strong>
                <i aria-hidden="true">↗</i>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="home-latest__footer page-shell">
        <Link className="home-section-link" to="/news">
          <span>查看全部动态</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}

export function HomeAbout() {
  return (
    <section className="home-about" id="about" aria-labelledby="home-about-title">
      <div className="home-about__layout page-shell">
        <div className="home-about__identity">
          <p>Blue Worm / 蓝虫具身</p>
        </div>

        <div className="home-about__copy">
          <p>我们的使命</p>
          <h2 id="home-about-title">
            <span>创造一个</span>
            <span>人机共融</span>
            <span>新世界</span>
          </h2>
          <p className="home-about__legal-name">{companyIdentity.legalNameZh}<br />{companyIdentity.legalNameEn}</p>
          <InternalStatus as="p" status={companyMission.contentStatus}>MISSION / VERIFIED COPY</InternalStatus>
          <Link className="home-section-link home-section-link--light" to="/about">
            <span>关于蓝虫</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="home-about__signal" aria-hidden="true">
          <span />
          <span />
          <strong>BW</strong>
        </div>
      </div>
    </section>
  );
}
