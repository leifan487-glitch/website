import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "技术", href: "/technology" },
  { label: "应用", href: "/applications" },
  { label: "关于蓝虫", href: "/about" },
];

export function Navbar({ theme = "dark", homeHref = "#top" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [productView, setProductView] = useState("standard");
  const [scrolled, setScrolled] = useState(false);
  const productNavRef = useRef(null);
  const productTriggerRef = useRef(null);
  const pointerIntentRef = useRef(false);
  const openedByHoverRef = useRef(false);
  const suppressFocusOpenRef = useRef(false);
  const hoverCloseTimerRef = useRef(null);
  const location = useLocation();
  const solidSurface = scrolled || menuOpen || productOpen;
  const usePositiveLogo = theme === "light" || solidSurface;
  const productActive = location.pathname.startsWith("/products");

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
  }, [location.pathname]);

  useEffect(() => {
    if (!productOpen) return undefined;

    function closeOnOutsidePointer(event) {
      if (!productNavRef.current?.contains(event.target)) setProductOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      setProductOpen(false);
      suppressFocusOpenRef.current = true;
      productTriggerRef.current?.focus();
      if (document.activeElement === productTriggerRef.current) {
        suppressFocusOpenRef.current = false;
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [productOpen]);

  useEffect(() => () => {
    if (hoverCloseTimerRef.current) window.clearTimeout(hoverCloseTimerRef.current);
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

  function closeProductNav() {
    cancelHoverClose();
    setProductOpen(false);
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
              if (!pointerIntentRef.current) setProductOpen(true);
            }}
            onClick={(event) => {
              pointerIntentRef.current = false;
              if (event.detail === 0 || openedByHoverRef.current) {
                openedByHoverRef.current = false;
                setProductOpen(true);
                return;
              }
              setProductOpen((open) => !open);
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

        <NavLink
          to="/support/videos"
          className={({ isActive }) => isActive ? "is-active" : undefined}
          onClick={closeProductNav}
        >
          <span className="navbar__label">视频中心</span>
        </NavLink>

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

        <NavLink
          to="/inquiry"
          className={({ isActive }) => isActive ? "is-active" : undefined}
          onClick={closeProductNav}
        >
          <span className="navbar__label">联系我们</span>
        </NavLink>
      </nav>
    </header>
  );
}
