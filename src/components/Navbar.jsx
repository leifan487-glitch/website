import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { GlobeSimple } from "@phosphor-icons/react";
import { supportModules } from "../data/supportModules.js";

const navItems = [
  { label: "技术", href: "/technology" },
  { label: "应用", href: "/applications" },
  { label: "关于蓝虫", href: "/about" },
];

const supportItems = [
  supportModules.documents,
  supportModules.videos,
];

export function Navbar({ theme = "dark", homeHref = "#top" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [productView, setProductView] = useState("standard");
  const [scrolled, setScrolled] = useState(false);
  const productNavRef = useRef(null);
  const productTriggerRef = useRef(null);
  const supportNavRef = useRef(null);
  const supportTriggerRef = useRef(null);
  const languageNavRef = useRef(null);
  const languageTriggerRef = useRef(null);
  const pointerIntentRef = useRef(false);
  const supportPointerIntentRef = useRef(false);
  const openedByHoverRef = useRef(false);
  const supportOpenedByHoverRef = useRef(false);
  const suppressFocusOpenRef = useRef(false);
  const suppressSupportFocusOpenRef = useRef(false);
  const hoverCloseTimerRef = useRef(null);
  const supportHoverCloseTimerRef = useRef(null);
  const location = useLocation();
  const solidSurface = scrolled || menuOpen || productOpen || supportOpen || languageOpen;
  const usePositiveLogo = theme === "light" || solidSurface;
  const productActive = location.pathname.startsWith("/products");
  const supportActive = location.pathname.startsWith("/support");

  useEffect(() => {
    let frame = 0;

    function updateScrollState() {
      frame = 0;
      setScrolled(window.scrollY > 32);
    }

    function requestScrollUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    }

    updateScrollState();
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    return () => {
      window.removeEventListener("scroll", requestScrollUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProductOpen(false);
    setSupportOpen(false);
    setLanguageOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!productOpen && !supportOpen && !languageOpen) return undefined;

    function closeOnOutsidePointer(event) {
      if (productOpen && !productNavRef.current?.contains(event.target)) setProductOpen(false);
      if (supportOpen && !supportNavRef.current?.contains(event.target)) setSupportOpen(false);
      if (languageOpen && !languageNavRef.current?.contains(event.target)) setLanguageOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      if (supportOpen) {
        setSupportOpen(false);
        suppressSupportFocusOpenRef.current = true;
        supportTriggerRef.current?.focus();
        if (document.activeElement === supportTriggerRef.current) {
          suppressSupportFocusOpenRef.current = false;
        }
      } else if (productOpen) {
        setProductOpen(false);
        suppressFocusOpenRef.current = true;
        productTriggerRef.current?.focus();
        if (document.activeElement === productTriggerRef.current) {
          suppressFocusOpenRef.current = false;
        }
      } else if (languageOpen) {
        setLanguageOpen(false);
        languageTriggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [productOpen, supportOpen, languageOpen]);

  useEffect(() => () => {
    if (hoverCloseTimerRef.current) window.clearTimeout(hoverCloseTimerRef.current);
    if (supportHoverCloseTimerRef.current) window.clearTimeout(supportHoverCloseTimerRef.current);
  }, []);

  function cancelHoverClose() {
    if (!hoverCloseTimerRef.current) return;
    window.clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = null;
  }

  function scheduleHoverClose() {
    cancelHoverClose();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      if (!productNavRef.current?.contains(document.activeElement)) {
        setProductOpen(false);
      }
    }, 280);
  }

  function cancelSupportHoverClose() {
    if (!supportHoverCloseTimerRef.current) return;
    window.clearTimeout(supportHoverCloseTimerRef.current);
    supportHoverCloseTimerRef.current = null;
  }

  function scheduleSupportHoverClose() {
    cancelSupportHoverClose();
    supportHoverCloseTimerRef.current = window.setTimeout(() => {
      supportHoverCloseTimerRef.current = null;
      if (!supportNavRef.current?.contains(document.activeElement)) {
        setSupportOpen(false);
      }
    }, 280);
  }

  function closeProductNav() {
    cancelHoverClose();
    cancelSupportHoverClose();
    setProductOpen(false);
    setSupportOpen(false);
    setLanguageOpen(false);
    setMenuOpen(false);
    setProductView("standard");
  }

  return (
    <header
      className="navbar"
      data-open={menuOpen}
      data-theme={theme}
      data-solid={solidSurface}
    >
      <Link className="navbar__brand" to={homeHref} aria-label="蓝虫具身首页">
        <img
          src={
            usePositiveLogo
              ? "/assets/brand-logo-a01623.png"
              : "/assets/brand-logo-reverse-a01621.png"
          }
          alt="蓝虫具身"
          width="1600"
          height="413"
          loading="eager"
          decoding="async"
        />
      </Link>

      <button
        className="navbar__menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => {
          setMenuOpen((open) => !open);
          setProductOpen(false);
          setSupportOpen(false);
        }}
      >
        {menuOpen ? "关闭" : "菜单"}
      </button>

      <nav
        className="navbar__links"
        id="primary-navigation"
        aria-label="主导航"
      >
        <div
          className="navbar__product"
          data-open={productOpen}
          ref={productNavRef}
          onMouseEnter={() => {
            cancelHoverClose();
            openedByHoverRef.current = true;
            setSupportOpen(false);
            setLanguageOpen(false);
            setProductOpen(true);
          }}
          onMouseLeave={() => {
            openedByHoverRef.current = false;
            scheduleHoverClose();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setProductOpen(false);
            }
          }}
        >
          <button
            className={`navbar__product-trigger${productActive ? " is-active" : ""}`}
            type="button"
            aria-expanded={productOpen}
            aria-haspopup="true"
            aria-controls="product-navigation"
            ref={productTriggerRef}
            onPointerDown={() => {
              pointerIntentRef.current = true;
            }}
            onFocus={() => {
              if (suppressFocusOpenRef.current) {
                suppressFocusOpenRef.current = false;
                return;
              }
              if (!pointerIntentRef.current) {
                setSupportOpen(false);
                setLanguageOpen(false);
                setProductOpen(true);
              }
            }}
            onClick={(event) => {
              pointerIntentRef.current = false;
              if (event.detail === 0 || openedByHoverRef.current) {
                openedByHoverRef.current = false;
                setSupportOpen(false);
                setProductOpen(true);
                return;
              }
              setProductOpen((open) => {
                if (!open) setSupportOpen(false);
                if (!open) setLanguageOpen(false);
                return !open;
              });
            }}
          >
            <span className="navbar__label">产品</span>
            <span className="navbar__product-caret" aria-hidden="true">⌄</span>
          </button>

          <div
            className="navbar__product-menu"
            id="product-navigation"
            aria-label="产品导航"
            onMouseEnter={cancelHoverClose}
            onMouseLeave={scheduleHoverClose}
          >
            <div className="navbar__product-menu-inner">
              <div className="navbar__product-rail" role="tablist" aria-label="产品状态">
                <button
                  type="button"
                  role="tab"
                  id="product-tab-standard"
                  aria-controls="product-panel"
                  aria-selected={productView === "standard"}
                  className={productView === "standard" ? "is-active" : undefined}
                  onClick={() => setProductView("standard")}
                  onMouseEnter={() => setProductView("standard")}
                >
                  Standard
                </button>
                <button
                  type="button"
                  role="tab"
                  id="product-tab-upcoming"
                  aria-controls="product-panel"
                  aria-selected={productView === "upcoming"}
                  className={productView === "upcoming" ? "is-active" : undefined}
                  onClick={() => setProductView("upcoming")}
                  onMouseEnter={() => setProductView("upcoming")}
                >
                  敬请期待
                </button>
              </div>

              <div
                className="navbar__product-stage"
                id="product-panel"
                role="tabpanel"
                aria-labelledby={`product-tab-${productView}`}
              >
                {productView === "standard" ? (
                  <Link
                    className="navbar__product-card"
                    to="/products/mantis-standard"
                    onClick={closeProductNav}
                    aria-label="Mantis Standard"
                  >
                    <span className="navbar__product-visual" aria-hidden="true">
                      <img
                        src="/assets/nav-standard-a01781.webp"
                        alt=""
                        width="349"
                        height="760"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="navbar__product-copy">
                      <span className="navbar__product-kicker">MANTIS</span>
                      <strong>Standard</strong>
                      <span>机器人 + 效率工具</span>
                    </span>
                    <span className="navbar__product-arrow" aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <div className="navbar__upcoming-panel">
                    <span className="navbar__product-kicker">UPCOMING</span>
                    <strong>敬请期待</strong>
                    <p>更多产品信息将于后续发布</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) => isActive ? "is-active" : undefined}
            onClick={closeProductNav}
          >
            <span className="navbar__label">{item.label}</span>
          </NavLink>
        ))}

        <div
          className="navbar__support"
          data-open={supportOpen}
          ref={supportNavRef}
          onMouseEnter={() => {
            cancelSupportHoverClose();
            supportOpenedByHoverRef.current = true;
            setProductOpen(false);
            setLanguageOpen(false);
            setSupportOpen(true);
          }}
          onMouseLeave={() => {
            supportOpenedByHoverRef.current = false;
            scheduleSupportHoverClose();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setSupportOpen(false);
            }
          }}
        >
          <button
            className={`navbar__support-trigger${supportActive ? " is-active" : ""}`}
            type="button"
            aria-expanded={supportOpen}
            aria-haspopup="true"
            aria-controls="support-navigation"
            ref={supportTriggerRef}
            onPointerDown={() => {
              supportPointerIntentRef.current = true;
            }}
            onFocus={() => {
              if (suppressSupportFocusOpenRef.current) {
                suppressSupportFocusOpenRef.current = false;
                return;
              }
              if (!supportPointerIntentRef.current) {
                setProductOpen(false);
                setLanguageOpen(false);
                setSupportOpen(true);
              }
            }}
            onClick={(event) => {
              supportPointerIntentRef.current = false;
              if (event.detail === 0 || supportOpenedByHoverRef.current) {
                supportOpenedByHoverRef.current = false;
                setProductOpen(false);
                setSupportOpen(true);
                return;
              }
              setSupportOpen((open) => {
                if (!open) setProductOpen(false);
                if (!open) setLanguageOpen(false);
                return !open;
              });
            }}
          >
            <span className="navbar__label">支持</span>
            <span className="navbar__support-caret" aria-hidden="true">⌄</span>
          </button>

          <div
            className="navbar__support-menu"
            id="support-navigation"
            aria-label="支持导航"
            onMouseEnter={cancelSupportHoverClose}
            onMouseLeave={scheduleSupportHoverClose}
          >
            {supportItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.href}
                className={({ isActive }) => isActive ? "is-active" : undefined}
                onClick={closeProductNav}
              >
                <span>{item.title}</span>
                <span aria-hidden="true">→</span>
              </NavLink>
            ))}
          </div>
        </div>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) => isActive ? "is-active" : undefined}
            onClick={closeProductNav}
          >
            <span className="navbar__label">{item.label}</span>
          </NavLink>
        ))}

        <div
          className="navbar__language"
          data-open={languageOpen}
          ref={languageNavRef}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setLanguageOpen(false);
          }}
        >
          <button
            className="navbar__language-trigger"
            type="button"
            aria-label="选择语言，当前为中文"
            aria-expanded={languageOpen}
            aria-haspopup="menu"
            aria-controls="language-navigation"
            ref={languageTriggerRef}
            onClick={() => {
              setProductOpen(false);
              setSupportOpen(false);
              setLanguageOpen((open) => !open);
            }}
          >
            <GlobeSimple size={21} weight="regular" aria-hidden="true" />
            <span>中文</span>
          </button>
          <div className="navbar__language-menu" id="language-navigation" role="menu" aria-label="选择网站语言">
            <button type="button" role="menuitem" disabled>
              <span>English</span>
              <small>筹备中</small>
            </button>
            <button type="button" role="menuitem" disabled>
              <span>日本語</span>
              <small>筹备中</small>
            </button>
          </div>
        </div>

        <NavLink
          to="/inquiry"
          className={({ isActive }) => `navbar__inquiry-link${isActive ? " is-active" : ""}`}
          onClick={closeProductNav}
        >
          <span className="navbar__label">采购/合作</span>
        </NavLink>
      </nav>
    </header>
  );
}
