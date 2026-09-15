import { Link } from "react-router-dom";
import { InternalStatus } from "./InternalStatus.jsx";
import { getVisibleSupportModules } from "../data/supportModules.js";
import { businessEmail, businessEmailHref } from "../data/contact.js";

const groups = () => [
  {
    label: "产品",
    links: [["Mantis Standard", "/products/mantis-standard"]],
  },
  {
    label: "公司",
    links: [["关于蓝虫", "/about"], ["动态", "/news"], ["采购/合作", "/inquiry"]],
  },
  {
    label: "服务与支持",
    links: getVisibleSupportModules({ publicPreview: true }).map((item) => [item.title, item.href]),
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
          <p>双臂移动操作机器人</p>
          <a className="site-footer__email" href={businessEmailHref}>{businessEmail}</a>
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
