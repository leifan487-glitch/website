import { useCallback, useEffect, useRef, useState } from "react";

const productSections = [
  { id: "product-top", label: "产品" },
  { id: "overview", label: "产品概览" },
  { id: "modular", label: "模块与形态" },
  { id: "capability-system", label: "产品结构" },
  { id: "real-tasks", label: "任务记录" },
  { id: "specifications", label: "核心参数" },
  { id: "questions", label: "六个问题" },
];

const smoothstep = (value) => value * value * (3 - (2 * value));

export function ProductSectionRail() {
  const listRef = useRef(null);
  const linkRefs = useRef([]);
  const pointerFrameRef = useRef(0);
  const scrollFrameRef = useRef(0);
  const pointerYRef = useRef(0);
  const [activeId, setActiveId] = useState(productSections[0].id);

  const updatePointerEffect = useCallback(() => {
    pointerFrameRef.current = 0;
    const pointerY = pointerYRef.current;

    linkRefs.current.forEach((link) => {
      if (!link) return;
      const rect = link.getBoundingClientRect();
      const distance = Math.abs(pointerY - (rect.top + (rect.height / 2)));
      const proximity = Math.max(0, 1 - (distance / 92));
      link.style.setProperty("--rail-effect", smoothstep(proximity).toFixed(4));
    });
  }, []);

  const handlePointerMove = useCallback((event) => {
    pointerYRef.current = event.clientY;
    if (!pointerFrameRef.current) {
      pointerFrameRef.current = requestAnimationFrame(updatePointerEffect);
    }
  }, [updatePointerEffect]);

  const handlePointerLeave = useCallback(() => {
    if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = 0;
    linkRefs.current.forEach((link) => link?.style.setProperty("--rail-effect", "0"));
  }, []);

  useEffect(() => {
    const availableSections = productSections
      .map((item) => ({ ...item, element: document.getElementById(item.id) }))
      .filter((item) => item.element);

    const updateActiveSection = () => {
      scrollFrameRef.current = 0;
      const probeY = window.innerHeight * 0.42;
      let closest = availableSections[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      availableSections.forEach((item) => {
        const rect = item.element.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          closest = item;
          closestDistance = 0;
          return;
        }

        if (closestDistance === 0) return;
        const distance = Math.min(Math.abs(rect.top - probeY), Math.abs(rect.bottom - probeY));
        if (distance < closestDistance) {
          closest = item;
          closestDistance = distance;
        }
      });

      if (closest) setActiveId(closest.id);
    };

    const requestActiveUpdate = () => {
      if (!scrollFrameRef.current) {
        scrollFrameRef.current = requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", requestActiveUpdate, { passive: true });
    window.addEventListener("resize", requestActiveUpdate);

    return () => {
      window.removeEventListener("scroll", requestActiveUpdate);
      window.removeEventListener("resize", requestActiveUpdate);
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    };
  }, []);

  return (
    <nav className="product-section-rail" aria-label="Mantis Standard page sections">
      <ol ref={listRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
        {productSections.map((item, index) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                ref={(element) => { linkRefs.current[index] = element; }}
                className={active ? "is-active" : undefined}
                href={`#${item.id}`}
                aria-label={`${String(index + 1).padStart(2, "0")} · ${item.label}`}
                aria-current={active ? "location" : undefined}
                onClick={() => setActiveId(item.id)}
                title={item.label}
              >
                <span className="product-section-rail__marker" aria-hidden="true" />
                <span className="product-section-rail__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="product-section-rail__label">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
