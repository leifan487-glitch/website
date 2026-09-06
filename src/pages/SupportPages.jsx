import { Link } from "react-router-dom";
import { Footer } from "../components/Footer.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { InternalStatus } from "../components/InternalStatus.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { PendingForm } from "../components/PendingForm.jsx";
import { ResourceCenter } from "../components/ResourceCenter.jsx";
import { VideoCenter } from "../components/VideoCenter.jsx";
import { documentResources } from "../data/resources/documents.js";
import { downloadResources } from "../data/resources/downloads.js";
import { knowledgeResources } from "../data/resources/knowledge.js";
import { getVisibleSupportModules, isSupportModuleVisible, supportModules } from "../data/supportModules.js";

function SupportModuleGate({ moduleId, children }) {
  if (isSupportModuleVisible(moduleId)) return children;
  const module = supportModules[moduleId];
  return (
    <>
      <main id="main-content">
        <PageHero eyebrow={`SUPPORT / ${module.label.toUpperCase()}`} title={module.title} intro="该内容当前未在公开模式开放。" />
        <section className="resource-center page-shell">
          <EmptyState eyebrow="SUPPORT MODULE" title="该内容暂未开放" description="请返回支持中心查看当前可用内容。" />
          <Link className="text-link" to="/support">返回支持中心</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function SupportOverviewPage() {
  return (
    <>
      <main id="main-content">
        <PageHero eyebrow="BLUE WORM / SUPPORT" title="支持中心" intro="文档、下载、视频、售后与知识内容的统一入口。" />
        <section className="support-directory page-shell" aria-labelledby="support-directory-title">
          <header>
            <p>RESOURCE NAVIGATION</p>
            <h2 id="support-directory-title">支持与资源</h2>
            <InternalStatus as="p" status="TODO">正式资源与服务流程正在准备中</InternalStatus>
          </header>
          <nav aria-label="支持资源">
            {getVisibleSupportModules().map((item) => (
              <Link key={item.id} to={item.href}>
                <span>{item.index}</span>
                <strong>{item.title}</strong>
                <span>{item.label}</span>
                <p>{item.description}</p>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function DocumentsPage() {
  return <SupportModuleGate moduleId="documents"><ResourceCenter eyebrow="SUPPORT / DOCUMENTS" title="文档中心" intro="未来承载 Mantis Standard 经确认可公开的正式文档。" sectionLabel="MANTIS STANDARD" emptyTitle="资料准备中" emptyText="当前暂无可公开文档。" resources={documentResources} /></SupportModuleGate>;
}

export function DownloadsPage() {
  return <SupportModuleGate moduleId="downloads"><ResourceCenter eyebrow="SUPPORT / DOWNLOADS" title="下载中心" intro="产品资料、开发资源与软件工具的统一下载入口。" sectionLabel="MANTIS STANDARD" emptyTitle="资料准备中" emptyText="当前暂无可公开下载资源。" resources={downloadResources} /></SupportModuleGate>;
}

export function VideosPage() {
  return <SupportModuleGate moduleId="videos"><><main id="main-content" className="videos-page"><PageHero variant="video" eyebrow="VIDEO CENTER / MANTIS STANDARD" title="任务影像" intro="Mantis Standard 的产品形态、操作过程与应用场景影像。" /><VideoCenter /></main><Footer /></></SupportModuleGate>;
}

export function KnowledgePage() {
  return <SupportModuleGate moduleId="knowledge"><ResourceCenter eyebrow="SUPPORT / KNOWLEDGE" title="知识库" intro="经确认的产品使用、开发与故障排查内容将在此归档。" sectionLabel="MANTIS STANDARD" emptyTitle="内容正在整理中" emptyText="当前暂无可公开知识条目。" resources={knowledgeResources} /></SupportModuleGate>;
}

const serviceFields = [
  { name: "service-name", label: "姓名", required: true, autoComplete: "name" },
  { name: "service-company", label: "公司 / 机构", required: true, autoComplete: "organization" },
  { name: "service-contact", label: "联系方式", type: "tel", inputMode: "tel", required: true, validation: "phone", autoComplete: "tel" },
  { name: "service-product", label: "产品", defaultValue: "Mantis Standard", readOnly: true },
  { name: "service-issue", label: "问题类型", as: "select", options: ["请选择", "产品使用", "设备问题", "其他"] },
  { name: "service-description", label: "问题描述", as: "textarea", rows: 6 },
];

export function ServicePage() {
  return (
    <SupportModuleGate moduleId="service">
      <>
      <main id="main-content">
        <PageHero eyebrow="SUPPORT / SERVICE" title="售后服务" intro="为产品使用或设备问题预留统一支持入口。" />
        <section className="form-page page-shell">
          <div className="form-page__context">
            <p>AFTER-SALES SERVICE</p>
            <h2>支持入口已建立，正式流程待确认。</h2>
            <InternalStatus as="p" status="TODO">官方售后流程、接收方与处理时效待确认</InternalStatus>
          </div>
          <PendingForm title="售后支持信息" fields={serviceFields} backendText="售后接收后台待接入" />
        </section>
      </main>
      <Footer />
      </>
    </SupportModuleGate>
  );
}
