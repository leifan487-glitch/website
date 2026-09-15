export function TechnologyExplorer({ platforms }) {
  return <div className="aligned-platforms page-shell">
    {platforms.map(platform => <section key={platform.id} id={platform.id} className="aligned-platform" data-motion-section aria-labelledby={platform.id + "-title"}>
      <header data-motion-copy><h2 id={platform.id + "-title"}>{platform.nameZh}<span>{platform.name}</span></h2><p>{platform.roleZh}</p></header>
      <div data-motion-copy><h3>{platform.purpose}</h3><p>{platform.description}</p>
        <ul aria-label={platform.nameZh + "相关技术"}>{platform.concepts.map(concept => <li key={concept}>{concept}</li>)}</ul>
        {platform.note ? <p className="aligned-note">{platform.note}</p> : null}
      </div>
    </section>)}
  </div>;
}
