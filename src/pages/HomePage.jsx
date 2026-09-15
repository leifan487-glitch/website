import { useRef } from "react";
import { HomeMantisIntro } from "../components/HomeMantisIntro.jsx";
import { HomeMotion } from "../components/HomeMotion.jsx";
import { ProductHero } from "../components/ProductHero.jsx";
import { RealWorld } from "../components/RealWorld.jsx";
import { Footer } from "../components/Footer.jsx";
import { HomeApplications, HomeTechnology, HomeNews, HomePartners, HomeContact } from "../components/HomeSections.jsx";
import { HomeOfficialFilm, HomeForms, HomeWhyModular } from "../components/HomeProductStory.jsx";
import "../home.css";

export function HomePage() {
  const mainRef = useRef(null);

  return (
    <><main id="main-content" className="homepage-v2" ref={mainRef}>
      <HomeMotion scopeRef={mainRef} />
      <ProductHero />
      <HomeMantisIntro />
      <HomeOfficialFilm />
      <HomeForms />
      <HomeWhyModular />
      <RealWorld sectionNumber="06" title="真实任务，实际操作" intro="双臂操作、物体抓取与工业设备操作的真实影像。" />
      <HomeTechnology />
      <HomeApplications />
      <HomeNews />
      <HomePartners />
      <HomeContact />
    </main><Footer /></>
  );
}
