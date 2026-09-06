import { useState } from "react";

export function TechnologyExplorer({ platforms }) {
  const [activeId, setActiveId] = useState(platforms[0]?.id);
  const active = platforms.find((platform) => platform.id === activeId) ?? platforms[0];

  function selectRelativePlatform(event, currentIndex) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = currentIndex;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (currentIndex + 1) % platforms.length;
    if (["ArrowUp", "ArrowLeft"].includes(event.key)) nextIndex = (currentIndex - 1 + platforms.length) % platforms.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = platforms.length - 1;

    setActiveId(platforms[nextIndex].id);
    document.getElementById(`technology-tab-${platforms[nextIndex].id}`)?.focus();
  }

  if (!active) return null;

  return (
    <section className="technology-explorer page-shell" data-motion-section aria-labelledby="technology-explorer-title">
      <header className="technology-explorer__intro">
        <p data-motion-copy>产品与技术 / SYSTEM</p>
        <h2 id="technology-explorer-title" data-motion-heading><span>本体、平台与工具，</span><span>围绕同一个任务。</span></h2>
        <p data-motion-copy>从 Mantis 本体出发，依次查看架构、遥操作、具身模型与云端工作流。</p>
      </header>

      <div className="technology-explorer__stage" data-motion-item>
        <div className="technology-explorer__core" aria-label="Mantis Robot Body">
          <img src="/assets/mantis-standard-a01790.webp" alt="Mantis Standard 机器人本体局部" width="1800" height="1013" loading="lazy" decoding="async" data-parallax />
          <div>
            <span>Robot body</span>
            <strong>Mantis</strong>
          </div>
        </div>

        <div className="technology-explorer__controls" role="tablist" aria-label="技术平台">
          {platforms.map((platform, index) => (
            <button
              key={platform.id}
              id={`technology-tab-${platform.id}`}
              type="button"
              role="tab"
              aria-selected={platform.id === active.id}
              aria-controls="technology-platform-panel"
              className={platform.id === active.id ? "is-active" : undefined}
              tabIndex={platform.id === active.id ? 0 : -1}
              onClick={() => setActiveId(platform.id)}
              onKeyDown={(event) => selectRelativePlatform(event, index)}
            >
              <span>{platform.label}</span>
              <strong>{platform.name}</strong>
              <i aria-hidden="true">↗</i>
            </button>
          ))}
        </div>

        <div
          className="technology-explorer__panel"
          id="technology-platform-panel"
          role="tabpanel"
          aria-labelledby={`technology-tab-${active.id}`}
          key={active.id}
        >
          <div className="technology-explorer__panel-name">
            <span>{active.label}</span>
            <h3>{active.name}</h3>
          </div>
          <p>{active.summary}</p>
          <ul aria-label={`${active.name} 相关概念`}>
            {active.concepts.map((concept) => <li key={concept}>{concept}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
