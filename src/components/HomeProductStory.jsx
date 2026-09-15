import { useEffect, useRef, useState } from "react";
import { Play } from "@phosphor-icons/react";
import { officialProductFilm } from "../data/standard/officialFilm.js";
import { homeForms, modularBenefits } from "../data/home.js";

export function HomeOfficialFilm() {
  const [activated, setActivated] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);

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
        <header className="home-story-heading">
          <h2 id="home-film-title">官方产品影片</h2>
          <p>Mantis Standard <span aria-hidden="true">/</span> 约 02:19</p>
        </header>
        <div className="home-film__frame">
          {activated ? <video ref={videoRef} src={officialProductFilm.src} poster={officialProductFilm.poster}
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
          <h2 id="home-forms-title">不同任务，<br />不同组合</h2>
          <p>同一个 Mantis Standard，<br />根据任务组合不同形态。</p>
        </header>
        <div className="home-forms__gallery">
          {homeForms.map((item) => <figure key={item.id}>
            <div className="home-forms__visual">
              <img src={item.image} alt={item.name} width={item.width} height={item.height} loading="lazy" decoding="async" />
            </div>
            <figcaption><h3>{item.name}</h3><p>{item.description}</p></figcaption>
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
        <header className="home-story-heading"><h2 id="home-why-title">让配置贴近实际需求</h2><p>不必为每个新任务，<br />都从一台完整机器人开始。</p></header>
        <div className="home-why__items">{modularBenefits.map((item, index) => <article key={item.title}><span className="home-why__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      </div>
    </section>
  );
}
