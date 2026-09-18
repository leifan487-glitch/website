import { useId, useState } from "react";
import { Minus, Plus } from "@phosphor-icons/react";
import { EditorialHeading } from "./EditorialHeading.jsx";
import { StandardMediaPlayer } from "./StandardMediaPlayer.jsx";
import { getStandardMediaByUsage, selectStandardContent, standardQa } from "../data/standard/index.js";
import { StandardPerformance } from "./StandardPerformance.jsx";
import { standardHardware } from "../data/standard/story.js";

import { BrochureOverview, BrochureForms, ConfigurationExplorer } from "./StandardBrochureSections.jsx";

function Heading({ title, intro, id, dark = false }) {
  return <EditorialHeading className="sp-heading" title={title} intro={intro} titleId={id} tone={dark ? "dark" : "light"} />;
}

export function ProductOverviewSection() {
  return <section className="sp-section brochure-overview" id="overview" aria-labelledby="overview-title"><BrochureOverview /></section>;
}

export function ModularArchitectureSection() {
  return <><section className="sp-section brochure-modular" id="modular" aria-labelledby="modular-title"><BrochureForms /></section><ConfigurationExplorer /></>;
}

export function CapabilitySystemSection() {
  const structures = standardHardware.filter(item => item.id !== "development");
  const development = standardHardware.find(item => item.id === "development");
  const [activePart, setActivePart] = useState("vision");
  // Coordinates refer to the existing full-body image on a fixed 520 × 640 stage.
  const points = {
    "robot-body": { x: 260, y: 184, end: 56 },
    "dual-arms": { x: 340, y: 222, end: 464 },
    "mobile-base": { x: 175, y: 551, end: 56 },
    lift: { x: 260, y: 412, end: 56 },
    vision: { x: 260, y: 60, end: 464 },
    "quick-connect": { x: 332, y: 344, end: 464 },
  };
  return (
    <section className="sp-section sp-capabilities" id="capability-system" aria-labelledby="capabilities-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="产品结构与接口" intro="按编号查看对应部位。模块组合以配置与任务方案为准。" id="capabilities-title" />
        <div className="sp-capabilities__layout">
          <figure className="sp-anatomy" aria-label="Mantis Standard 部位索引">
            <div className="sp-anatomy__stage">
              <img src="/assets/nav-standard-a01781.webp" alt="Mantis Standard 完整结构；编号与右侧说明对应" width="349" height="760" loading="lazy" decoding="async" />
              <svg viewBox="0 0 520 640" aria-hidden="true">{structures.map(item => {
                const point = points[item.id];
                return <g key={item.id} data-active={activePart === item.id}><circle className="sp-anatomy__halo" cx={point.x} cy={point.y} r="22" /><line x1={point.x} y1={point.y} x2={point.end} y2={point.y} /><circle cx={point.x} cy={point.y} r="4" /></g>;
              })}</svg>
              {structures.map((item, index) => <button key={item.id} type="button" className="sp-anatomy__marker" style={{ left: `${points[item.id].end / 5.2}%`, top: `${points[item.id].y / 6.4}%` }} aria-label={`${String(index + 1).padStart(2, "0")} ${item.title}`} aria-controls={`part-${item.id}`} aria-pressed={activePart === item.id} onClick={() => setActivePart(item.id)}>{String(index + 1).padStart(2, "0")}</button>)}
            </div>
            <figcaption>选择编号，查看对应部位说明</figcaption>
          </figure>
          <dl className="sp-structure-index">{structures.map((item, index) => <div key={item.id} id={`part-${item.id}`} data-active={activePart === item.id}>
            <dt><button type="button" aria-pressed={activePart === item.id} onClick={() => setActivePart(item.id)}><span className="sp-index">{String(index + 1).padStart(2, "0")}</span>{index === 0 ? "机器人本体" : item.id === "vision" ? "视觉头部" : item.title}</button></dt>
            <dd>{item.description}</dd>
          </div>)}</dl>
        </div>
        <div className="sp-development-interface"><h3><span className="sp-index">07</span>{development.title}</h3><p>{development.description}</p></div>
      </div>
    </section>
  );
}

export function RealTasksSection() {
  const media = getStandardMediaByUsage("productRealTasks");
  if (!media.length) return null;
  return (
    <section className="sp-section sp-real-tasks" id="real-tasks" aria-labelledby="real-tasks-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="任务记录" intro="四段已公开的任务记录，展示双臂操作、物体抓取、织物处理与工业设备操作。点击查看过程。" id="real-tasks-title" dark />
        <div className="sp-real-tasks__grid">{media.map(item => <figure key={item.id}>
          <StandardMediaPlayer media={item} />
          <figcaption><div><h3>{item.titleZh}</h3><span>{item.durationLabel}</span></div><p>{item.descriptionZh}</p></figcaption>
        </figure>)}</div>
      </div>
    </section>
  );
}

// Task 019.6's four-row presentation is superseded by the owner's Task 019.7.
export function SpecificationsSection() {
  return <StandardPerformance />;
}

function QaItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <article className="sp-question" data-open={open}>
      <div className="sp-question__title"><span className="sp-index">{String(index + 1).padStart(2, "0")}</span><h3 id={id + "-title"}>{item.question}</h3></div>
      <p className="sp-question__summary">{item.answer}</p>
      <button type="button" className="sp-text-link" aria-expanded={open} aria-controls={id + "-panel"} onClick={() => setOpen(value => !value)}>
        {open ? "收起完整说明" : "展开完整说明"}{open ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
      </button>
      <div className="sp-question__full" id={id + "-panel"} role="region" aria-labelledby={id + "-title"} hidden={!open}>
        {item.fullExplanation.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
      </div>
    </article>
  );
}

export function StandardQaSection() {
  const items = selectStandardContent(standardQa);
  return (
    <section className="sp-section sp-qa" id="questions" aria-labelledby="questions-title">
      <div className="page-shell sp-qa__layout">
        <Heading title="设计背后的六个问题" intro="从形态选择到使用方式，了解产品设计的出发点。" id="questions-title" />
        <div>{items.map((item, index) => <QaItem key={item.id} item={item} index={index} />)}</div>
      </div>
    </section>
  );
}

export function StandardProductSections() {
  return <><ProductOverviewSection /><ModularArchitectureSection /><CapabilitySystemSection /><RealTasksSection /><SpecificationsSection /><StandardQaSection /></>;
}
