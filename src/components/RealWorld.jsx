import { EmptyState } from "./EmptyState.jsx";
import { InternalStatus } from "./InternalStatus.jsx";
import { StandardMediaPlayer } from "./StandardMediaPlayer.jsx";
import { getStandardMediaByUsage, hasPublicStandardTaskMedia, standardPublicMode } from "../data/standard/index.js";

export function RealWorld({ sectionNumber = "04", title = "Real World", intro = "从产品体系到双臂操作、服务任务与工业设备场景。" }) {
  const media = getStandardMediaByUsage("homeRealWorld");
  if (standardPublicMode && !hasPublicStandardTaskMedia) return null;

  return (
    <section className="real-world" id="real-world" aria-labelledby="real-world-title">
      {media.length ? <div className="real-world__stage">
        <header className="real-world__header page-shell">
          <p className="section-index section-index--light">
            {sectionNumber} · REAL WORLD
          </p>
          <h2 id="real-world-title">{title}</h2>
          <p className="real-world__intro">{intro}</p>
          <InternalStatus as="p" status="TODO">Standard 任务媒体待确认</InternalStatus>
        </header>

        {media.map((item) => (
          <figure className="real-world__media" key={item.id}>
            <div className="real-world__frame">
              <StandardMediaPlayer media={item} homeLoop label={`播放${item.titleZh}`} />
            </div>
            <figcaption>
              <div><span>{item.titleZh}</span><small>{item.titleEn}</small></div>
              <p>{item.category} / {item.durationLabel}</p>
            </figcaption>
            <InternalStatus as="p" status={item.contentStatus}>{item.sourceId}</InternalStatus>
          </figure>
        ))}
      </div> : (
        <div className="real-world__empty page-shell">
          <EmptyState eyebrow="REAL WORLD" title="Standard 任务媒体待接入" description="仅内部评审显示；公开站点不渲染本区块。" statusText="Needs verified Standard media" />
        </div>
      )}
    </section>
  );
}
