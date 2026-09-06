import { contactCategories } from "../data/company.js";
import { PageHero } from "../components/PageHero.jsx";
import { Footer } from "../components/Footer.jsx";
import { InternalStatus } from "../components/InternalStatus.jsx";

export function ContactPage() {
  return (
    <>
      <main id="main-content">
        <PageHero eyebrow="CONTACT / BLUE WORM" title="Contact" intro="业务、合作、媒体与招聘的统一入口。" />
        <section className="contact-layout page-shell">
          <div className="contact-types">
            {contactCategories.map((item, index) => (
              <article key={item.name}>
                <span>0{index + 1}</span>
                <h2>{item.name}</h2>
                <InternalStatus as="p" status={item.contentStatus}>{item.detail}</InternalStatus>
              </article>
            ))}
          </div>
          <form className="contact-form" onSubmit={(event) => event.preventDefault()} aria-label="联系表单内部 V0">
            <label>姓名<input name="name" type="text" autoComplete="name" /></label>
            <label>公司 / 机构<input name="company" type="text" autoComplete="organization" /></label>
            <label>邮箱或电话<input name="contact" type="text" autoComplete="email" /></label>
            <label>留言<textarea name="message" rows="5" /></label>
            <button type="button" disabled aria-describedby="contact-submit-reason">提交功能待接入</button>
            <InternalStatus as="p" id="contact-submit-reason" status="TODO">表单未接后台，不会提交数据</InternalStatus>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
