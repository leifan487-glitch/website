import { Navbar } from "./Navbar.jsx";
import { InternalStatus } from "./InternalStatus.jsx";

export function PageHero({ eyebrow, title, intro, status = "TODO", theme = "light", variant }) {
  const titleScript = /[\u4e00-\u9fff]/.test(title) ? "zh" : "latin";
  const variantClass = variant ? ` page-hero--${variant}` : "";
  return (
    <section className={`page-hero page-hero--${theme}${variantClass}`} data-title-script={titleScript} aria-labelledby="page-title">
      <Navbar theme={theme} homeHref="/" />
      <div className="page-hero__inner page-shell">
        {eyebrow ? <p className="eyebrow eyebrow--dark">{eyebrow}</p> : null}
        <h1 id="page-title">{title}</h1>
        <div className="page-hero__intro">
          <p>{intro}</p>
          <InternalStatus status={status}>正式内容待负责人确认</InternalStatus>
        </div>
      </div>
    </section>
  );
}
