import { useRef } from "react";
import { HomeMantisIntro } from "../components/HomeMantisIntro.jsx";
import { HomeMotion } from "../components/HomeMotion.jsx";
import { ProductHero } from "../components/ProductHero.jsx";
import { RealWorld } from "../components/RealWorld.jsx";
import { Footer } from "../components/Footer.jsx";
import { FinalCta } from "../components/FinalCta.jsx";
import { HomeAbout, HomeApplications } from "../components/HomeSections.jsx";

export function HomePage() {
  const mainRef = useRef(null);

  return (
    <><main id="main-content" ref={mainRef}>
      <HomeMotion scopeRef={mainRef} />
      <ProductHero />
      <HomeMantisIntro />
      <RealWorld sectionNumber="03" />
      <HomeApplications />
      <HomeAbout />
      <FinalCta />
    </main><Footer /></>
  );
}
