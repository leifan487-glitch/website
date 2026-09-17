import { EditorialHeading } from "./EditorialHeading.jsx";
import { standardPerformance as parameters } from "../data/standard/performance.js";
import "./standard-performance.css";

const visuals = {
  front: [619, 1500, "Mantis Standard 整机正面视图"],
  side: [616, 1500, "Mantis Standard 整机侧面视图"],
  head: [1000, 684, "Mantis Standard 视觉头部与上身"],
  base: [1000, 371, "全向移动底盘正面视图"],
  battery: [1000, 895, "底盘与电池模块俯视图"],
  arm: [1000, 512, "机械臂与末端执行器"],
};

function ProductImage({ name }) {
  const [width, height, alt] = visuals[name];
  return <img className={`performance-image performance-image--${name}`} src={`/media/mantis-standard/performance-v1/${name}.webp`} width={width} height={height} alt={alt} loading="lazy" decoding="async" />;
}

function Metric({ name, prominent = false }) {
  const { label, value, unit } = parameters[name];
  return <div className={`performance-metric${prominent ? " performance-metric--large" : ""}`} data-parameter={name}>
    <dt>{label}</dt><dd><span>{value}</span>{unit && <small>{unit}</small>}</dd>
  </div>;
}

export function StandardPerformance() {
  return <section className="sp-section sp-performance" id="specifications" aria-labelledby="specs-title">
    <div className="page-shell">
      <EditorialHeading className="sp-heading" title="核心参数" intro="Mantis Standard · 产品性能" titleId="specs-title" />
      <div className="performance-board">
        <article className="performance-card performance-card--body" aria-labelledby="performance-body-title">
          <h3 id="performance-body-title">整机尺寸</h3>
          <dl className="performance-dimensions"><Metric name="length" /><Metric name="width" /><Metric name="height" /></dl>
          <div className="performance-views"><ProductImage name="front" /><ProductImage name="side" /></div>
          <dl className="performance-body-stats"><Metric name="liftRange" prominent /><Metric name="dof" prominent /></dl>
        </article>
        <article className="performance-card performance-card--latency" aria-label="控制延迟">
          <dl><Metric name="latency" prominent /></dl>
          <ProductImage name="head" />
        </article>
        <article className="performance-card performance-card--motion" aria-labelledby="performance-motion-title">
          <h3 id="performance-motion-title">运动与底盘</h3>
          <ProductImage name="base" />
          <dl className="performance-motion-stats"><Metric name="speed" /><Metric name="liftSpeed" /><Metric name="base" /></dl>
        </article>
        <article className="performance-card performance-card--endurance" aria-label="整机续航">
          <dl><Metric name="endurance" prominent /></dl>
          <ProductImage name="battery" />
        </article>
        <article className="performance-card performance-card--arm" aria-labelledby="performance-arm-title">
          <h3 id="performance-arm-title">手臂参数</h3>
          <dl className="performance-arm-stats"><Metric name="upperArm" /><Metric name="forearm" /><Metric name="reach" /></dl>
          <div className="performance-arm-detail">
            <ProductImage name="arm" />
            <dl className="performance-payload"><Metric name="payload" prominent /></dl>
          </div>
        </article>
      </div>
      <p className="sp-note">具体配置请咨询销售</p>
    </div>
  </section>;
}
