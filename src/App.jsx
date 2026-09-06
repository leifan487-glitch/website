import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { MantisStandardPage } from "./pages/MantisStandardPage.jsx";
import { TechnologyPage } from "./pages/TechnologyPage.jsx";
import { ApplicationsPage } from "./pages/ApplicationsPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { NewsPage } from "./pages/NewsPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import {
  DocumentsPage,
  DownloadsPage,
  KnowledgePage,
  ServicePage,
  VideosPage,
} from "./pages/SupportPages.jsx";
import { InquiryPage } from "./pages/InquiryPage.jsx";
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
  const { pathname } = useLocation();

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
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
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
        <Route path="/contact" element={<Navigate to="/inquiry" replace />} />
        <Route path="/support" element={<Navigate to="/support/videos" replace />} />
        <Route path="/support/documents" element={<DocumentsPage />} />
        <Route path="/support/downloads" element={<DownloadsPage />} />
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
