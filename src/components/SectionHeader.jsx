export function SectionHeader({ index, title, intro, light = false }) {
  return (
    <header className="section-title page-shell">
      <p className={`section-index${light ? " section-index--light" : ""}`}>{index}</p>
      <h2>{title}</h2>
      {intro ? <p>{intro}</p> : null}
    </header>
  );
}
