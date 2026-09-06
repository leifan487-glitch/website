import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isPublicResource } from "../data/resources/visibility.js";
import { Footer } from "./Footer.jsx";
import { InternalStatus } from "./InternalStatus.jsx";
import { PageHero } from "./PageHero.jsx";
import { EmptyState } from "./EmptyState.jsx";

function resourceHref(resource) {
  return resource.fileUrl || resource.videoSrc || resource.href;
}

export function ResourceCenter({
  eyebrow,
  title,
  intro,
  sectionLabel,
  emptyTitle,
  emptyText,
  resources,
  filters = [],
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const publicResources = useMemo(
    () => resources.filter(isPublicResource).filter((resource) => (
      activeFilter === "all" || resource.product === activeFilter
    )),
    [activeFilter, resources],
  );

  return (
    <>
      <main id="main-content">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} />
        <section className="resource-center page-shell" aria-labelledby="resource-section-title">
          <header className="resource-center__header">
            <p id="resource-section-title">{sectionLabel}</p>
            {filters.length ? (
              <div className="resource-filters" aria-label={`${title} 筛选`}>
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={activeFilter === filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            ) : null}
          </header>

          {publicResources.length ? (
            <div className="resource-list">
              {publicResources.map((resource) => (
                <article key={resource.id}>
                  <div>
                    <p>{resource.category}</p>
                    <h2>{resource.title}</h2>
                  </div>
                  <p>{resource.description}</p>
                  <a href={resourceHref(resource)}>{resource.fileType || "查看资源"}</a>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="MANTIS STANDARD"
              title={emptyTitle}
              description={emptyText}
              statusText="真实资源与公开授权待确认"
            />
          )}

          <Link className="text-link" to="/support">返回支持中心</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
