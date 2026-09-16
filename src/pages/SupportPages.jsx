import { Link } from "react-router-dom";
import { DocumentCenter } from "../components/DocumentCenter.jsx";
import { Footer } from "../components/Footer.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { ResourceCenter } from "../components/ResourceCenter.jsx";
import { VideoCenter } from "../components/VideoCenter.jsx";
import { documentResources } from "../data/resources/documents.js";
import { downloadResources } from "../data/resources/downloads.js";
import { knowledgeResources } from "../data/resources/knowledge.js";
import { getVisibleSupportModules, isSupportModuleVisible, supportModules } from "../data/supportModules.js";
import { businessEmail, businessEmailHref } from "../data/contact.js";

function SupportModuleGate({ moduleId, children }) {
  if (isSupportModuleVisible(moduleId)) return children;
  const module = supportModules[moduleId];
  return (
    <>
      <main id="main-content">
        <PageHero eyebrow={`SUPPORT / ${module.label.toUpperCase()}`} title={module.title} intro="该内容当前未在公开模式开放。" />
        <section className="resource-center page-shell">
          <EmptyState eyebrow="SUPPORT MODULE" title="该内容暂未开放" description="请返回服务与支持查看当前可用内容。" />
          <Link className="text-link" to="/support">返回服务与支持</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function SupportOverviewPage() {
  return (
    <SupportLayout title="服务与支持" intro="从使用说明到开发资料，查找 Mantis Standard 所需的文档与帮助。">
          <nav className="support-resource-directory" aria-label="服务与支持资源">
            {getVisibleSupportModules({ publicPreview: true }).map((item) => (
              <Link key={item.id} to={item.href}>
                <div><h2>{item.title}</h2><p>{item.description}</p></div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
    </SupportLayout>
  );
}

export function DocumentsPage() {
  return <SupportModuleGate moduleId="documents"><DocumentCenter resources={documentResources} /></SupportModuleGate>;
}

export function DownloadsPage() {
  return <SupportModuleGate moduleId="downloads"><DocumentCenter resources={downloadResources} mode="downloads" /></SupportModuleGate>;
}

export function VideosPage() {
  return <SupportModuleGate moduleId="videos"><><main id="main-content" className="videos-page"><PageHero variant="video" title="任务影像" intro="Mantis Standard 的产品形态、操作过程与应用场景影像。" /><VideoCenter /></main><Footer /></></SupportModuleGate>;
}

export function KnowledgePage() {
  return <SupportModuleGate moduleId="knowledge"><ResourceCenter eyebrow="SUPPORT / KNOWLEDGE" title="知识库" intro="经确认的产品使用、开发与故障排查内容将在此归档。" sectionLabel="MANTIS STANDARD" emptyTitle="内容正在整理中" emptyText="当前暂无可公开知识条目。" resources={knowledgeResources} /></SupportModuleGate>;
}

function SupportLayout({ title, intro, children }) {
  return <>
    <main id="main-content" className="support-practical-page">
      <Navbar theme="light" homeHref="/" />
      <section className="support-practical page-shell" aria-labelledby="support-title">
        <header className="support-page-heading">
          {title !== "服务与支持" ? <nav aria-label="面包屑"><Link to="/support">服务与支持</Link><span aria-hidden="true"> / </span><span>{title}</span></nav> : null}
          <h1 id="support-title">{title}</h1><p>{intro}</p>
        </header>
        {children}
      </section>
    </main><Footer />
  </>;
}

export function ServicePage() {
  return (
    <SupportModuleGate moduleId="service">
      <SupportLayout title="售后与服务" intro="查阅产品使用与安全说明，或联系蓝虫说明设备问题。">
        <div className="support-help-content">
          <section><h2>使用前查阅</h2><p>使用说明书与注意事项可在线查看，也可下载保存。</p><Link className="text-link" to="/support/documents">查看产品文档</Link></section>
          <section><h2>描述设备问题</h2><p>联系时可附上产品型号、问题现象、发生条件及相关图片，便于了解情况。请勿发送密码或其他敏感信息。</p><Link className="text-link" to="/support/contact">联系支持</Link></section>
        </div>
      </SupportLayout>
    </SupportModuleGate>
  );
}

export function SupportContactPage() {
  return <SupportModuleGate moduleId="contact">
    <SupportLayout title="联系支持" intro="产品使用问题与商务合作需求，可通过官方邮箱联系蓝虫。">
      <div className="support-help-content">
        <section><h2>官方联系邮箱</h2><a className="support-email" href={businessEmailHref}>{businessEmail}</a><p>请在邮件中说明产品型号、问题或需求，并留下方便联系的方式。</p></section>
        <section><h2>查找产品资料</h2><p>Mantis Standard 使用说明、交付清单、注意事项与开发手册集中在文档中心。</p><Link className="text-link" to="/support/documents">前往文档中心</Link></section>
      </div>
    </SupportLayout>
  </SupportModuleGate>;
}
