import { withCompanySource } from "./company/source.js";

export const technologySystem = {
  id: "technology-system-v1",
  title: "Blue Worm Technology System",
  summary: "Mantis Standard 机器人本体与 Silkworm、Quantum、Wormhole、Honeycomb 四个平台共同构成蓝虫具身的技术体系。",
  sourceId: "BW-COMPANY-INTRO-036P",
  sourcePage: "7–11",
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
  claimRisk: "MEDIUM",
  evidenceStatus: "PARTIAL",
};

export const companyTechnologyPlatforms = [
  withCompanySource({ id: "silkworm", index: "03", name: "Silkworm", label: "Robot Architecture", summary: "机器人架构平台，连接机器人本体、控制、感知与运动开发。", concepts: ["ROS 2", "SDK", "Isaac Sim", "Genesis"], claimRisk: "MEDIUM" }, "6–7", { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } }),
  withCompanySource({ id: "quantum", index: "04", name: "Quantum", label: "Teleoperation", summary: "遥操作平台，围绕视觉、听觉、语音、力反馈与控制建立远程操作链路。", concepts: ["4K", "<10ms", "视 / 听 / 说 / 力控"], claimRisk: "HIGH" }, "8–9", { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } }),
  withCompanySource({ id: "wormhole", index: "05", name: "Wormhole", label: "Embodied Intelligence Model", summary: "具身智能模型平台，连接数据、模型训练、VLA、Agent 与任务技能。", concepts: ["LeRobot", "VLA", "Agent", "MCP"], claimRisk: "HIGH" }, 10, { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } }),
  withCompanySource({ id: "honeycomb", index: "06", name: "Honeycomb", label: "Cloud Platform", summary: "云平台以“采、训、推”组织数据采集、训练和推理工作流。", concepts: ["采 / 训 / 推", "云打工", "数据交易"], claimRisk: "HIGH" }, 11, { contentStatus: "VERIFIED", publicApproved: true, visibility: "PUBLIC", evidenceStatus: "CONFIRMED", approval: { copy: true, media: false, claim: true } }),
];

export const technologySystemNodes = [
  { id: "mantis", name: "Mantis Standard", label: "Robot body", kind: "body" },
  ...companyTechnologyPlatforms.map(({ id, name, label }) => ({ id, name, label, kind: "platform" })),
];

export const technologyFallback = {
  title: "Technology System",
  summary: "蓝虫具身围绕机器人与工程实践开展研发。",
  image: "/assets/engineering-a00706.webp",
  assetId: "A00706",
  alt: "室内研发环境中的多台机器人移动底盘",
  width: 1800,
  height: 1200,
};

// Locked Home V1 compatibility export. Task 013 does not inject company PPT content into Home.
export const technologyMedia = {
  src: "/assets/hero-standard-a01791.webp",
  assetId: "A01791",
  alt: "Mantis Standard 产品结构渲染",
  width: 2200,
  height: 1238,
  contentStatus: "SOURCE",
};

export const technologyPlatforms = [
  { id: "silkworm", index: "01", name: "Silkworm", contentStatus: "SOURCE", summary: "技术平台正式说明待确认。" },
  { id: "quantum", index: "02", name: "Quantum", contentStatus: "SOURCE", summary: "技术平台正式说明待确认。" },
  { id: "wormhole", index: "03", name: "Wormhole", contentStatus: "SOURCE", summary: "技术平台正式说明待确认。" },
  { id: "honeycomb", index: "04", name: "Honeycomb", contentStatus: "SOURCE", summary: "技术平台正式说明待确认。" },
];
