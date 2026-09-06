import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "./EmptyState.jsx";
import { InternalStatus } from "./InternalStatus.jsx";
import { StandardMediaPlayer } from "./StandardMediaPlayer.jsx";
import {
  getStandardMediaByUsage,
  selectStandardContent,
  standardApplicationDirections,
  standardCapabilities,
  standardDevelopment,
  standardModularArchitecture,
  standardProduct,
  standardPublicMode,
  standardQa,
  standardPublicSpecs,
  standardSpecGroups,
  standardSpecs,
} from "../data/standard/index.js";

function SectionHeading({ index, label, title, intro, titleId, light = false }) {
  return (
    <header className="standard-section__heading page-shell">
      <p className={`section-index${light ? " section-index--light" : ""}`}>{index} · {label}</p>
      <h2 id={titleId}>{title}</h2>
      <p>{intro}</p>
    </header>
  );
}

function ReviewEmpty({ eyebrow, title, description }) {
  return (
    <div className="standard-section__empty page-shell">
      <EmptyState eyebrow={eyebrow} title={title} description={description} statusText="正式内容与公开口径待确认" />
    </div>
  );
}

export function ModularArchitectureSection() {
  const items = selectStandardContent(standardModularArchitecture);
  const moduleGroups = [items.slice(0, 3), items.slice(3)];
  return (
    <section className="standard-section standard-modular" id="modular" aria-labelledby="standard-modular-title">
      <div className="standard-modular__stage page-shell">
        <header className="standard-modular__heading">
          <p>{standardProduct.slogan}</p>
          <h2 id="standard-modular-title">
            <span>一套核心，</span>
            <span>按任务组合形态。</span>
          </h2>
          <p>机器人主体、双臂、移动、升降、快换与工具，围绕同一套产品架构协同工作。</p>
        </header>

        {items.length ? (
          <div className="standard-modular__assembly">
            <ul className="standard-modular__modules standard-modular__modules--left">
              {moduleGroups[0].map((item) => (
                <li key={item.id}>
                  <div><strong>{item.title}</strong><small>{item.label}</small></div>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>

            <figure className="standard-modular__visual">
              <div className="standard-modular__visual-label" aria-hidden="true">
                <span>ONE CORE</span>
                <span>MULTIPLE FORMS</span>
              </div>
              <img src="/assets/nav-standard-a01781.webp" alt="Mantis Standard 正面整机渲染" width="349" height="760" loading="lazy" decoding="async" />
              <figcaption><InternalStatus status="SOURCE">A01781 · Standard visual</InternalStatus></figcaption>
            </figure>

            <ul className="standard-modular__modules standard-modular__modules--right">
              {moduleGroups[1].map((item) => (
                <li key={item.id}>
                  <div><strong>{item.title}</strong><small>{item.label}</small></div>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : <ReviewEmpty eyebrow="MODULAR ARCHITECTURE" title="模块信息待确认" description="正式模块边界与接口说明将在确认后发布。" />}
      </div>
    </section>
  );
}

const systemTabs = [
  { id: "capabilities", label: "核心能力", en: "Capabilities" },
  { id: "development", label: "开发路径", en: "Development" },
  { id: "applications", label: "应用方向", en: "Applications" },
];

export function CapabilitySystemSection() {
  const [activeTab, setActiveTab] = useState(systemTabs[0].id);
  const tabRefs = useRef([]);
  const capabilities = selectStandardContent(standardCapabilities);
  const development = selectStandardContent(standardDevelopment);
  const applications = selectStandardContent(standardApplicationDirections);

  function handleTabKeyDown(index, event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = systemTabs.length - 1;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % systemTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + systemTabs.length) % systemTabs.length;
    setActiveTab(systemTabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="standard-section standard-system" id="capability-system" aria-labelledby="standard-system-title">
      <header className="standard-system__header page-shell">
        <div>
          <p>Body / Development / Task</p>
          <h2 id="standard-system-title">
            <span>让能力、开发与任务</span>
            <span>连成一条路径。</span>
          </h2>
        </div>
        <p>同一套产品架构连接机器人能力、开放开发流程与六类应用方向。</p>
      </header>

      <div className="standard-system__body page-shell">
        <div className="standard-system__tabs" role="tablist" aria-label="产品能力系统">
          {systemTabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`system-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`system-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(index, event)}
            >
              <span aria-hidden="true">{index === 0 ? "BODY" : index === 1 ? "BUILD" : "TASK"}</span>
              <strong>{tab.label}</strong>
              <small>{tab.en}</small>
            </button>
          ))}
        </div>

        <div className="standard-system__panels">
          <div id="system-panel-capabilities" role="tabpanel" aria-labelledby="system-tab-capabilities" hidden={activeTab !== "capabilities"}>
            <div className="standard-system__panel-heading">
              <p>本体能力</p>
              <span>结构、操作、移动、工具与开放开发共同构成任务基础。</span>
            </div>
            <ul className="standard-system__capabilities">
              {capabilities.map((item) => (
                <li key={item.id}>
                  <div><h3>{item.title}</h3><small>{item.label}</small></div>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div id="system-panel-development" role="tabpanel" aria-labelledby="system-tab-development" hidden={activeTab !== "development"}>
            <div className="standard-system__panel-heading">
              <p>开发路径</p>
              <span>从仿真和接口出发，连接数据、操作与任务调用。</span>
            </div>
            <ol className="standard-system__development">
              {development.map((item, index) => (
                <li key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                  <ul aria-label={`${item.title}开发工具`}>{item.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                  <small>{item.description}</small>
                </li>
              ))}
            </ol>
          </div>

          <div id="system-panel-applications" role="tabpanel" aria-labelledby="system-tab-applications" hidden={activeTab !== "applications"}>
            <div className="standard-system__panel-heading">
              <p>应用方向</p>
              <span>六类任务方向，共用同一套产品与开发体系。</span>
            </div>
            <ul className="standard-system__applications">
              {applications.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <small>{item.label}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RealTasksSection() {
  const media = getStandardMediaByUsage("productRealTasks");
  if (standardPublicMode && !media.length) return null;
  return (
    <section className="standard-section standard-real-tasks" id="real-tasks" aria-labelledby="standard-real-tasks-title">
      <SectionHeading index="06" label="REAL TASKS" title="真实任务" intro="只接入身份、任务内容与公开权限均已确认的 Standard 媒体。" titleId="standard-real-tasks-title" />
      {media.length ? (
        <div className="standard-real-tasks__media page-shell">
          {media.map((item) => (
            <figure key={item.id}>
              <StandardMediaPlayer media={item} />
              <figcaption><span>{item.titleZh}</span><small>{item.titleEn}</small><p>{item.descriptionZh}</p><em>{item.durationLabel}</em></figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="standard-section__empty page-shell">
          <EmptyState eyebrow="MANTIS STANDARD" title="真实任务资料准备中" description="当前没有已确认并获准公开的 Standard 任务视频或照片。" statusText="机器人身份、任务内容与公开权限待确认" />
        </div>
      )}
    </section>
  );
}

const specGroupLabels = {
  "Robot Body": "机器人本体",
  Mobility: "移动系统",
  "Dual Arm": "双臂系统",
  "Lift / Workspace": "升降与工作空间",
  "Compute / Interface": "计算与接口",
  "Development / Connectivity": "开发与连接",
};

export function SpecificationsSection() {
  const visibleSpecs = standardPublicMode ? selectStandardContent(standardPublicSpecs) : selectStandardContent(standardSpecs);
  const groups = standardSpecGroups
    .map((group) => ({ group, specs: visibleSpecs.filter((item) => item.group === group) }))
    .filter((entry) => entry.specs.length);

  return (
    <section className="standard-section standard-specifications" id="specifications" aria-labelledby="standard-specifications-title">
      <header className="standard-specifications__header page-shell">
        <p>Specifications</p>
        <div><h2 id="standard-specifications-title">规格参数</h2><p>以公开基线分组呈现整机尺寸、移动、双臂、升降、计算接口与开发连接信息。</p></div>
        <div className="standard-specifications__summary"><strong>{String(groups.length).padStart(2, "0")}</strong><span>PUBLIC GROUPS</span></div>
      </header>

      {groups.length ? (
        <div className="standard-specifications__matrix page-shell">
          {groups.map(({ group, specs }, groupIndex) => (
            <article className="standard-specifications__group" key={group} aria-labelledby={`spec-group-${groupIndex}`}>
              <header>
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <div><h3 id={`spec-group-${groupIndex}`}>{specGroupLabels[group] || group}</h3><small>{group}</small></div>
              </header>
              <dl>
                {specs.map((item) => (
                  <div key={item.id} data-conflict={item.conflict || undefined}>
                    <dt><span>{item.label}</span><small>{item.variant}</small></dt>
                    <dd><strong>{item.value}</strong>{item.unit ? <span>{item.unit}</span> : null}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      ) : <ReviewEmpty eyebrow="SPECIFICATIONS" title="参数信息待确认" description="当前没有通过公开批准且不存在冲突的 Standard 参数。" />}
    </section>
  );
}

function QaItem({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const buttonId = `${baseId}-button`;
  return (
    <li data-open={open}>
      <button id={buttonId} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((current) => !current)}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{item.question}</strong>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
        <p>{item.answer}</p>
      </div>
    </li>
  );
}

export function StandardQaSection() {
  const items = selectStandardContent(standardQa);
  if (!items.length) return null;
  return (
    <section className="standard-section standard-qa" id="questions" aria-labelledby="standard-qa-title">
      <div className="standard-qa__layout page-shell">
        <header>
          <p>Questions</p>
          <h2 id="standard-qa-title">常见<br />问题</h2>
          <p>关于产品形态、模块化设计、开发方式与应用方向。</p>
        </header>
        <ol className="standard-qa__list">
          {items.map((item, index) => <QaItem key={item.id} item={item} index={index} />)}
        </ol>
      </div>
    </section>
  );
}

export function StandardInquirySection() {
  return (
    <section className="standard-section standard-inquiry" id="product-inquiry" aria-labelledby="standard-inquiry-title">
      <div className="standard-inquiry__inner page-shell">
        <p>Build with Mantis</p>
        <h2 id="standard-inquiry-title">让 Mantis<br />进入你的任务。</h2>
        <Link to="/inquiry"><span>提交商务询盘</span><span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}

export function StandardProductSections() {
  return (
    <>
      <ModularArchitectureSection />
      <CapabilitySystemSection />
      <RealTasksSection />
      <SpecificationsSection />
      <StandardQaSection />
      <StandardInquirySection />
    </>
  );
}
