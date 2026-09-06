import { Footer } from "../components/Footer.jsx";
import { InquiryForm } from "../components/InquiryForm.jsx";
import { Navbar } from "../components/Navbar.jsx";

export function InquiryPage() {
  return (
    <>
      <main id="main-content">
        <section className="inquiry-hero" aria-labelledby="inquiry-title">
          <Navbar theme="light" homeHref="/" />
          <div className="inquiry-hero__inner page-shell">
            <div className="inquiry-hero__copy">
              <p>Business inquiry</p>
              <h1 id="inquiry-title"><span>从需求</span><span>开始</span></h1>
            </div>
            <p className="inquiry-hero__intro">提交场景、部署与开发需求，让后续沟通直接从真实任务出发。</p>
            <div className="inquiry-folder" aria-hidden="true">
              <span className="inquiry-folder__sheet inquiry-folder__sheet--back" />
              <span className="inquiry-folder__sheet inquiry-folder__sheet--middle" />
              <div className="inquiry-folder__front">
                <span>BW / 015</span>
                <strong>PROJECT<br />INQUIRY</strong>
                <small>SCENE · SYSTEM · DELIVERY</small>
              </div>
            </div>
          </div>
        </section>

        <section className="inquiry-brief page-shell" aria-labelledby="inquiry-brief-title">
          <aside className="inquiry-brief__context">
            <p>任务简报 / TASK BRIEF</p>
            <h2 id="inquiry-brief-title"><span>把现场、动作</span><span>和目标写具体。</span></h2>
            <p className="inquiry-brief__lead">建议按下面三个部分填写。</p>
            <ol>
              <li><span>01</span><p><strong>任务现场</strong><small>工作地点、空间条件、周边人员与设备</small></p></li>
              <li><span>02</span><p><strong>目标动作</strong><small>要操作什么，以及如何判断任务完成</small></p></li>
              <li><span>03</span><p><strong>合作方式</strong><small>产品咨询、任务验证或联合开发</small></p></li>
            </ol>
          </aside>
          <InquiryForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
