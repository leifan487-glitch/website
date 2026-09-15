import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Minus, Plus } from "@phosphor-icons/react";
import { EditorialHeading } from "./EditorialHeading.jsx";
import { StandardMediaPlayer } from "./StandardMediaPlayer.jsx";
import { businessEmail, businessEmailHref } from "../data/contact.js";
import { officialProductFilm } from "../data/standard/officialFilm.js";
import { documentResources } from "../data/resources/documents.js";
import { isPublicResource } from "../data/resources/visibility.js";
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
          <p>从机械臂、轮式底盘到双臂与完整形态，产品的重点不只是外观变化，而是让机器人配置更贴近实际任务。</p>
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
        <Heading title="一脑多形，真模块化" intro="统一的软件体系，可组合的机器人结构。" id="modular-title" dark />
        <div className="sp-modular__columns">
          <article>
            <h3>一脑多形</h3>
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
      </div>
    </section>
  );
}

export function SixFormsSection() {
  return (
    <section className="sp-section sp-forms" id="six-forms" aria-labelledby="six-forms-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="六种形态，围绕任务组合" intro="同一个 Mantis Standard 的不同组合形态。以下视觉来自官方宣传片，用于说明形态与任务之间的关系。" id="six-forms-title" />
        <div className="sp-forms__grid">
          {standardForms.map(item => <figure key={item.id} data-standard-item>
            <img src={item.image} alt={item.name} width={item.width} height={item.height} loading="lazy" decoding="async" />
            <figcaption><h3>{item.name}</h3>{item.paragraphs.map(text => <p key={text}>{text}</p>)}</figcaption>
          </figure>)}
        </div>
        <p className="sp-note">影片展示的是具体任务例子；实际使用需结合任务条件、配置与开发方案。</p>
      </div>
    </section>
  );
}

export function WhyModularSection() {
  return (
    <section className="sp-section sp-why" id="why-modular" aria-labelledby="why-modular-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="让机器人配置更贴近实际任务" intro="用户不一定始终需要完整整机。模块化让当前使用与后续扩展有了不同的组合选择。" id="why-modular-title" />
        <ol className="sp-why__grid">{standardModularValues.map((item, index) => <li key={item.title}><span className="sp-index">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></li>)}</ol>
      </div>
    </section>
  );
}

export function CapabilitySystemSection() {
  return (
    <section className="sp-section sp-capabilities" id="capability-system" aria-labelledby="capabilities-title" data-standard-reveal>
      <div className="page-shell">
        <Heading title="从本体到接口，看清核心能力" intro="移动、操作、感知与开发，各有对应的结构和接口。具体组合根据配置与任务方案确定。" id="capabilities-title" />
        <div className="sp-capabilities__layout">
          <figure><img src="/assets/nav-standard-a01781.webp" alt="Mantis Standard 本体与双臂、升降和底盘结构" width="349" height="760" loading="lazy" decoding="async" /></figure>
          <dl>{standardHardware.map(item => <div key={item.id}><dt>{item.title}<small>{item.label}</small></dt><dd>{item.description}</dd></div>)}</dl>
        </div>
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
        <Heading title="真实任务，实际操作" intro="四段已公开的任务记录，展示双臂操作、物体抓取、织物处理与工业设备操作。点击查看过程。" id="real-tasks-title" dark />
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
        <Heading title="开发 Mantis Standard" intro="根据配置与开发方案，支持的开发路径包括仿真、控制接口、数据与模型，以及操作验证。" id="development-title" />
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

export function StandardDocumentsSection() {
  const documents = documentResources.filter(item => item.product === "Mantis Standard" && isPublicResource(item));
  return (
    <section className="sp-section sp-documents" id="product-documents" aria-labelledby="documents-title">
      <div className="page-shell">
        <Heading title="资料与开发" intro="安装、使用、交付核对与二次开发，查阅对应的正式文档。" id="documents-title" />
        <ul>{documents.map(item => <li key={item.id}>
          <div><h3>{item.title}</h3><p>{item.description}</p></div>
          <div className="sp-documents__actions">
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={"查看" + item.title + "（新窗口）"}>查看<ArrowUpRight size={18} aria-hidden="true" /></a>
            <a href={item.fileUrl} download aria-label={"下载" + item.title}>下载<ArrowDown size={18} aria-hidden="true" /></a>
          </div>
        </li>)}</ul>
        <Link className="sp-text-link" to="/support/documents">查看全部文档<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function StandardInquirySection() {
  return (
    <section className="sp-section sp-contact" id="product-inquiry" aria-labelledby="contact-title">
      <div className="page-shell sp-contact__layout">
        <div><h2 id="contact-title">采购 / 合作</h2><a href={businessEmailHref}>{businessEmail}</a></div>
        <Link className="sp-button" to="/inquiry">联系商务<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function StandardProductSections() {
  return <><ProductOverviewSection /><ModularArchitectureSection /><SixFormsSection /><WhyModularSection /><CapabilitySystemSection /><RealTasksSection /><DevelopmentSection /><SpecificationsSection /><StandardQaSection /><StandardDocumentsSection /><StandardInquirySection /></>;
}
