import { withCompanySource } from "./company/source.js";

export const companyIdentity = withCompanySource({ id: "company-identity", legalNameZh: "西安蓝虫具身智能科技有限公司", legalNameEn: "Xi'an Blue Worm EAI Technology Co., Ltd.", displayName: "蓝虫具身", claimRisk: "MEDIUM", notes: "Task 014 负责人确认。" }, "22 / 36", { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } });

export const companyMission = withCompanySource({ id: "company-mission", text: "创造一个人机共融新世界", claimRisk: "MEDIUM", notes: "Task 014 负责人确认。" }, "22 / 36", { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } });

export const leadership = [withCompanySource({ id: "leadership-cong-yao", name: "丛尧", role: "CEO / CTO", education: "西安交通大学硕士", bio: null, portrait: null, portraitApproved: false, claimRisk: "HIGH", notes: "姓名、职位、学历已确认；肖像未批准，公开版使用文字记录。" }, 21, { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } })];

export const intellectualPropertyCopy = {
  id: "ip-neutral-copy",
  text: "围绕机器人相关技术持续开展知识产权布局",
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
  source: "Task 014 confirmed public wording",
};

export const companyFallback = {
  displayName: "蓝虫具身",
  title: "Research & Engineering",
  summary: "围绕机器人与工程实践开展研发。",
  image: "/assets/engineering-a00706.webp",
  imageAssetId: "A00706",
  imageAlt: "室内研发环境中的多台机器人移动底盘",
  imageWidth: 1800,
  imageHeight: 1200,
};

export const company = {
  brand: "Blue Worm",
  displayName: "蓝虫具身",
  positioning: "公司正式定位待确认",
  mission: "创造一个人机共融新世界",
  contentStatus: "VERIFIED",
  publicApproved: true,
  image: "/assets/engineering-a00706.webp",
  imageAssetId: "A00706",
  imageAlt: "室内研发环境中的多台机器人移动底盘",
  imageWidth: 1800,
  imageHeight: 1200,
  engineeringImage: "/assets/engineering-a00706.webp",
  engineeringAssetId: "A00706",
  engineeringAlt: "室内环境中的多台机器人移动底盘",
};

export const contactCategories = ["Business", "Cooperation", "Media", "Careers"].map((name) => ({
  name,
  contentStatus: "TODO",
  detail: "官方联系方式待确认",
}));
