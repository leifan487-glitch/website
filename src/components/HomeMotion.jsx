import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const entranceEase = "expo.out";

function targets(root, selector) {
  return root && selector ? gsap.utils.toArray(selector, root) : [];
}

function addFrom(timeline, items, vars, position) {
  const resolved = Array.isArray(items) ? items.filter(Boolean) : items;
  if (!resolved || resolved.length === 0) return timeline;
  const willChange = vars.clipPath ? "transform, opacity, clip-path" : "transform, opacity";
  return timeline.from(resolved, {
    ...vars,
    onStart: () => gsap.set(resolved, { willChange }),
    onComplete: () => gsap.set(resolved, { clearProps: "willChange" }),
  }, position);
}

function scrollTimeline(trigger, start = "top 80%") {
  return gsap.timeline({
    defaults: { ease: entranceEase },
    scrollTrigger: { trigger, start, once: true },
  });
}

function revealHeader(root, config) {
  const section = root.querySelector(config.section);
  if (!section) return null;
  const title = section.querySelector(config.title);
  const index = section.querySelector(".section-index");
  const support = targets(section, config.support);
  const compact = window.matchMedia("(max-width: 700px)").matches;
  const fromLeft = config.direction !== -1;
  const timeline = scrollTimeline(section, config.start || "top 76%");

  addFrom(timeline, title, {
    xPercent: (fromLeft ? -1 : 1) * (compact ? 11 : 18),
    scaleX: 0.82,
    clipPath: fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
    transformOrigin: fromLeft ? "left center" : "right center",
    duration: compact ? 0.9 : 1.15,
  }, 0);
  addFrom(timeline, index, {
    autoAlpha: 0,
    x: fromLeft ? -28 : 28,
    duration: 0.7,
  }, 0.12);
  addFrom(timeline, support, {
    autoAlpha: 0,
    y: compact ? 24 : 38,
    duration: 0.78,
    stagger: 0.07,
  }, 0.38);
  return timeline;
}

function revealMedia(root, config) {
  const trigger = root.querySelector(config.trigger);
  const frame = root.querySelector(config.frame);
  const media = root.querySelector(config.media);
  if (!trigger || !frame) return;
  const timeline = scrollTimeline(trigger, config.start || "top 84%");
  addFrom(timeline, frame, {
    clipPath: config.direction === -1 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
    y: 42,
    duration: 1.2,
  }, 0);
  addFrom(timeline, media, {
    "--motion-media-scale": 1.08,
    duration: 1.35,
  }, 0.06);
}

function createOpening(root) {
  const hero = root.querySelector(".product-hero");
  if (!hero) return;
  const opening = gsap.timeline({ defaults: { ease: entranceEase } });
  addFrom(opening, hero.querySelector(".navbar"), { autoAlpha: 0, y: -24, duration: 0.78 }, 0.04);
  addFrom(opening, hero.querySelector(".product-hero__name"), {
    clipPath: "inset(0 0 100% 0)", yPercent: 72, scaleY: 0.72,
    transformOrigin: "left bottom", duration: 1.16,
  }, 0.08);
  addFrom(opening, hero.querySelector(".product-hero__variant"), {
    clipPath: "inset(0 100% 0 0)", xPercent: -24, scaleX: 0.72,
    transformOrigin: "left center", duration: 0.94,
  }, 0.24);
  addFrom(opening, hero.querySelector(".product-hero__media"), {
    clipPath: "inset(16% 0 0 0)", yPercent: 4, scaleY: 0.96,
    transformOrigin: "center bottom", duration: 1.42,
  }, 0.2);
  addFrom(opening, hero.querySelector(".product-hero__positioning"), {
    autoAlpha: 0, y: 38, duration: 0.82,
  }, 0.58);
  addFrom(opening, hero.querySelector(".product-hero__cta"), {
    autoAlpha: 0, y: 24, duration: 0.72,
  }, 0.68);
  addFrom(opening, targets(hero, ".product-hero__values li"), {
    autoAlpha: 0, y: 20, duration: 0.62, stagger: 0.08,
  }, 0.74);
}

function createHomepageMotion(root) {
  createOpening(root);

  const mantisSection = root.querySelector(".home-mantis-intro");
  if (mantisSection) {
    const mantis = scrollTimeline(mantisSection, "top 72%");
    addFrom(mantis, targets(mantisSection, ".home-mantis-intro__copy h2 span"), {
      clipPath: "inset(0 100% 0 0)",
      xPercent: -16,
      scaleX: 0.82,
      transformOrigin: "left center",
      duration: 1.06,
      stagger: 0.08,
    }, 0);
    addFrom(mantis, targets(mantisSection, ".home-mantis-intro__identity, .home-mantis-intro__definition, .home-mantis-intro__status, .home-mantis-intro__link"), {
      autoAlpha: 0, y: 28, duration: 0.72, stagger: 0.07,
    }, 0.24);
    addFrom(mantis, mantisSection.querySelector(".home-mantis-intro__visual"), {
      clipPath: "inset(0 0 100% 0)", y: 46, duration: 1.28,
    }, 0.16);
    addFrom(mantis, targets(mantisSection, ".home-mantis-intro__keywords li"), {
      autoAlpha: 0, x: 24, duration: 0.7, stagger: 0.08,
    }, 0.5);
    addFrom(mantis, targets(mantisSection, ".home-mantis-intro__drawing span"), {
      scaleX: 0, transformOrigin: "left center", duration: 1.1, stagger: 0.1,
    }, 0.34);
  }

  revealHeader(root, {
    section: ".real-world",
    title: ".real-world__header h2",
    support: ".real-world__intro, .real-world__header > .internal-status",
    direction: -1,
  });
  revealMedia(root, {
    trigger: ".real-world__stage",
    frame: ".real-world__frame",
    media: ".real-world__frame video",
  });

  revealHeader(root, {
    section: ".home-applications__masthead",
    title: "h2",
    support: ".home-section-name, :scope > p:last-child",
    direction: -1,
  });
  const gallery = root.querySelector(".home-application-gallery");
  if (gallery) {
    const panels = targets(gallery, ":scope > li");
    const timeline = scrollTimeline(gallery, "top 82%");
    addFrom(timeline, panels, {
      autoAlpha: 0, y: 72, duration: 0.92, stagger: 0.12,
    }, 0);
    panels.forEach((panel, index) => {
      addFrom(timeline, panel.querySelector(".home-application-gallery__media"), {
        clipPath: index % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
        duration: 1.05,
      }, 0.08 + index * 0.12);
    });
  }

  const about = root.querySelector(".home-about");
  if (about) {
    const timeline = scrollTimeline(about, "top 74%");
    addFrom(timeline, targets(about, ".home-about__copy h2 span"), {
      clipPath: "inset(0 0 100% 0)", yPercent: 52, scaleY: 0.82,
      transformOrigin: "left bottom", duration: 1.04, stagger: 0.1,
    }, 0);
    addFrom(timeline, targets(about, ".home-about__identity, .home-about__copy > p, .home-about__copy > .home-section-link"), {
      autoAlpha: 0, y: 26, duration: 0.72, stagger: 0.07,
    }, 0.32);
    addFrom(timeline, about.querySelector(".home-about__signal"), {
      autoAlpha: 0, scale: 0.82, rotate: -8, duration: 1.16,
    }, 0.18);
  }

  const finalCta = root.querySelector(".final-cta");
  if (finalCta) {
    const timeline = scrollTimeline(finalCta, "top 78%");
    addFrom(timeline, targets(finalCta, "h2 span, h2 strong"), {
      clipPath: "inset(0 100% 0 0)", xPercent: -15, scaleX: 0.82,
      transformOrigin: "left center", duration: 1.08, stagger: 0.08,
    }, 0);
    addFrom(timeline, finalCta.querySelector(".final-cta__media"), {
      clipPath: "inset(100% 0 0 0)", y: 46, duration: 1.22,
    }, 0.14);
    addFrom(timeline, targets(finalCta, ".final-cta__links a"), {
      autoAlpha: 0, y: 30, duration: 0.72, stagger: 0.1,
    }, 0.5);
  }

  if (window.matchMedia("(min-width: 769px)").matches) {
    targets(root, ".home-mantis-intro__visual img, .real-world__frame video, .home-application-gallery__media img, .final-cta__media img")
      .forEach((item) => gsap.fromTo(item, {
        "--motion-media-y": "-3%",
      }, {
        "--motion-media-y": "3%",
        ease: "none",
        scrollTrigger: {
          trigger: item.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      }));
  }
}

export function HomeMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        document.documentElement.classList.add("has-premium-motion");
        createHomepageMotion(root);
        return () => document.documentElement.classList.remove("has-premium-motion");
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        document.documentElement.classList.remove("has-premium-motion");
        gsap.set(root.querySelectorAll("*"), {
          clearProps: "opacity,visibility,transform,clipPath,willChange",
        });
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const frame = window.requestAnimationFrame(refresh);
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      media.revert();
      context.revert();
      document.documentElement.classList.remove("has-premium-motion");
    };
  }, [scopeRef]);
  return null;
}
