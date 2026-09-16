export function HomeMantisIntro() {
  return (
    <section className="home-difference home-story-section" id="mantis" aria-labelledby="home-mantis-title">
      <div className="page-shell">
        <header className="home-story-heading">
          <div>
            <p className="home-story-label">Mantis Standard</p>
            <h2 id="home-mantis-title">一脑多型，<br />真模块化</h2>
          </div>
          <p>双臂移动操作机器人，<br />也可以是适合不同任务的模块组合。</p>
        </header>
        <div className="home-difference__explanations">
          <article>
            <h3>一脑多型</h3>
            <p>同一套智能与软件体系，服务不同机器人形态。</p>
          </article>
          <article>
            <h3>真模块化</h3>
            <p>机器人由可组合模块构成，根据任务组成不同形态。</p>
          </article>
        </div>
        <p className="home-difference__note">模块之间围绕快速组合设计，根据任务重新组织机器人形态。</p>
      </div>
    </section>
  );
}
