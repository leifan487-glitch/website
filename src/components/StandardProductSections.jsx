import { useId, useState } from "react";
import { ArrowUpRight, Minus, Plus } from "@phosphor-icons/react";
import { EditorialHeading } from "./EditorialHeading.jsx";
import { StandardMediaPlayer } from "./StandardMediaPlayer.jsx";
import { officialProductFilm } from "../data/standard/officialFilm.js";
import { getStandardMediaByUsage, selectStandardContent, standardPublicSpecs, standardSpecGroups, standardQa } from "../data/standard/index.js";
import { standardForms, standardModularValues, standardHardware, standardDevelopmentPaths } from "../data/standard/story.js";

function Heading({ title, intro, id, dark = false }) {
  return <EditorialHeading className="sp-heading" title={title} intro={intro} titleId={id} tone={dark ? "dark" : "light"} />;
}

export function ProductOverviewSection() {
  return (
    <section className="sp-section sp-overview" id="overview" aria-labelledby="overview-title" data-standard-reveal>
      <div className="page-shell sp-overview__layout">
        <figure><img src="/assets/nav-standard-a01781.webp" alt="Mantis Standard 完整机器人形态" width="349" height="760" loading="lazy" decoding="async" /></figure>
        <div>
          <Heading title="什么是 Mantis Standard" id="overview-title" />
          <p className="sp-lead">Mantis Standard 是一个模块化机器人平台。机器人可根据任务需求组合不同形态，并围绕统一的软件与智能体系进行开发和使用。</p>
          <p>从机械臂、轮式底盘到双臂与完整形态，按任务需要组合配置。</p>
          <a className="sp-text-link" href={officialProductFilm.src} target="_blank" rel="noopener noreferrer" aria-label="观看官方产品影片（新窗口）">观看官方产品影片<ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

export function ModularArchitectureSection() {
  return (
    <section className="sp-section sp-modular" id="modular" aria-labelledby="modular-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="一脑多型，真模块化" intro="统一的软件体系，可组合的机器人结构。" id="modular-title" dark />
        <div className="sp-modular__columns">
          <article>
            <h3>一脑多型</h3>
            <p className="sp-lead">同一套智能与软件体系，<br />服务不同机器人形态。</p>
            <p>形态随任务改变，开发仍围绕统一的软件体系展开。从仿真、控制接口到数据与模型，连接不同形态的开发与使用。</p>
            <p>这里的“一脑”指软件与智能体系；具体主控和开发支持根据配置与方案确定。</p>
          </article>
          <article>
            <h3>真模块化</h3>
            <p className="sp-lead">从可组合模块出发，<br />构成任务需要的形态。</p>
            <p>本体、双臂、轮式底盘、升降结构、视觉模块与末端执行器，围绕快速组合设计。模块可根据任务进行重新组合。</p>
            <p>机器人形态与模块选择围绕实际需要确定，不以完整整机作为每一项任务的唯一形式。</p>
          </article>
        </div>
        <div className="sp-module-relations" id="six-forms">
          <h3>模块与形态</h3>
          <dl>{[
            { title: "操作单元", ids: ["arm", "dual"] },
            { title: "移动与操作", ids: ["chassis", "engineering"] },
            { title: "巡检与完整形态", ids: ["inspection", "complete"] },
          ].map(group => <div key={group.title}><dt>{group.title}</dt><dd>{group.ids.map(id => <p key={id}>{standardForms.find(form => form.id === id).paragraphs[0]}</p>)}</dd></div>)}</dl>
          <p className="sp-note" id="why-modular">{standardModularValues[2].description}</p>
          <p className="sp-note">影片展示的是具体任务例子；实际使用需结合任务条件、配置与开发方案。</p>
        </div>
      </div>
    </section>
  );
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

export function DevelopmentSection() {
  return (
    <section className="sp-section sp-development" id="development" aria-labelledby="development-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="开发 Mantis Standard" intro="仿真、控制、数据与模型、操作验证，按配置与开发方案选用。" id="development-title" />
        <ol className="sp-development__list">{standardDevelopmentPaths.map((item, index) => <li key={item.id}>
          <div><span className="sp-index">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3></div>
          <ul aria-label={item.title + "相关工具"}>{item.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
          <p>{item.description}</p>
        </li>)}</ol>
        <p className="sp-note">开发工具与流程按实际配置、软硬件环境及开发方案选择，不表示所有设备均默认配备。</p>
      </div>
    </section>
  );
}

const specGroupLabels = { "Robot Body": "机器人本体", Mobility: "移动系统", "Dual Arm": "双臂系统", "Lift / Workspace": "升降与工作空间", "Compute / Interface": "计算与感知", "Development / Connectivity": "开发与连接" };

export function SpecificationsSection() {
  const specs = selectStandardContent(standardPublicSpecs, { publicMode: true });
  const groups = standardSpecGroups.map(group => ({ group, items: specs.filter(item => item.group === group) })).filter(group => group.items.length);
  return (
    <section className="sp-section sp-specs" id="specifications" aria-labelledby="specs-title">
      <div className="page-shell">
        <Heading title="核心参数" intro="按本体、移动、双臂、升降、计算与接口分组。配置相关项目以实际方案为准。" id="specs-title" />
        <div className="sp-specs__grid">{groups.map(({group, items}) => <article key={group}>
          <h3>{specGroupLabels[group]}</h3><dl>{items.map(item => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}{item.unit ? <span> {item.unit}</span> : null}</dd></div>)}</dl>
        </article>)}</div>
      </div>
    </section>
  );
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
  return <><ProductOverviewSection /><ModularArchitectureSection /><CapabilitySystemSection /><RealTasksSection /><DevelopmentSection /><SpecificationsSection /><StandardQaSection /></>;
}
