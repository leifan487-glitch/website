import { useEffect, useRef, useState } from "react";
import { Play } from "@phosphor-icons/react";
import { officialProductFilm } from "../data/standard/officialFilm.js";
import { homeForms, modularBenefits } from "../data/home.js";
import { selectVideoDelivery } from "../data/videoDelivery.js";

// Homepage captions only: shared form data and Standard page copy stay locked.
const formCaptions = {
  arm: "抓取与操作",
  engineering: "移动与操作",
  chassis: "移动任务",
  dual: "双臂协作",
  inspection: "移动巡检",
  complete: "综合任务",
};

const benefitCaptions = [
  "根据实际任务选择所需机器人形态。",
  "任务变化时，扩展或重新组合已有模块。",
  "已有模块可用于不同任务，不必始终绑定完整整机。",
];

export function HomeOfficialFilm() {
  const [activated, setActivated] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);
  // Bypass previously cached full-only responses when enabling byte-range seeking.
  const [videoSource] = useState(() => `${selectVideoDelivery(officialProductFilm.src)}?seek=2`);

  useEffect(() => {
    const video = videoRef.current;
    if (!activated || !video) return undefined;
    video.focus();
    // Explicit user activation only; controls remain available if play is denied.
    video.play().catch(() => {});
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [activated]);

  return (
    <section className="home-film home-story-section" id="official-film" aria-labelledby="home-film-title">
      <div className="page-shell">
        <header className="home-story-heading home-film__heading">
          <h2 id="home-film-title">产品影片</h2>
          <p className="home-film__duration">官方影片 <span aria-hidden="true">/</span> 02:19</p>
        </header>
        <div className="home-film__frame">
          {activated ? <video ref={videoRef} src={videoSource} poster={officialProductFilm.poster}
            width={officialProductFilm.width} height={officialProductFilm.height}
            aria-label={officialProductFilm.title} controls playsInline preload="none" tabIndex={0}
            onError={() => setFailed(true)} />
            : <button className="home-film__poster" type="button" onClick={() => setActivated(true)} aria-label="观看 Mantis Standard 官方产品影片（有声）">
              <img src={officialProductFilm.poster} alt="Mantis Standard 多形态产品阵列" width={officialProductFilm.width} height={officialProductFilm.height} loading="lazy" decoding="async" />
              <span className="home-film__play"><Play size={22} weight="fill" aria-hidden="true" />观看影片<span>有声</span></span>
            </button>}
        </div>
        {failed ? <p className="home-film__error" role="alert">影片暂时无法播放。<button type="button" onClick={() => { setFailed(false); videoRef.current?.load(); videoRef.current?.play().catch(() => {}); }}>重新加载</button></p> : null}
      </div>
    </section>
  );
}

export function HomeForms() {
  return (
    <section className="home-forms home-story-section" id="forms" aria-labelledby="home-forms-title">
      <div className="page-shell">
        <header className="home-story-heading">
          <h2 id="home-forms-title">形态展示</h2>
        </header>
        <div className="home-forms__gallery">
          {homeForms.map((item) => <figure key={item.id} data-form={item.id}>
            <div className="home-forms__visual">
              <img src={`/media/mantis-standard/home-forms-v2/${item.id === "engineering" ? "engineering-v3" : item.id}.webp`} alt={item.name} width={1200} height={960} loading="lazy" decoding="async" />
            </div>
            <figcaption><h3>{item.name}</h3><p>{formCaptions[item.id]}</p></figcaption>
          </figure>)}
        </div>
      </div>
    </section>
  );
}

export function HomeWhyModular() {
  return (
    <section className="home-why home-story-section" id="why-modular" aria-labelledby="home-why-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-why-title">按需组合</h2></header>
        <div className="home-why__items">{modularBenefits.map((item, index) => <article key={item.title}><span className="home-why__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{benefitCaptions[index]}</p></article>)}</div>
      </div>
    </section>
  );
}
