import { Link } from "react-router-dom";
import { getApplicationTaskAnchor } from "../data/applicationTaskAnchors.js";
import { getStandardMediaByUsage } from "../data/standard/index.js";
import { homeTechnologyPlatforms, getPublicHomeNews, getPublicHomePartners } from "../data/home.js";
import { businessEmail } from "../data/contact.js";

export function HomeTechnology() {
  return (
    <section className="home-technology-preview home-story-section" id="technology" aria-labelledby="home-technology-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-technology-title">核心技术</h2></header>
        <div className="home-technology-preview__items">
          {homeTechnologyPlatforms.map((item) => <article key={item.id}>
            <h3>{item.nameZh}<span>{item.name}</span></h3><p>{item.roleZh}</p>
          </article>)}
        </div>
        <div className="home-section-action"><Link className="home-section-link" to="/technology"><span>查看技术体系</span><span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  );
}

export function HomeApplications() {
  const applicationScenes = getStandardMediaByUsage("applications", { publicMode: true }).slice(0, 3);
  return (
    <section className="home-tasks home-story-section" id="applications" aria-labelledby="home-applications-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-applications-title">现场片段</h2><Link className="home-section-link" to="/applications"><span>查看应用与任务记录</span><span aria-hidden="true">↗</span></Link></header>
        <div className="home-tasks__items">
          {applicationScenes.map((item) => <article key={item.id}>
            <Link className="home-tasks__preview" to={`/applications#${getApplicationTaskAnchor(item)}`} aria-label={`查看${item.titleZh}应用记录`}>
              <img src={item.poster} alt={`${item.titleZh}真实任务画面`} width={item.width} height={item.height} loading="lazy" decoding="async" />
              <h3>{item.titleZh}<span aria-hidden="true">↗</span></h3>
            </Link>
          </article>)}
        </div>
      </div>
    </section>
  );
}

export function HomeNews({ items = getPublicHomeNews() }) {
  const visible = getPublicHomeNews(items);
  if (visible.length === 0) return null;
  return (
    <section className="home-news home-story-section" id="news" aria-labelledby="home-news-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-news-title">新闻动态</h2></header>
        <ul>{visible.map((item) => <li key={item.id}>
          <time dateTime={item.date}>{item.date}</time>
          <div><p>{item.publisher}</p><h3><Link to={item.internalPath}>{item.title}<span aria-hidden="true">→</span></Link></h3></div>
        </li>)}</ul>
      </div>
    </section>
  );
}

export function HomePartners({ items = getPublicHomePartners() }) {
  const visible = getPublicHomePartners(items);
  if (visible.length === 0) return null;
  return (
    <section className="home-partners home-story-section" id="partners" aria-labelledby="home-partners-title"><div className="page-shell">
      <header className="home-story-heading"><h2 id="home-partners-title">合作伙伴</h2></header>
      <ul>{visible.map((item) => <li key={item.id}><img src={item.logo} alt={item.alt} loading="lazy" decoding="async" /></li>)}</ul>
    </div></section>
  );
}

export function HomeContact() {
  return (
    <section className="home-contact home-story-section" id="contact" tabIndex={-1} aria-labelledby="home-contact-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-contact-title">采购合作</h2></header>
        <div className="home-contact__summary" id="home-contact">
          <p>{businessEmail}</p>
          <div className="home-contact__actions">
            <Link className="home-contact__link" to="/inquiry">填写合作需求<span aria-hidden="true"> →</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
