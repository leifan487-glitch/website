import { withCompanySource } from "../src/data/company/source.js";

const projectRecord = (record, sourcePage) => withCompanySource(record, sourcePage, {
  claimRisk: "HIGH",
  visibility: "INTERNAL",
  customerNameApproved: false,
  mediaApproved: false,
  resultsApproved: false,
});

export const companyProjects = [
  projectRecord({ id: "coffee", projectType: "Project candidate", customerLabel: "行业头部咖啡机企业", sector: "Commercial service", summary: "机器人咖啡场景的研发与测试记录线索；完成范围、机器人身份和客户公开权限待确认。", media: null, notes: "Internal review only." }, 17),
  projectRecord({ id: "coal", projectType: "Project candidate", customerLabel: "某煤炭企业", sector: "Special industry", summary: "煤炭筛选场景项目线索；效果与商业状态不进入公开页面。", media: null, notes: "保持客户匿名。" }, 13),
  projectRecord({ id: "pcb", projectType: "Project candidate", customerLabel: "某 PCB 产线供应商", sector: "Flexible manufacturing", summary: "PCB 转运场景项目线索；部署状态与结果待确认。", media: null, notes: "保持客户匿名。" }, 13),
  projectRecord({ id: "guide", projectType: "Project candidate", customerLabel: "某科技公司展厅导览", sector: "Commercial service", summary: "导览场景候选，资料涉及后台管理、语音交互与导航等内容；不表述为正式商业部署。", media: null, notes: "Internal review only." }, 18),
  projectRecord({ id: "xidian", projectType: "Research record", customerLabel: "西安电子科技大学", sector: "Research", summary: "高校科研与数据采集相关记录线索；合作范围及公开权限待确认。", media: null, notes: "学校名称公开权限待确认。" }, 13),
  projectRecord({ id: "xjtu", projectType: "Research record", customerLabel: "西安交通大学", sector: "Research", summary: "机器人、灵巧手与论文相关合作线索；成果归属和公开权限待确认。", media: null, notes: "不表述为联合研发成果。" }, "13 / 19"),
];

export const researchCooperation = [
  withCompanySource({ id: "research-xjtu-hand", title: "自研灵巧手", institution: "西安交通大学", summary: "资料第 19 页记录灵巧手研究与 IROS 论文线索；第 19、20 页使用不同型号与结构描述，二者关系待负责人确认。", claimRisk: "HIGH", visibility: "INTERNAL", verification: "NEEDS CONFIRMATION", conflictId: "EV-CONFLICT-001" }, "19–20"),
];

export const conceptVisualRecords = [
  withCompanySource({ id: "concept-applications", label: "Application concept montage", usage: "INTERNAL_REVIEW_ONLY", claimRisk: "HIGH", notes: "不能作为真实部署证据。" }, 14),
  withCompanySource({ id: "concept-factory", label: "Factory concept visual", usage: "INTERNAL_REVIEW_ONLY", claimRisk: "HIGH", notes: "不能作为客户案例或 Real World 素材。" }, 35),
];

export const researchRecords = [
  withCompanySource({ id: "research-dexterous-hand", title: "自研灵巧手", label: "Dexterous hand research candidate", summary: "资料第 20 页记录五指、16 自由度灵巧手；第 19 页另有不同型号与结构描述，二者关系待负责人确认。", claimRisk: "HIGH", verification: "NEEDS CONFIRMATION", conflictId: "EV-CONFLICT-001" }, "19–20"),
  withCompanySource({ id: "research-engineering-context", title: "Research & Engineering", label: "Company-level engineering context", summary: "机器人、遥操作、模型与工程测试构成当前资料中的公司级研发方向。", claimRisk: "MEDIUM" }, "6–11 / 31"),
];
