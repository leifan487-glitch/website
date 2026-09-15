const productForm = [
  { title: "双臂人形", label: "Dual-arm form" },
  { title: "轮式底盘", label: "Mobile base" },
  { title: "手部快换", label: "Quick-change" },
  { title: "升降机构", label: "Lift" },
];

export function MantisIntro() {
  return (
    <section className="mantis-intro" id="mantis" aria-labelledby="mantis-title">
      <div className="mantis-intro__inner page-shell">
        <header className="mantis-intro__header">
          <p>Mantis Standard</p>
          <h2 id="mantis-title">双臂移动操作机器人</h2>
        </header>

        <p className="mantis-intro__definition">
          双臂、轮式底盘、升降机构与手部快换，构成 Mantis Standard 的模块化本体。
        </p>

        <ul className="mantis-intro__list" aria-label="Mantis Standard 产品构成">
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
