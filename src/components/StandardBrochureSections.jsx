import { Fragment, useId, useState } from "react";
import { ArrowRight, Check, Minus } from "@phosphor-icons/react";
import { standardForms } from "../data/standard/story.js";
import { officialProductFilm } from "../data/standard/officialFilm.js";
import { standardConfigurations } from "../data/standard/brochureConfigurations.js";
import "./standard-brochure.css";

function ChoiceBar({ items, active, onChange, label, prefix }) {
  const onKeyDown = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    if (event.key === "ArrowLeft") next = (index + items.length - 1) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    if (next === undefined) return;
    event.preventDefault(); onChange(items[next].id);
    event.currentTarget.parentElement.children[next].focus();
  };
  return <div className="brochure-choices" role="tablist" aria-label={label}>
    {items.map((item, index) => <button key={item.id} type="button" role="tab" id={`${prefix}-tab-${item.id}`} aria-selected={active === item.id} aria-controls={`${prefix}-panel`} tabIndex={active === item.id ? 0 : -1} onClick={() => onChange(item.id)} onKeyDown={event => onKeyDown(event, index)}>{item.name}</button>)}
  </div>;
}

export function BrochureOverview() {
  return <div className="page-shell brochure-intro">
    <h2 id="overview-title">模块化平台</h2>
    <div><p className="sp-lead">Mantis Standard「小白」是一个模块化机器人平台。</p><p>同一个大脑，可以适配多种形态。模块间通过快装接口实现机械及电气连接，从机械臂、轮式底盘到双臂与整机，按任务需要组合。</p><a className="sp-text-link" href={officialProductFilm.src} target="_blank" rel="noopener noreferrer">观看产品影片<ArrowRight size={18} aria-hidden="true" /></a></div>
  </div>;
}

export function BrochureForms() {
  const [active, setActive] = useState("all");
  const prefix = useId();
  const form = standardForms.find(item => item.id === active);
  const images = {
    arm: ["performance-v1/arm.webp", 1000, 512],
    engineering: ["product-forms-alpha/engineering.webp", 1000, 806],
    chassis: ["performance-v1/base.webp", 1000, 371],
    dual: ["product-forms-alpha/dual.webp", 818, 1200],
    inspection: ["product-forms-alpha/inspection.webp", 632, 1200],
    complete: ["performance-v1/front.webp", 619, 1500],
  };
  const choices = [{ id: "all", name: "全部形态" }, ...standardForms.map(f => ({ id: f.id, name: f.name }))];
  return <div className="page-shell brochure-forms">
    <header className="brochure-section-heading"><h2 id="modular-title">一脑多型，真模块化</h2><p>移动、操作与感知，<br />在同一平台上组合。</p></header>
    <div id="six-forms"><ChoiceBar items={choices} active={active} onChange={setActive} label="选择机器人形态" prefix={prefix} /></div>
    <div className="brochure-showcase" id={`${prefix}-panel`} role="tabpanel" aria-labelledby={`${prefix}-tab-${active}`} tabIndex={0} data-form-selected={active}>
      <figure key={active} className={form ? "brochure-showcase__single" : "brochure-showcase__array"}>
        <img src={form ? `/media/mantis-standard/${images[active][0]}` : "/assets/hero-standard-series-a01644.webp"} alt={form ? form.name : "Mantis Standard 多种模块化机器人形态"} width={form ? images[active][1] : 2400} height={form ? images[active][2] : 1350} loading="lazy" decoding="async" />
      </figure>
      <div className="brochure-showcase__copy" aria-live="polite"><h3>{form ? form.name : "从模块，到完整形态"}</h3><p>{form ? form.paragraphs[0] : "从独立机械臂到移动操作整机，让结构适配任务，而不是让任务适应一种固定形态。"}</p><a href="#configurations">查看配置差异<ArrowRight size={20} aria-hidden="true" /></a></div>
    </div>
    <div className="brochure-principles" id="why-modular"><p><strong>按需组合</strong>从当前任务需要的模块出发。</p><p><strong>模块复用</strong>让已有模块参与不同任务。</p><p><strong>开发延续</strong>围绕统一的软件与智能体系展开。</p></div>
  </div>;
}

function ConfigValue({ value }) {
  if (value === true) return <span className="brochure-check"><Check size={18} weight="bold" aria-hidden="true" /><span className="brochure-sr">支持或配备</span></span>;
  if (value === false) return <span className="brochure-no"><Minus size={16} aria-hidden="true" /><span className="brochure-sr">不支持或未配备</span></span>;
  return <span className="brochure-value">{String(value).split(/(、| \/ )/).map((part, index) => /^(、| \/ )$/.test(part) ? <Fragment key={index}>{part}</Fragment> : <span className="brochure-value__part" key={index}>{part}</span>)}</span>;
}

export function ConfigurationExplorer() {
  const [active, setActive] = useState("arm");
  const [version, setVersion] = useState(0);
  const [differences, setDifferences] = useState(false);
  const prefix = useId();
  const family = standardConfigurations.find(item => item.id === active);
  const rows = family.rows.filter(row => !differences || new Set(row.values).size > 1);
  return <section className="sp-section brochure-config" id="configurations" aria-labelledby="configurations-title">
    <div className="page-shell">
      <header className="brochure-section-heading"><h2 id="configurations-title">找到适合任务的配置</h2><p>先选模块，再看差异。<br />每一项能力，都对应到具体版本。</p></header>
      <ChoiceBar items={standardConfigurations} active={active} onChange={id => { setActive(id); setVersion(0); }} label="选择配置类别" prefix={prefix} />
      <div role="tabpanel" id={`${prefix}-panel`} aria-labelledby={`${prefix}-tab-${active}`} tabIndex={0}>
        <div className="brochure-config__intro">
          <div><h3>{family.name}配置</h3><p>{family.description}</p><span>图片为形态示意，不代表各版本的全部配备。</span></div>
          <img key={active} src={family.image} alt={family.imageAlt} width="1000" height="684" loading="lazy" decoding="async" />
        </div>
        <div className="brochure-config__tools">
          <label className="brochure-version">当前版本<select value={version} onChange={event => setVersion(Number(event.target.value))}>{family.versions.map((name, index) => <option value={index} key={name}>{name}</option>)}</select></label>
          <label className="brochure-difference"><input type="checkbox" checked={differences} onChange={event => setDifferences(event.target.checked)} />仅看版本差异</label>
          <span className="brochure-legend"><Check size={15} aria-hidden="true" />支持 / 配备 <Minus size={15} aria-hidden="true" />不支持 / 未配备</span>
        </div>
        <table className="brochure-table" style={{ "--config-columns": family.versions.length }}>
          <caption className="brochure-sr">{family.name}各版本参数与质保对比{differences ? "，仅列差异项" : ""}</caption>
          <thead><tr><th scope="col">配置项目</th>{family.versions.map((name, index) => <th key={name} scope="col" data-selected={version === index}>{name}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={index} data-selected={version === index}><ConfigValue value={value} /></td>)}</tr>)}</tbody>
        </table>
        <p className="brochure-config__note">以上为所选模块 / 整机版本的配置。整机性能介绍与独立模块采用不同口径；质保期限中的“专项服务”保留资料原表述，具体服务内容请咨询销售。</p>
      </div>
    </div>
  </section>;
}
