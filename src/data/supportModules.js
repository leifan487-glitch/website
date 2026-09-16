const buildEnv = import.meta.env ?? {};

export const supportModules = {
  documents: {
    id: "documents",
    index: "01",
    title: "文档中心",
    label: "Documents",
    description: "Mantis Standard 官方文档的统一入口。",
    href: "/support/documents",
    publicVisible: true,
  },
  downloads: {
    id: "downloads",
    index: "02",
    title: "下载中心",
    label: "Downloads",
    description: "下载使用说明、交付清单、安全说明与开发手册。",
    href: "/support/downloads",
    publicVisible: false,
    primaryNavigation: false,
  },
  videos: {
    id: "videos",
    index: "03",
    title: "视频中心",
    label: "Video Center",
    description: "Mantis Standard 产品与任务视频。",
    href: "/support/videos",
    publicVisible: true,
    primaryNavigation: false,
  },
  service: {
    id: "service",
    index: "04",
    title: "售后与服务",
    label: "After-sales",
    description: "产品使用与设备问题的支持入口。",
    href: "/support/service",
    publicVisible: true,
  },
  contact: {
    id: "contact",
    index: "05",
    title: "联系支持",
    label: "Contact support",
    description: "通过官方邮箱联系，说明产品使用问题或合作需求。",
    href: "/support/contact",
    publicVisible: true,
  },
  knowledge: {
    id: "knowledge",
    index: "05",
    title: "知识库",
    label: "Knowledge Base",
    description: "未来承载经确认的使用、开发与故障排查内容。",
    href: "/support/knowledge",
    publicVisible: false,
  },
};

export const publicPreviewEnabled = buildEnv.MODE === "production"
  || buildEnv.VITE_PUBLIC_PREVIEW === "true";

const configuredHiddenModules = new Set(
  (buildEnv.VITE_HIDDEN_SUPPORT_MODULES || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);

function normalizeHiddenModules(hiddenModuleIds) {
  return hiddenModuleIds instanceof Set ? hiddenModuleIds : new Set(hiddenModuleIds || []);
}

export function isSupportModuleVisible(
  moduleId,
  { publicPreview = publicPreviewEnabled, hiddenModuleIds = configuredHiddenModules } = {},
) {
  const module = supportModules[moduleId];
  if (!module) return false;
  if (!publicPreview) return true;
  return module.publicVisible === true && !normalizeHiddenModules(hiddenModuleIds).has(moduleId);
}

export function getVisibleSupportModules(options) {
  return Object.values(supportModules).filter((module) => module.primaryNavigation !== false && isSupportModuleVisible(module.id, options));
}
