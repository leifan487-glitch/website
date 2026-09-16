import { Footer } from "../components/Footer.jsx";
import { InquiryForm } from "../components/InquiryForm.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { businessEmail, businessEmailHref } from "../data/contact.js";
import "../alignment.css";

export function InquiryPage() {
  return <>
    <main id="main-content" className="aligned-page inquiry-aligned">
      <Navbar theme="light" homeHref="/" />
      <section className="aligned-inquiry" aria-labelledby="inquiry-title">
        <header><h1 id="inquiry-title">采购/合作</h1><p>有产品采购、项目合作或其他需求，欢迎通过商务邮箱联系我们。</p><a className="support-email" href={businessEmailHref}>{businessEmail}</a></header>
        <InquiryForm />
      </section>
    </main><Footer />
  </>;
}
