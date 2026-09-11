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
    description: "产品资料、开发资源与软件工具的发布入口。",
    href: "/support/downloads",
    publicVisible: false,
  },
  videos: {
    id: "videos",
    index: "03",
    title: "视频中心",
    label: "Video Center",
    description: "Mantis Standard 产品与任务视频。",
    href: "/support/videos",
    publicVisible: true,
  },
  service: {
    id: "service",
    index: "04",
    title: "售后服务",
    label: "After-sales",
    description: "产品使用与设备问题的支持入口。",
    href: "/support/service",
    publicVisible: false,
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
  return Object.values(supportModules).filter((module) => isSupportModuleVisible(module.id, options));
}
