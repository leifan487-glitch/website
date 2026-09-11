import { useMemo, useState } from "react";
import { Footer } from "./Footer.jsx";
import { EditorialHeading } from "./EditorialHeading.jsx";
import { Navbar } from "./Navbar.jsx";
import { isPublicResource } from "../data/resources/visibility.js";

const documentCategories = [
  { value: "all", label: "全部" },
  { value: "Mantis Standard", label: "Mantis Standard" },
];

function documentHref(resource) {
  return resource.fileUrl || resource.href;
}

export function DocumentCenter({ resources }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  const visibleDocuments = useMemo(() => resources
    .filter(isPublicResource)
    .filter((resource) => activeCategory === "all" || resource.product === activeCategory)
    .filter((resource) => {
      if (!normalizedQuery) return true;
      return [resource.title, resource.product, resource.category, resource.description]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
    }), [activeCategory, normalizedQuery, resources]);

  const hasPublishedDocuments = resources.some(isPublicResource);

  return (
    <>
      <main id="main-content" className="document-center-page">
        <Navbar theme="light" homeHref="/" />

        <section className="document-center page-shell" aria-labelledby="document-center-title">
          <EditorialHeading
            className="document-center__heading"
            meta="支持 / 文档"
            title="文档中心"
            intro="集中查找 Mantis Standard 的使用、开发与交付资料。正式内容将在审核后持续补充。"
            titleId="document-center-title"
            titleTag="h1"
          />

          <div className="document-center__workspace">
            <aside className="document-center__controls" aria-label="文档筛选">
              <form
                className="document-search"
                role="search"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="document-search-input">搜索文档</label>
                <div>
                  <input
                    id="document-search-input"
                    type="search"
                    value={query}
                    placeholder="输入文档名称"
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <button type="submit">搜索</button>
                </div>
              </form>

              <div className="document-categories" aria-label="文档分类">
                <p>文档分类</p>
                {documentCategories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    aria-pressed={activeCategory === category.value}
                    onClick={() => setActiveCategory(category.value)}
                  >
                    <span>{category.label}</span>
                    <span aria-hidden="true">{category.value === "all" ? "01" : "02"}</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="document-results" aria-labelledby="document-results-title" aria-live="polite">
              <header>
                <h2 id="document-results-title">
                  {activeCategory === "all" ? "全部文档" : activeCategory}
                </h2>
                <p>{visibleDocuments.length} 项已发布</p>
              </header>

              <div className="document-grid">
                {visibleDocuments.map((resource) => (
                  <a
                    className="document-card"
                    href={documentHref(resource)}
                    key={resource.id}
                  >
                    <p>{resource.product || "Mantis Standard"}</p>
                    <h3>{resource.title}</h3>
                    <span>{resource.description}</span>
                    <footer>
                      <span>{resource.version || resource.updatedAt || "最新版本"}</span>
                      <strong>{resource.fileType || "查看"}</strong>
                    </footer>
                  </a>
                ))}

                {!hasPublishedDocuments && !normalizedQuery ? (
                  <article className="document-card document-card--placeholder" aria-label="待补充文档占位">
                    <p>Mantis Standard</p>
                    <h3>文档内容待补充</h3>
                    <span>页面框架已经就绪，正式文件将在完成内容与公开审核后发布。</span>
                    <footer>
                      <span>等待正式资料</span>
                      <strong>待发布</strong>
                    </footer>
                  </article>
                ) : null}

                {visibleDocuments.length === 0 && (hasPublishedDocuments || normalizedQuery) ? (
                  <div className="document-results__empty">
                    <h3>没有找到相关文档</h3>
                    <p>请尝试更换关键词或选择其他分类。</p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
