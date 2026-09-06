import { Link } from "react-router-dom";
import { publicProgressRecords, verifiedMediaCoverage } from "../data/news.js";
import { PageHero } from "../components/PageHero.jsx";
import { Footer } from "../components/Footer.jsx";

export function NewsPage() {
  return <><main id="main-content"><PageHero eyebrow="COMPANY / PROGRESS" title="Progress" intro="公司进展与公开记录。" />
    <section className="public-progress page-shell" aria-labelledby="public-progress-title"><header><p className="section-index">02 · COMPETITIONS</p><h2 id="public-progress-title">赛事记录</h2></header><ol>{publicProgressRecords.map((item,index) => <li key={item.id}><span>{item.year || String(index+1).padStart(2,"0")}</span><div><p>{item.category}</p><h3>{item.title}</h3></div><strong>{item.result}</strong></li>)}</ol></section>
    {verifiedMediaCoverage.length ? <section className="media-coverage page-shell"><header><p className="section-index">03 · MEDIA</p><h2>媒体报道</h2></header>{verifiedMediaCoverage.map((item) => <article key={item.id}><div><span>{item.date}</span><p>{item.publisher}</p></div><div><h3>{item.title}</h3><p>{item.summary}</p><a className="text-link" href={item.href} target="_blank" rel="noreferrer">查看来源</a></div></article>)}</section> : null}
    <section className="company-cta page-shell"><p className="section-index">04 · CONTACT</p><h2>媒体与合作</h2><Link className="text-link" to="/inquiry">商务询盘</Link></section>
  </main><Footer /></>;
}
