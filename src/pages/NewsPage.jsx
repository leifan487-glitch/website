import { Link } from "react-router-dom";
import { publicProgressRecords, verifiedMediaCoverage } from "../data/news.js";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";

export function NewsPage() {
  return <><main id="main-content" className="news-page">
    <Navbar theme="light" homeHref="/" />
    <header className="news-heading page-shell"><h1>新闻与动态</h1></header>
    <section className="news-section page-shell" aria-labelledby="news-media-title">
      <h2 id="news-media-title">媒体报道</h2>
      <ul className="news-records">{verifiedMediaCoverage.map(item => <li key={item.id}>
        <div className="news-meta"><time dateTime={item.date}>{item.date}</time><span>{item.publisher}</span></div>
        <h3><Link to={item.internalPath}>{item.title}<span aria-hidden="true">→</span></Link></h3>
      </li>)}</ul>
    </section>
    <section className="news-section page-shell" aria-labelledby="news-records-title">
      <h2 id="news-records-title">赛事记录</h2>
      <ul className="news-records">{publicProgressRecords.map(item => <li key={item.id}>
        <div className="news-meta">{item.year ? <time dateTime={item.year}>{item.year}</time> : null}</div>
        <div><h3>{item.title}</h3><p>{item.result}</p></div>
      </li>)}</ul>
    </section>
  </main><Footer /></>;
}
