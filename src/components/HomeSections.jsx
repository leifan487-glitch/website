import { Link } from "react-router-dom";
import { getStandardMediaByUsage } from "../data/standard/index.js";
import { homeTechnologyPlatforms, getPublicHomeNews, getPublicHomePartners } from "../data/home.js";
import { businessEmail, businessEmailHref } from "../data/contact.js";

export function HomeTechnology() {
  return (
    <section className="home-technology-preview home-story-section" id="technology" aria-labelledby="home-technology-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-technology-title">技术体系</h2><Link className="home-section-link" to="/technology"><span>查看技术</span><span aria-hidden="true">↗</span></Link></header>
        <div className="home-technology-preview__items">
          {homeTechnologyPlatforms.map((item) => <article key={item.id}>
            <h3>{item.nameZh}<span>{item.name}</span></h3><p>{item.roleZh}</p>
          </article>)}
        </div>
      </div>
    </section>
  );
}

export function HomeApplications() {
  const applicationScenes = getStandardMediaByUsage("applications", { publicMode: true }).slice(0, 3);
  return (
    <section className="home-tasks home-story-section" id="applications" aria-labelledby="home-applications-title">
      <div className="page-shell">
        <header className="home-story-heading"><h2 id="home-applications-title">任务现场</h2><Link className="home-section-link" to="/applications"><span>查看全部应用</span><span aria-hidden="true">↗</span></Link></header>
        <div className="home-tasks__items">
          {applicationScenes.map((item) => <article key={item.id}>
            <img src={item.poster} alt={`${item.titleZh}真实任务画面`} width={item.width} height={item.height} loading="lazy" decoding="async" />
            <h3>{item.titleZh}</h3><p>{item.descriptionZh}</p>
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
        <header className="home-story-heading"><h2 id="home-news-title">新闻与报道</h2></header>
        <ul>{visible.map((item) => <li key={item.id}>
          <time dateTime={item.date}>{item.date}</time>
          <div><p>{item.publisher}</p><h3><a href={item.href} target="_blank" rel="noopener noreferrer">{item.title}<span aria-hidden="true">↗</span><span className="sr-only">（新标签页）</span></a></h3></div>
        </li>)}</ul>
      </div>
    </section>
  );
}

export function HomePartners({ items = getPublicHomePartners() }) {
  const visible = getPublicHomePartners(items);
  if (visible.length === 0) return null;
  return (
    <section className="home-partners home-story-section" aria-labelledby="home-partners-title"><div className="page-shell">
      <header className="home-story-heading"><h2 id="home-partners-title">合作伙伴</h2></header>
      <ul>{visible.map((item) => <li key={item.id}><img src={item.logo} alt={item.name} loading="lazy" decoding="async" /></li>)}</ul>
    </div></section>
  );
}

export function HomeContact() {
  return (
    <section className="home-contact home-story-section" id="home-contact" aria-labelledby="home-contact-title">
      <div className="page-shell home-contact__layout"><div><h2 id="home-contact-title">采购 / 合作</h2><p>{businessEmail}</p></div>
        <a className="home-section-link" href={businessEmailHref}><span>联系商务</span><span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
