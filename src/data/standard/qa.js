export const standardQaSource = "Mantis Standard六大核心问题.docx";

export const standardQa = [
  {
    id: "why-wheeled",
    question: "为什么采用轮式人形形态？",
    answer: "Mantis Standard 面向上肢操作任务。轮式底盘提供全向移动，并与升降机构、双臂结构组合，让机器人能够在室内工作场景中移动和操作。",
  },
  {
    id: "core-value",
    question: "Mantis Standard 的核心价值是什么？",
    answer: "它把机器人本体、轮式底盘、双臂、手部快换和专用效率工具组织为可组合的产品体系，强调 More Useful、More Options 与 More Value。",
  },
  {
    id: "difference",
    question: "Mantis Standard 的产品差异是什么？",
    answer: "核心是“一脑多形，真模块化”。同一机器人架构可连接不同功能模块，模块既能独立承担功能，也能按任务进行组合。",
  },
  {
    id: "modular-benefit",
    question: "模块化设计带来什么？",
    answer: "模块化让产品形态可以围绕任务进行选择和组合，也便于后续维护、更换与扩展。具体可选范围以正式产品资料为准。",
  },
  {
    id: "camera-head",
    question: "为什么采用手持云台相机式头部设计？",
    answer: "这一设计用于形成清晰的视觉识别与产品形象，同时为机器人感知设备提供安装位置。具体传感器组合以实际配置为准。",
  },
  {
    id: "applications",
    question: "Mantis Standard 面向哪些应用方向？",
    answer: "当前公开方向包括科研测试、商业服务、家庭服务、仓储物流、柔性制造与特种行业。方向性表达不代表已完成客户部署。",
  },
].map((item) => ({
  ...item,
  source: `${standardQaSource} / Task 014 public-safe rewrite`,
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
}));
