import { Link } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { InternalStatus } from "./InternalStatus.jsx";

export function ProductPageHeader() {
  return (
    <section
      className="product-page-header"
      id="product-top"
      aria-labelledby="product-page-title"
    >
      <Navbar theme="light" homeHref="/" />

      <div className="product-page-header__content page-shell">
        <div className="product-page-header__identity">
          <p>PRODUCTS / MANTIS STANDARD</p>
          <h1 id="product-page-title">
            <span>MANTIS</span>
            <span>STANDARD</span>
          </h1>
        </div>

        <div className="product-page-header__context">
          <InternalStatus as="p" status="TODO">Standard 产品定位待确认</InternalStatus>
          <Link className="text-link" to="/">
            返回首页
          </Link>
        </div>
      </div>
    </section>
  );
}
