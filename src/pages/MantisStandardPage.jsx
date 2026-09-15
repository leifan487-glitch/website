import { useRef } from "react";
import { ProductPageHeader } from "../components/ProductPageHeader.jsx";
import { Footer } from "../components/Footer.jsx";
import { StandardProductSections } from "../components/StandardProductSections.jsx";
import { ProductSectionRail } from "../components/ProductSectionRail.jsx";
import { StandardPageMotion } from "../components/StandardPageMotion.jsx";
import "../standard-page.css";

export function MantisStandardPage() {
  const mainRef = useRef(null);
  return (
    <><main id="main-content" className="standard-page-v2" ref={mainRef}>
      <StandardPageMotion scopeRef={mainRef} />
      <ProductSectionRail />
      <ProductPageHeader />
      <StandardProductSections />
    </main><Footer /></>
  );
}
