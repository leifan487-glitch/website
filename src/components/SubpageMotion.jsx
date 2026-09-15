import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function animateFrom(timeline, target, vars, position) {
  if (!target || (Array.isArray(target) && target.length === 0)) return;
  timeline.from(target, {
    ...vars,
    onStart: () => gsap.set(target, { willChange: "transform, opacity, clip-path" }),
    onComplete: () => gsap.set(target, { clearProps: "willChange" }),
  }, position);
}

export function SubpageMotion({ scopeRef, compact = false }) {
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return undefined;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (compact) {
          const distance = window.matchMedia("(min-width: 769px)").matches ? 16 : 8;
          root.querySelectorAll("[data-motion-section]").forEach(section => {
            gsap.from(section.querySelectorAll("[data-motion-copy], [data-motion-item]"), {
              y: distance, autoAlpha: 0, duration: .6, stagger: .05, ease: "expo.out", clearProps: "all",
              scrollTrigger: {trigger: section, start: "top 90%", once: true},
            });
          });
          return;
        }
        const hero = root.querySelector("[data-immersive-hero]");
        if (hero) {
          const opening = gsap.timeline({ defaults: { ease: "expo.out" } });
          animateFrom(opening, hero.querySelector(".navbar"), { autoAlpha: 0, y: -22, duration: 0.72 }, 0);
          animateFrom(opening, gsap.utils.toArray("[data-hero-title] > span", hero), {
            clipPath: "inset(0 0 100% 0)",
            yPercent: 70,
            scaleY: 0.76,
            transformOrigin: "left bottom",
            duration: 1.08,
            stagger: 0.1,
          }, 0.08);
          animateFrom(opening, hero.querySelector("[data-hero-media]"), {
            clipPath: "inset(10% 0 0 0)",
            scale: 1.04,
            duration: 1.35,
          }, 0.14);
          animateFrom(opening, gsap.utils.toArray("[data-hero-lead]", hero), {
            autoAlpha: 0,
            y: 30,
            duration: 0.74,
            stagger: 0.08,
          }, 0.54);
        }

        gsap.utils.toArray("[data-motion-section]", root).forEach((section) => {
          const timeline = gsap.timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: section, start: "top 78%", once: true },
          });
          animateFrom(timeline, section.querySelector("[data-motion-heading]"), {
            clipPath: "inset(0 100% 0 0)",
            xPercent: -12,
            scaleX: 0.88,
            transformOrigin: "left center",
            duration: 1.05,
          }, 0);
          animateFrom(timeline, gsap.utils.toArray("[data-motion-copy]", section), {
            autoAlpha: 0,
            y: 28,
            duration: 0.72,
            stagger: 0.07,
          }, 0.28);
          animateFrom(timeline, gsap.utils.toArray("[data-motion-item]", section), {
            autoAlpha: 0,
            y: 44,
            duration: 0.82,
            stagger: 0.1,
          }, 0.34);
          animateFrom(timeline, gsap.utils.toArray("[data-motion-media]", section), {
            clipPath: "inset(0 0 100% 0)",
            y: 34,
            duration: 1.18,
            stagger: 0.1,
          }, 0.14);
        });

        if (window.matchMedia("(min-width: 769px)").matches) {
          gsap.utils.toArray("[data-parallax]", root).forEach((element) => {
            gsap.fromTo(element, { yPercent: -3 }, {
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: element.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
              },
            });
          });
        }
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll("*"), {
          clearProps: "opacity,visibility,transform,clipPath,willChange",
        });
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const frame = window.requestAnimationFrame(refresh);
    window.addEventListener("load", refresh, { once: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      media.revert();
      context.revert();
    };
  }, [scopeRef, compact]);

  return null;
}
