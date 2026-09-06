export const standardSource = "Standard产品介绍-初稿0901 - 副本(1).pptx";

export const standardProduct = {
  id: "mantis-standard",
  name: "Mantis Standard",
  positioning: "消费级",
  slogan: "一脑多形，真模块化",
  source: `${standardSource} · Slide 4`,
  contentStatus: "VERIFIED",
  publicApproved: true,
  approval: { copy: true, media: false, claim: true },
  notes: "Task 014 负责人确认：消费级；一脑多形，真模块化。",
};

export const standardModularArchitecture = [
  ["robot-body", "机器人主体", "Robot body", "机器人主体与功能模块采用可组合的产品结构。"],
  ["dual-arms", "双臂", "Dual arms", "双臂构型面向操作与协同任务。"],
  ["mobile-base", "轮式底盘", "Mobile base", "轮式底盘承担移动，并与升降机构形成工作空间。"],
  ["lift", "升降机构", "Lift", "升降机构用于扩展垂直方向的任务范围。"],
  ["quick-connect", "手部快换", "Quick-change", "手部快换接口连接不同效率工具。"],
  ["tools", "专用效率工具", "Efficiency tools", "按任务选择专用工具，形成机器人 + 效率工具的组合。"],
].map(([id, title, label, description]) => ({
  id,
  title,
  label,
  description,
  source: `${standardSource} · Slide 4 / Task 014 confirmation`,
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
  notes: "公开描述产品结构，不延伸为配置或性能承诺。",
}));
