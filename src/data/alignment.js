import { homeTechnologyPlatforms } from "./home.js";
import { potentialApplications } from "./applications.js";
import { selectCompanyContent } from "./company/visibility.js";

// Task 018.4: approved concepts explained for these pages, not new performance claims.
const platformDetails = {
  silkworm: { purpose: "把机器人本体、模块结构与开发接口组织起来。", description: "从本体、控制、感知到运动开发，为不同机器人形态提供系统组织方式。开发围绕 ROS 2、SDK 与仿真工具展开，具体支持根据配置与方案确定。" },
  quantum: { purpose: "连接远程操作与真实任务数据采集。", description: "通过视觉、听觉、语音、力反馈与控制建立遥操作链路，让操作者参与机器人任务，并连接操作与数据采集。", note: "4K 与 <10ms 沿用已公开的遥操作口径，不代表所有网络条件下的端到端互联网延迟；实际使用根据配置与环境确定。" },
  wormhole: { purpose: "为 BW Brain 智能体提供基础模型支撑。", description: "虫洞是蓝虫的具身基础模型平台，为 BW Brain 智能体提供基础模型支撑。LeRobot、π0.5、ACT、SmolVLA 等属于外部开发生态，不是蓝虫自研模型；支持范围根据配置与开发方案确定。", concepts: ["VLA", "模型训练"] },
  honeycomb: { purpose: "围绕机器人数据与模型，组织采集、训练和推理工作流。", description: "面向开展机器人数据与模型工作的开发人员，蜂巢连接机器人、数据和模型流程。“云打工”与“数据交易”属于已公开的平台方向，不在此承诺服务上线范围或交易条件。" },
};
export const alignedPlatforms = selectCompanyContent(homeTechnologyPlatforms, {publicMode:true}).map(item => ({...item, ...platformDetails[item.id]}));

const scenarioDetails = {
  research: {description:"围绕机器人控制、数据采集与任务验证开展科研实验。", keywords:["数据采集","控制实验","任务验证"], source:"已批准高校科研匿名项目 / Standard 开发路径"},
  commercial: {description:"围绕饮品制作、物体取放与导览交互，探索服务流程中的机器人任务。", keywords:["饮品制作","物体取放","导览交互"], source:"已批准咖啡服务 / 展厅导览匿名项目"},
  home: {description:"从织物处理与家居设备操作出发，观察机器人如何参与日常操作。", keywords:["织物处理","家居设备操作"], source:"SV035 / SV037 批准任务记录"},
  warehouse: {description:"面向物料移动与取放，探索移动和操作相结合的任务方式。", keywords:["物料移动","物体取放","移动操作"], source:"已批准仓储物流方向 / Standard 移动与操作能力；非部署案例"},
  manufacturing: {description:"围绕工业设备操作与产线转运，研究机器人参与生产环节的方式。", keywords:["设备操作","产线转运","物品处理"], source:"SV054 / 已批准 PCB 产线匿名项目"},
  special: {description:"围绕煤炭筛选等专项场景，探索任务流程与机器人操作方式。", keywords:["煤炭筛选","专项任务测试"], source:"已批准煤炭行业匿名项目；不宣称防爆或全天候能力"},
};
export const alignedScenarios = selectCompanyContent(potentialApplications, {publicMode:true}).map(item => ({...item,...scenarioDetails[item.id]}));
