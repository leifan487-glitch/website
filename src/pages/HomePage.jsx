import { useRef } from "react";
import { HomeMotion } from "../components/HomeMotion.jsx";
import { ProductHero } from "../components/ProductHero.jsx";
import { RealWorld } from "../components/RealWorld.jsx";
import { Footer } from "../components/Footer.jsx";
import { HomeTechnology, HomeNews, HomePartners, HomeContact } from "../components/HomeSections.jsx";
import { HomeOfficialFilm, HomeForms, HomeWhyModular } from "../components/HomeProductStory.jsx";
import "../home.css";
import "../home-final.css";

export function HomePage() {
  const mainRef = useRef(null);

  return (
    <><main id="main-content" className="homepage-v2" ref={mainRef}>
      <HomeMotion scopeRef={mainRef} />
      <ProductHero />
      <HomeOfficialFilm />
      <HomeForms />
      <HomeWhyModular />
      <RealWorld title="真实任务" intro="记录抓取、双臂协作与设备操作。" />
      <HomeTechnology />
      <HomePartners />
      <HomeNews />
      <HomeContact />
    </main><Footer /></>
  );
}
