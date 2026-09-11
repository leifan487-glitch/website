import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const taskStepsBySourceId = {
  SV035: ["抓取", "移动", "放置"],
  SV037: ["定位", "交互", "完成"],
  SV054: ["接近", "操作", "完成"],
};

export function HomeApplicationGallery({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef([]);
  const firstLayout = useRef(true);

  useLayoutEffect(() => {
    const panels = panelRefs.current.filter(Boolean);
    if (!panels.length) return undefined;

    const media = gsap.matchMedia();
    media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.to(panels, {
        flexGrow: (index) => (index === activeIndex ? 5.4 : 1),
        duration: firstLayout.current ? 0 : 0.86,
        ease: "power4.out",
        onStart: () => gsap.set(panels, { willChange: "flex-grow" }),
        onComplete: () => gsap.set(panels, { clearProps: "willChange" }),
      });
      firstLayout.current = false;
      return () => tween.kill();
    });
    media.add("(max-width: 900px), (prefers-reduced-motion: reduce)", () => {
      gsap.set(panels, { clearProps: "flexGrow,willChange" });
    });

    return () => media.revert();
  }, [activeIndex]);

  function handleKeyDown(index, event) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;

    setActiveIndex(nextIndex);
    panelRefs.current[nextIndex]?.querySelector("button")?.focus();
  }

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % items.length);
  }

  return (
    <div className="home-application-gallery-shell">
      <ol className="home-application-gallery" aria-label="Mantis Standard 应用场景">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const taskSteps = taskStepsBySourceId[item.sourceId] || [];
          return (
            <li
              className={isActive ? "is-active" : undefined}
              key={item.id}
              ref={(element) => { panelRefs.current[index] = element; }}
            >
              <button
                type="button"
                aria-pressed={isActive}
                aria-label={`查看${item.titleZh}`}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(index, event)}
              >
                <span className="home-application-gallery__media">
                  <img
                    src={item.poster}
                    alt={`${item.titleZh}场景记录`}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="home-application-gallery__shade" aria-hidden="true" />
                </span>

                <span className="home-application-gallery__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="home-application-gallery__caption">
                  <span className="home-application-gallery__category">TASK {String(index + 1).padStart(2, "0")} / {item.category}</span>
                  <strong>{item.titleZh}</strong>
                  <small>{item.titleEn}</small>
                  <span className="home-application-gallery__description">{item.descriptionZh}</span>
                  {taskSteps.length ? (
                    <span className="home-application-gallery__process" aria-label={`${item.titleZh}任务过程`}>
                      {taskSteps.map((step, stepIndex) => (
                        <span key={step}>
                          <i aria-hidden="true">{String(stepIndex + 1).padStart(2, "0")}</i>
                          {step}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="home-application-gallery__controls" aria-label="切换任务场景">
        <button type="button" onClick={showPrevious} aria-label="上一个任务场景">←</button>
        <span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        <button type="button" onClick={showNext} aria-label="下一个任务场景">→</button>
      </div>
    </div>
  );
}
