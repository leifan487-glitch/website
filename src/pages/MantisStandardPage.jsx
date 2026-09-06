import { MantisIntro } from "../components/MantisIntro.jsx";
import { MantisProductDetail } from "../components/MantisProductDetail.jsx";
import { ProductPageHeader } from "../components/ProductPageHeader.jsx";
import { Footer } from "../components/Footer.jsx";
import { StandardProductSections } from "../components/StandardProductSections.jsx";
import { ProductSectionRail } from "../components/ProductSectionRail.jsx";

export function MantisStandardPage() {
  return (
    <><main id="main-content">
      <ProductSectionRail />
      <ProductPageHeader />
      <MantisIntro />
      <MantisProductDetail />
      <StandardProductSections />
    </main><Footer /></>
  );
}
