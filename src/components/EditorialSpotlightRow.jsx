import { useCallback, useEffect, useRef } from "react";

export function EditorialSpotlightRow({ children, tone = "light" }) {
  const rowRef = useRef(null);
  const frameRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const enabledRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateEnabled = () => { enabledRef.current = query.matches; };
    updateEnabled();
    query.addEventListener("change", updateEnabled);

    return () => {
      query.removeEventListener("change", updateEnabled);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const applyPointer = useCallback(() => {
    frameRef.current = 0;
    const row = rowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    row.style.setProperty("--spotlight-x", `${pointerRef.current.x - rect.left}px`);
    row.style.setProperty("--spotlight-y", `${pointerRef.current.y - rect.top}px`);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!enabledRef.current) return;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (!frameRef.current) frameRef.current = requestAnimationFrame(applyPointer);
  }, [applyPointer]);

  return (
    <li
      ref={rowRef}
      className="editorial-spotlight-row"
      data-spotlight-tone={tone}
      onPointerMove={handlePointerMove}
    >
      {children}
    </li>
  );
}
