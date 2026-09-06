const productForm = [
  { title: "双臂人形", label: "Dual-arm form" },
  { title: "轮式底盘", label: "Mobile base" },
  { title: "手部快换", label: "Quick-change" },
  { title: "专用效率工具", label: "Task tools" },
];

export function MantisIntro() {
  return (
    <section className="mantis-intro" id="mantis" aria-labelledby="mantis-title">
      <div className="mantis-intro__inner page-shell">
        <header className="mantis-intro__header">
          <p>Mantis Standard</p>
          <h2 id="mantis-title">机器人 + 效率工具</h2>
        </header>

        <p className="mantis-intro__definition">
          以双臂机器人、轮式底盘、升降机构和手部快换，连接不同任务所需的专用工具。
        </p>

        <ul className="mantis-intro__list" aria-label="Mantis 产品构成">
          {productForm.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
