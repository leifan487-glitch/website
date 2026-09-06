import { Footer } from "../components/Footer.jsx";
import { PageHero } from "../components/PageHero.jsx";

function PolicyReviewNotice({ title, eyebrow, intro, heading, body }) {
  return (
    <>
      <main id="main-content">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} />
        <section className="policy-skeleton page-shell">
          <header>
            <h2>{heading}</h2>
            <p>{body}</p>
          </header>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function PrivacyPage() {
  return <PolicyReviewNotice title="隐私政策" eyebrow="LEGAL / PRIVACY" intro="了解网站在商务咨询场景中涉及的信息处理范围。" heading="发布前审核" body="隐私政策将在完成公司审核后于此页面发布。当前在线咨询功能尚未开放。" />;
}

export function TermsPage() {
  return <PolicyReviewNotice title="网站条款" eyebrow="LEGAL / TERMS" intro="了解访问和使用蓝虫具身网站时需要遵循的基本规则。" heading="发布前审核" body="网站条款将在完成公司审核后于此页面发布；正式文本发布前，本页不构成额外承诺。" />;
}
