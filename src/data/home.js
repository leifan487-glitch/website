import { companyTechnologyPlatforms } from "./technology.js";
import { verifiedMediaCoverage } from "./news.js";

// Official film frames; provenance: internal/task0182r-form-posters.json. Forms, not SKUs.
export const homeForms = [
  { id: "arm", name: "机械臂形态", description: "以机械臂完成抓取与操作。", image: "/media/mantis-standard/forms/arm.webp", width: 900, height: 720, sourceTimestamp: 24 },
  { id: "engineering", name: "工程形态", description: "将机械臂与底盘组合，用于移动操作。", image: "/media/mantis-standard/forms/engineering.webp", width: 900, height: 720, sourceTimestamp: 41 },
  { id: "chassis", name: "底盘形态", description: "以轮式底盘承载移动任务。", image: "/media/mantis-standard/forms/chassis.webp", width: 900, height: 720, sourceTimestamp: 53 },
  { id: "dual", name: "双臂形态", description: "以双臂组合参与协同操作。", image: "/media/mantis-standard/forms/dual.webp", width: 900, height: 720, sourceTimestamp: 72.5 },
  { id: "inspection", name: "巡检形态", description: "将感知与移动组合，用于巡检。", image: "/media/mantis-standard/forms/inspection.webp", width: 900, height: 720, sourceTimestamp: 79 },
  { id: "complete", name: "完整形态", description: "组合双臂、升降与底盘，参与综合任务。", image: "/media/mantis-standard/forms/complete.webp", width: 900, height: 720, sourceTimestamp: 22 },
];

export const modularBenefits = [
  { title: "按任务组合", description: "根据实际任务选择所需机器人形态。" },
  { title: "随需求扩展", description: "任务变化时，可以继续扩展或重新组合已有模块。" },
  { title: "提高模块利用率", description: "让已有模块参与不同任务，而不是始终绑定在完整整机形态中。" },
];

// Chinese names checked against company introduction PDF p7. No platform claims added.
const platformNames = { silkworm: "春茧", quantum: "量子", wormhole: "虫洞", honeycomb: "蜂巢" };
const platformRoles = { silkworm: "机器人架构", quantum: "遥操作", wormhole: "具身智能模型", honeycomb: "云平台" };
export const homeTechnologyPlatforms = companyTechnologyPlatforms.map((item) => ({
  ...item, nameZh: platformNames[item.id], roleZh: platformRoles[item.id],
}));

// Only an already approved, dated public media report; internal Progress is not news.
export const homeNewsItems = verifiedMediaCoverage
  .filter((item) => item.id === "peoples-daily-whrg-2025")
  .map((item) => ({ ...item, publicationStatus: "published" }));
export const homePartnerItems = [];

export function getPublicHomeNews(items = homeNewsItems) {
  return items.filter((item) => item.contentStatus === "VERIFIED" && item.publicApproved === true
    && item.visibility === "PUBLIC" && item.publicationStatus === "published"
    && item.title && item.date && /^https:\/\//.test(item.href));
}

export function getPublicHomePartners(items = homePartnerItems) {
  return items.filter((item) => item.contentStatus === "VERIFIED" && item.publicApproved === true
    && item.visibility === "PUBLIC" && item.logoApproved === true && item.name
    && typeof item.logo === "string" && item.logo.startsWith("/assets/"));
}
