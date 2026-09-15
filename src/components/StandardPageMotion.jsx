import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function StandardPageMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ desktop: "(min-width: 769px)", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
        if (conditions.reduced) return;
        const distance = conditions.desktop ? 24 : 10;
        gsap.from(".standard-product-hero__copy > *", { y: distance, opacity: 0, duration: 0.75, stagger: 0.065, ease: "expo.out", clearProps: "all" });
        gsap.from(".standard-product-hero__visual", { clipPath: "inset(0 0 8% 0)", duration: 1.1, ease: "expo.out", clearProps: "all" });
        root.querySelectorAll("[data-standard-reveal]").forEach(section => {
          gsap.from(section.querySelectorAll(".sp-heading, [data-standard-item]"), {
            y: distance, opacity: 0, duration: 0.7, stagger: 0.055, ease: "expo.out", clearProps: "all",
            scrollTrigger: { trigger: section, start: "top 88%", once: true },
          });
        });
      });
    }, root);
    // Accordion expansion changes the position of later sections, not their content.
    const resize = new ResizeObserver(() => ScrollTrigger.refresh());
    resize.observe(root);
    return () => { resize.disconnect(); media.revert(); context.revert(); };
  }, [scopeRef]);
  return null;
}
