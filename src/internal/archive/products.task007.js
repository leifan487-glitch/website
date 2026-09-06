export const products = [
  {
    id: "standard",
    name: "Mantis Standard",
    eyebrow: "MANTIS / STANDARD",
    route: "/products/mantis-standard",
    mediaMode: "series-array",
    desktopAsset: "/assets/hero-standard-series-a01644.webp",
    mobileAsset: "/assets/hero-standard-series-a01644-mobile.webp",
    assetId: "A01644",
    alt: "Mantis Standard 多个产品构型的系列合体渲染",
    contentStatus: "SOURCE",
    positioning: "Standard 产品定位待确认",
  },
  {
    id: "pro",
    name: "Mantis Pro",
    eyebrow: "MANTIS / PRO",
    route: "/products/mantis-pro",
    mediaMode: "single-product",
    desktopAsset: "/assets/hero-pro-p00001.webp",
    mobileAsset: "/assets/hero-pro-p00002-mobile.webp",
    assetId: "P00001 / P00002",
    alt: "Mantis Pro 完整整机渲染",
    contentStatus: "SOURCE",
    positioning: "Pro 产品定位待确认",
  },
];

export const pendingProducts = [
  {
    id: "ultra",
    name: "Mantis Ultra",
    visible: false,
    contentStatus: "TODO",
    note: "素材目录中存在名称，但正式产品体系关系尚未确认，因此 V0 不公开展示。",
  },
];
