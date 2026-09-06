import { Link } from "react-router-dom";
import { InternalStatus } from "./InternalStatus.jsx";

const groups = () => [
  {
    label: "产品",
    links: [["Mantis Standard", "/products/mantis-standard"]],
  },
  {
    label: "公司",
    links: [["关于蓝虫", "/about"], ["动态", "/news"], ["商务询盘", "/inquiry"]],
  },
  {
    label: "支持",
    links: [["视频中心", "/support/videos"]],
  },
  {
    label: "信息",
    links: [["隐私政策", "/policy/privacy"], ["网站条款", "/policy/terms"]],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top page-shell">
        <div className="site-footer__identity">
          <Link className="site-footer__brand" to="/" aria-label="返回蓝虫具身首页">
            <img src="/assets/brand-logo-reverse-a01621.png" alt="蓝虫具身" width="1600" height="413" loading="lazy" decoding="async" />
          </Link>
          <p>机器人 + 效率工具</p>
        </div>
        <nav className="site-footer__links" aria-label="页脚导航">
          {groups().map((group) => (
            <div className="site-footer__group" key={group.label}>
              <p>{group.label}</p>
              {group.links.map(([label, route]) => <Link key={route} to={route}>{label}</Link>)}
            </div>
          ))}
        </nav>
      </div>
      <div className="site-footer__bottom page-shell">
        <p>西安蓝虫具身智能科技有限公司</p>
        <p>Xi'an Blue Worm EAI Technology Co., Ltd.</p>
        <InternalStatus status="TODO">官方社交账号与版权信息待确认</InternalStatus>
      </div>
    </footer>
  );
}
