import { useMemo, useState } from "react";
import { Footer } from "./Footer.jsx";
import { Link } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { isPublicResource } from "../data/resources/visibility.js";

const documentCategories = [
  { value: "all", label: "全部" },
  { value: "Mantis Standard", label: "Mantis Standard" },
];

function documentHref(resource) {
  return resource.fileUrl || resource.href;
}

export function DocumentCenter({ resources, mode = "documents" }) {
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

  const publishedDocuments = resources.filter(isPublicResource);
  const downloadMode = mode === "downloads";
  const title = downloadMode ? "下载中心" : "文档中心";

  return (
    <>
      <main id="main-content" className="document-center-page">
        <Navbar theme="light" homeHref="/" />

        <section className="document-center page-shell" aria-labelledby="document-center-title">
          <header className="support-page-heading">
            <nav aria-label="面包屑"><Link to="/support">服务与支持</Link><span aria-hidden="true"> / </span><span>{title}</span></nav>
            <h1 id="document-center-title">{title}</h1>
            <p>{downloadMode ? "下载 Mantis Standard 使用、开发与交付资料，便于离线查阅。" : "查阅 Mantis Standard 使用、开发与交付资料。"}</p>
          </header>

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
                    <span>{publishedDocuments.filter((resource) => category.value === "all" || resource.product === category.value).length}</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="document-results" aria-labelledby="document-results-title" aria-live="polite">
              <header>
                <h2 id="document-results-title">
                  {activeCategory === "all" ? (downloadMode ? "全部文件" : "全部文档") : activeCategory}
                </h2>
                <p>{visibleDocuments.length} {normalizedQuery ? "项匹配" : "项已发布"}</p>
              </header>

              <div className="document-grid">
                {visibleDocuments.map((resource) => (
                  <article
                    className="document-card"
                    key={resource.id}
                  >
                    <p>{resource.product || "Mantis Standard"}</p>
                    <h3>{resource.title}</h3>
                    <span>{resource.description}</span>
                    <footer>
                      <span>{resource.fileType} · {(resource.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      <div className="document-card__actions">
                        <a href={documentHref(resource)} target="_blank" rel="noopener noreferrer" aria-label={`查看${resource.title}`}>查看</a>
                        <a className={downloadMode ? "is-primary" : undefined} href={documentHref(resource)} download aria-label={`下载${resource.title}`}>下载</a>
                      </div>
                    </footer>
                  </article>
                ))}

                {visibleDocuments.length === 0 ? (
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
