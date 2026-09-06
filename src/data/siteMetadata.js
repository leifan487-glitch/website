import { supportModules } from "./supportModules.js";

export const siteMetadata = {
  "/": { title: "蓝虫具身 | Blue Worm", description: "蓝虫具身与 Mantis Standard：机器人 + 效率工具。" },
  "/products/mantis-standard": { title: "Mantis Standard | Blue Worm", description: "了解 Mantis Standard 的模块化架构、核心能力、开发平台与应用方向。" },
  "/technology": { title: "技术体系 | Blue Worm", description: "了解 Silkworm、Quantum、Wormhole 与 Honeycomb 四个技术平台。" },
  "/applications": { title: "应用方向 | Blue Worm", description: "了解蓝虫具身在科研、商业服务、家庭、物流、制造与特种行业的应用方向。" },
  "/about": { title: "关于蓝虫具身 | Blue Worm", description: "了解西安蓝虫具身智能科技有限公司、公司使命与团队信息。" },
  "/news": { title: "公司进展 | Blue Worm", description: "蓝虫具身赛事与媒体公开记录。" },
  "/support/documents": { title: "文档中心 | Blue Worm", description: "Mantis Standard 公开文档入口。", supportModule: "documents" },
  "/support/downloads": { title: "下载中心 | Blue Worm", description: "Mantis Standard 公开下载资源入口。", supportModule: "downloads" },
  "/support/videos": { title: "视频中心 | Blue Worm", description: "Mantis Standard 公开视频入口。", supportModule: "videos" },
  "/support/service": { title: "售后服务 | Blue Worm", description: "Mantis Standard 产品使用与设备问题支持入口。", supportModule: "service" },
  "/support/knowledge": { title: "知识库 | Blue Worm", description: "Mantis Standard 产品使用与开发知识入口。", supportModule: "knowledge" },
  "/inquiry": { title: "商务询盘 | Blue Worm", description: "提交 Mantis Standard 产品与应用场景咨询。" },
  "/policy/privacy": { title: "隐私政策 | Blue Worm", description: "蓝虫具身网站隐私政策页面。" },
  "/policy/terms": { title: "网站条款 | Blue Worm", description: "蓝虫具身网站使用条款页面。" },
};

export const notFoundMetadata = {
  title: "页面未找到 | Blue Worm",
  description: "请求的页面不存在。",
};

export function getRouteMetadata(pathname) {
  return siteMetadata[pathname] || notFoundMetadata;
}

export function getSitemapRoutes({ hiddenModuleIds = [] } = {}) {
  const hidden = new Set(hiddenModuleIds);
  return Object.entries(siteMetadata)
    .filter(([, metadata]) => {
      if (!metadata.supportModule) return true;
      return supportModules[metadata.supportModule]?.publicVisible === true
        && !hidden.has(metadata.supportModule);
    })
    .map(([pathname]) => pathname);
}
