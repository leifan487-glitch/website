import { Link } from "react-router-dom";
import { verifiedMediaCoverage } from "../data/news.js";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";

const report = verifiedMediaCoverage.find(item => item.id === "peoples-daily-whrg-2025");

export function NewsDetailPage() {
  return <><main id="main-content" className="news-page news-detail-page">
    <Navbar theme="light" homeHref="/" />
    <article className="news-detail page-shell">
      <Link className="news-back" to="/news">← 新闻与动态</Link>
      <header><div className="news-meta"><time dateTime={report.date}>{report.date}</time><span>{report.publisher}</span></div><h1>{report.title}</h1></header>
      <p className="news-detail__summary">{report.summary}</p>
      <a className="news-original" href={report.href} target="_blank" rel="noopener noreferrer">查看人民日报原文 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页）</span></a>
    </article>
  </main><Footer /></>;
}
