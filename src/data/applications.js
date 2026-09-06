import { withCompanySource } from "./company/source.js";

export const potentialApplications = [
  ["research", "科研测试", "Research testing"],
  ["commercial", "商业服务", "Commercial service"],
  ["home", "家庭服务", "Home service"],
  ["warehouse", "仓储物流", "Warehousing & logistics"],
  ["manufacturing", "柔性制造", "Flexible manufacturing"],
  ["special", "特种行业", "Special industries"],
].map(([id, name, label]) => withCompanySource(
  { id, name, label, kind: "DIRECTION", claimRisk: "MEDIUM", notes: "方向性表达，不代表实际部署。" },
  14,
  { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } },
));

export const publicProjectRecords = [
  {
    id: "coffee-service",
    title: "咖啡服务项目",
    category: "商业服务",
    summary: "围绕饮品制作与服务流程，记录机器人在操作、取放与服务任务中的应用探索。",
    taskScope: "咖啡服务流程中的机器人任务测试",
    applicationDirection: "Commercial Service / 商业服务",
    sourcePage: "17",
  },
  {
    id: "coal-task",
    title: "煤炭行业任务项目",
    category: "特种行业",
    summary: "围绕煤炭筛选场景，开展机器人任务流程与操作方式的项目探索。",
    taskScope: "煤炭筛选场景任务",
    applicationDirection: "Special Industries / 特种行业",
    sourcePage: "13",
  },
  {
    id: "pcb-line",
    title: "PCB 产线项目",
    category: "柔性制造",
    summary: "围绕 PCB 产线转运场景，记录机器人参与物料移动任务的应用探索。",
    taskScope: "PCB 产线转运任务",
    applicationDirection: "Flexible Manufacturing / 柔性制造",
    sourcePage: "13",
  },
  {
    id: "showroom-guide",
    title: "展厅导览项目",
    category: "商业服务",
    summary: "围绕展厅导览场景，记录语音交互、导航与后台管理相关的任务探索。",
    taskScope: "展厅导览与交互任务",
    applicationDirection: "Commercial Service / 商业服务",
    sourcePage: "18",
  },
  {
    id: "university-research",
    title: "高校科研合作项目",
    category: "科研测试",
    summary: "围绕机器人科研与数据采集，开展面向研究任务的合作记录与应用探索。",
    taskScope: "机器人科研与数据采集",
    applicationDirection: "Research Testing / 科研测试",
    sourcePage: "13",
  },
].map((record) => ({
  ...record,
  customerName: null,
  schoolName: null,
  media: null,
  mediaApproved: false,
  sourceId: "BW-COMPANY-INTRO-036P",
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
  notes: "负责人确认可匿名公开；不表达交付范围、客户身份或结果。",
}));
