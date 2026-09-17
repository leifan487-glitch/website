const editorialTitles = { silkworm: "本体、模块与开发接口", quantum: "遥操作与数据采集", "bw-brain": "智能体（Agent）层", wormhole: "具身基础模型", honeycomb: "采集、训练与推理工作流" };

export function TechnologyExplorer({ platforms }) {
  return <div className="aligned-platforms page-shell">
    {platforms.map(platform => <section key={platform.id} id={platform.id} className="aligned-platform" data-motion-section aria-labelledby={platform.id + "-title"}>
      <header data-motion-copy><h2 id={platform.id + "-title"}>{platform.nameZh}<span>{platform.name}</span></h2><p>{platform.roleZh}</p></header>
      <div data-motion-copy><h3>{editorialTitles[platform.id] || platform.purpose}</h3><p>{platform.description}</p>
        {platform.concepts.length > 0 ? <ul aria-label={platform.nameZh + "相关技术"}>{platform.concepts.map(concept => <li key={concept}>{concept}</li>)}</ul> : null}
        {platform.note ? <p className="aligned-note">{platform.note}</p> : null}
      </div>
    </section>)}
  </div>;
}
