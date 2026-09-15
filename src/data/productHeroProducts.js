export const productHeroProducts = [
  {
    id: "standard",
    enabled: true,
    availability: "active",
    contentStatus: "VERIFIED",
    theme: "light",
    mediaMode: "series-array",
    visualMode: "product-composition",
    name: "MANTIS",
    variant: "STANDARD",
    positioning: "消费级",
    heroDefinition: "一脑多形，真模块化",
    valueWords: ["More Useful", "More Options", "More Value"],
    approval: { copy: true, media: false, claim: true },
    cta: {
      label: "了解 Mantis Standard",
      href: "/products/mantis-standard",
    },
    poster: {
      desktop: {
        src: "/assets/hero-standard-series-a01644.webp",
        width: 2400,
        height: 1350,
        assetId: "A01644",
      },
      mobile: {
        src: "/assets/hero-standard-series-a01644-mobile.webp",
        width: 1200,
        height: 1200,
        assetId: "A01644",
      },
      compact: {
        src: "/assets/hero-standard-series-a01644-mobile-focus.webp",
        width: 1000,
        height: 1500,
        assetId: "A01644",
      },
      alt: "Mantis Standard 系列合体渲染，呈现多个产品形态与模块",
    },
    mediaLayout: {
      desktop: {
        objectFit: "contain",
        objectPosition: "center bottom",
        scale: 1,
        translateY: "0px",
      },
      mobile: {
        objectFit: "contain",
        objectPosition: "center bottom",
        scale: 1,
      },
      compact: {
        objectFit: "contain",
        objectPosition: "center top",
        scale: 1,
      },
    },
  },
];
