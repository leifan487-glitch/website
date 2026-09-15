import { homeForms } from "../home.js";
import { standardModularArchitecture } from "./product.js";
import { standardDevelopment } from "./development.js";
import { selectStandardContent } from "./visibility.js";

// Task 018.3: editorial projection of approved records; not a configuration matrix.
const formDetails = {
  arm: ["以机械臂为操作单元，面向抓取与物体取放任务。", "宣传片展示独立机械臂形态，可围绕这一操作单元开展任务开发。"],
  engineering: ["将机械臂与轮式底盘组合，把操作范围延伸到移动任务。", "宣传片中的纸袋抓取展示了机械臂与底盘组合后的任务形式。"],
  chassis: ["以轮式底盘承担移动任务，也作为其他形态的移动基础。", "宣传片展示独立底盘形态，便于理解移动模块与完整整机的关系。"],
  dual: ["以双臂结构面向抓取、搬运与协同操作。", "宣传片展示桌面双臂形态，可围绕上肢操作组织任务。"],
  inspection: ["组合轮式移动、升降结构与感知单元，面向巡检任务。", "宣传片展示巡检形态；感知设备的具体组合根据配置不同。"],
  complete: ["将双臂、轮式底盘与升降结构组合为完整形态。", "面向需要移动与上肢操作配合的任务，开发和使用围绕统一的软件体系展开。"],
};
export const standardForms = homeForms.map(form => ({ ...form, paragraphs: formDetails[form.id] }));

export const standardModularValues = [
  { title: "按需组合", description: "用户不一定始终需要完整整机。当前任务只需要双臂、巡检或底盘时，可以选择更贴近任务的形态。" },
  { title: "后续扩展", description: "未来需求发生变化时，可以在已有模块基础上进一步扩展，而不把当前形态视为唯一选择。" },
  { title: "模块复用", description: "已有模块可以根据新的任务重新组合，让模块参与不同任务，而不是始终绑定在完整整机中。" },
  { title: "多任务适配", description: "从实际需要的移动、操作与感知出发，组织对应的机器人形态。具体组合以任务与配置方案为依据。" },
];

export const standardHardware = [...selectStandardContent(standardModularArchitecture)];
standardHardware.splice(4, 0, {
  id: "vision", title: "视觉感知", label: "Vision", description: "感知设备参与机器人任务；具体传感器组合根据配置不同。",
});
standardHardware.push({ id: "development", title: "开发接口", label: "Development", description: "通过 ROS 2、SDK 与仿真工具连接二次开发流程，支持范围根据配置与开发方案确定。" });

const development = selectStandardContent(standardDevelopment);
export const standardDevelopmentPaths = [
  ...development.slice(0, 3),
  { id: "operation-validation", title: "操作与验证", tools: ["VR 遥操作", "VLA", "Agent", "MCP"],
    description: "以 VR 遥操作连接数据采集与真实任务验证，通过 Agent 与 MCP 组织任务调用流程。" },
];
