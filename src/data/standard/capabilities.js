import { standardSource } from "./product.js";

export const standardCapabilities = [
  ["modular-architecture", "模块化架构", "Modular architecture", "一脑多形，通过可组合模块适配不同任务形态。"],
  ["dual-arm-operation", "双臂任务执行", "Dual-arm task execution", "双臂结构面向抓取、搬运与协同操作。"],
  ["wheeled-lift", "轮式移动与升降", "Wheeled mobility & lift", "全向轮式底盘与升降机构共同扩展工作范围。"],
  ["quick-change", "手部快换", "Quick-change", "通过手部接口更换末端执行器。"],
  ["open-development", "开放开发", "Open development", "通过 ROS 2、SDK 与仿真工具连接二次开发流程。"],
  ["data-intelligence", "遥操作、数据与智能", "Teleoperation, data & intelligence", "连接 Quantum、Wormhole 与 Honeycomb，覆盖遥操作、数据和模型工作流。"],
].map(([id, title, label, description]) => ({
  id,
  title,
  label,
  description,
  source: `${standardSource} · Slides 4, 8–9 / Task 014 confirmation`,
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
  notes: "仅公开能力层级，不附加价格、领先性或未批准性能数字。",
}));
