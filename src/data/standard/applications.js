import { standardSource } from "./product.js";

export const standardApplicationDirections = [
  ["research", "科研测试", "RESEARCH TESTING"],
  ["commercial", "商业服务", "COMMERCIAL SERVICE"],
  ["home", "家庭服务", "HOME SERVICE"],
  ["warehouse", "仓储物流", "WAREHOUSING & LOGISTICS"],
  ["manufacturing", "柔性制造", "FLEXIBLE MANUFACTURING"],
  ["special", "特种行业", "SPECIAL INDUSTRIES"],
].map(([id, title, label], index) => ({
  id,
  index: String(index + 1).padStart(2, "0"),
  title,
  label,
  items: [],
  relatedTools: [],
  description: null,
  source: `${standardSource} · Slide 9 / Task 014 confirmation`,
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
}));
