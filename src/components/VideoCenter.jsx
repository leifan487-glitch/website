import { useState } from "react";
import { StandardMediaPlayer } from "./StandardMediaPlayer.jsx";
import { isPublicStandardMedia, standardTaskMedia } from "../data/standard/index.js";

const publicVideos = standardTaskMedia.filter(isPublicStandardMedia);

const featured = publicVideos.find((item) => item.sourceId === "SV035");

const collections = [
  { id: "product", index: "02", label: "PRODUCT", title: "产品", ids: ["SV007", "SV001"] },
  { id: "tasks", index: "03", label: "TASKS", title: "任务操作", ids: ["SV003", "SV010", "SV018"] },
  { id: "service", index: "04", label: "SERVICE", title: "服务场景", ids: ["SV037"] },
  { id: "industrial", index: "05", label: "INDUSTRIAL", title: "工业场景", ids: ["SV054"] },
].map((collection) => ({
  ...collection,
  items: collection.ids
    .map((sourceId) => publicVideos.find((item) => item.sourceId === sourceId))
    .filter(Boolean),
}));

const filters = [
  { id: "all", title: "全部" },
  ...collections.map(({ id, title }) => ({ id, title })),
];

const libraryVideos = collections.flatMap((collection) => (
  collection.items.map((item) => ({ ...item, collectionId: collection.id }))
));

function VideoCard({ item }) {
  return (
    <article className="video-card">
      <StandardMediaPlayer media={item} />
      <div className="video-card__copy">
        <div><p>{item.category}</p><span>{item.durationLabel}</span></div>
        <h3>{item.titleZh}</h3>
        <small>{item.titleEn}</small>
        <p>{item.descriptionZh}</p>
      </div>
    </article>
  );
}

export function VideoCenter() {
  const [activeFilter, setActiveFilter] = useState("all");
  const visibleVideos = activeFilter === "all"
    ? libraryVideos
    : libraryVideos.filter((item) => item.collectionId === activeFilter);

  return (
    <>
      {featured ? (
        <section className="video-featured page-shell" aria-labelledby="video-featured-title">
          <header>
            <p className="section-index">01 · FEATURED</p>
            <h2 id="video-featured-title">真实任务影像</h2>
            <p>通过连续、未经加速的任务片段，查看 Mantis Standard 的实际操作过程。</p>
          </header>
          <article>
            <StandardMediaPlayer media={featured} />
            <div><p>{featured.category} · {featured.durationLabel}</p><h3>{featured.titleZh}</h3><small>{featured.titleEn}</small><p>{featured.descriptionZh}</p></div>
          </article>
        </section>
      ) : null}

      {libraryVideos.length ? (
        <section className="video-library page-shell" aria-labelledby="video-library-title">
          <header className="video-library__header">
            <p className="section-index">02 · LIBRARY</p>
            <div>
              <h2 id="video-library-title">全部视频</h2>
              <p>公开影像集中排列，可按任务类型查看。</p>
            </div>
            <strong aria-live="polite">{String(visibleVideos.length).padStart(2, "0")}</strong>
          </header>
          <nav className="video-library__filters" aria-label="视频分类">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span>{filter.title}</span>
                <small>{String(filter.id === "all" ? libraryVideos.length : collections.find((item) => item.id === filter.id)?.items.length || 0).padStart(2, "0")}</small>
              </button>
            ))}
          </nav>
          <div className="video-library__grid">
            {visibleVideos.map((item) => <VideoCard item={item} key={item.id} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}
