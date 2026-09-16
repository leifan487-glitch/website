import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { MantisStandardPage } from "./pages/MantisStandardPage.jsx";
import { TechnologyPage } from "./pages/TechnologyPage.jsx";
import { ApplicationsPage } from "./pages/ApplicationsPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { NewsPage } from "./pages/NewsPage.jsx";
import { NewsDetailPage } from "./pages/NewsDetailPage.jsx";
import { InquiryPage } from "./pages/InquiryPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import {
  DocumentsPage,
  KnowledgePage,
  ServicePage,
  SupportOverviewPage,
  SupportContactPage,
  VideosPage,
} from "./pages/SupportPages.jsx";
import { PrivacyPage, TermsPage } from "./pages/PolicyPages.jsx";
import { getRouteMetadata } from "./data/siteMetadata.js";

function setMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    document.head.append(element);
  }
  element.setAttribute("content", content);
}

function setSiteUrlMetadata(pathname) {
  const configuredSiteUrl = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
  let canonical = document.head.querySelector('link[rel="canonical"]');
  let openGraphUrl = document.head.querySelector('meta[property="og:url"]');
  if (!configuredSiteUrl) {
    canonical?.remove();
    openGraphUrl?.remove();
    return;
  }
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.append(canonical);
  }
  const pageUrl = `${configuredSiteUrl}${pathname === "/" ? "" : pathname}`;
  canonical.setAttribute("href", pageUrl);
  setMeta('meta[property="og:url"]', { property: "og:url" }, pageUrl);
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const metadata = getRouteMetadata(pathname);
    window.scrollTo(0, 0);
    document.documentElement.lang = "zh-CN";
    document.title = metadata.title;
    setMeta('meta[name="description"]', { name: "description" }, metadata.description);
    setMeta('meta[property="og:title"]', { property: "og:title" }, metadata.title);
    setMeta('meta[property="og:description"]', { property: "og:description" }, metadata.description);
    setMeta('meta[property="og:type"]', { property: "og:type" }, "website");
    setSiteUrlMetadata(pathname);
    const frame = requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        target?.scrollIntoView();
        if (hash === "#contact") target?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

export function App() {
  function skipNavigation(event) {
    const target = document.querySelector("main h1") || document.getElementById("main-content");
    if (!target) return;
    event.preventDefault();
    // Navbar lives inside main: focus the content heading so Tab truly bypasses it.
    target.setAttribute("tabindex", "-1");
    target.focus();
  }
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipNavigation}>
        跳到主要内容
      </a>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Navigate to="/products/mantis-standard" replace />} />
        <Route path="/products/mantis-standard" element={<MantisStandardPage />} />
        <Route path="/products/mantis-pro" element={<Navigate to="/products/mantis-standard" replace />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/peoples-daily-whrg-2025" element={<NewsDetailPage />} />
        <Route path="/contact" element={<Navigate to="/inquiry" replace />} />
        <Route path="/support" element={<SupportOverviewPage />} />
        <Route path="/support/contact" element={<SupportContactPage />} />
        <Route path="/support/documents" element={<DocumentsPage />} />
        <Route path="/support/downloads" element={<Navigate to="/support/documents" replace />} />
        <Route path="/support/videos" element={<VideosPage />} />
        <Route path="/support/service" element={<ServicePage />} />
        <Route path="/support/knowledge" element={<KnowledgePage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/policy/privacy" element={<PrivacyPage />} />
        <Route path="/policy/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
