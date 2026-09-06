import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";

export function NotFoundPage() {
  return (
    <>
      <main id="main-content" className="not-found">
        <Navbar theme="light" homeHref="/" />
        <div className="page-shell">
          <p>404</p>
          <h1>页面未找到</h1>
          <Link className="text-link" to="/">返回首页</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
