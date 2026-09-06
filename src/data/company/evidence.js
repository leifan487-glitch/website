import { withCompanySource } from "./source.js";

const evidenceRecord = (record, sourcePage) => withCompanySource(record, sourcePage, {
  claimRisk: "HIGH",
  verification: "NEEDS_CONFIRMATION",
  mediaApproved: false,
});

export const dexterousHandNameConflict = withCompanySource({
  id: "EV-CONFLICT-001",
  category: "Research / Naming conflict",
  title: "自研灵巧手型号与代际关系",
  publicLabel: "自研灵巧手",
  conflict: true,
  verification: "NEEDS CONFIRMATION",
  claimRisk: "HIGH",
  visibility: "INTERNAL",
  sourceValues: [
    { sourcePage: 19, name: "FF8D-Hand", description: "第一代、4 指、8 自由度；科研合作与 IROS 论文语境" },
    { sourcePage: 20, name: "FF16D-Hand", description: "自研、5 指、16 自由度语境" },
  ],
  notes: "原 PPT 同时出现两套名称与结构描述，可能是不同代际，也可能是命名口径未统一；负责人确认前不合并、不推断关系。",
}, "19–20", {
  evidenceStatus: "CONFLICT",
});

export const competitionEvidenceQueue = [
  evidenceRecord({ id: "EV-COMP-001", category: "Competition", title: "XBOTMAN 科技创业大赛记录", eventName: "XBOTMAN 科技创业大赛", date: null, organizer: null, result: null, award: null, notes: "成绩、届次、日期和主办方待逐项核验。" }, 24),
  evidenceRecord({ id: "EV-COMP-002", category: "Competition", title: "2025 西安国际创业大赛记录", eventName: "2025 西安国际创业大赛", date: null, organizer: null, result: null, award: null, notes: "成绩、财务相关结果和排名口径不进入网页。" }, 25),
  evidenceRecord({ id: "EV-COMP-003", category: "Competition", title: "珠海灵巧操作挑战赛记录", eventName: "第二届珠海国际灵巧操作挑战赛", date: null, organizer: null, result: null, award: null, notes: "赛道、成绩、日期和媒体权限待核验。" }, 26),
  evidenceRecord({ id: "EV-COMP-004", category: "Competition", title: "世界人形机器人运动会记录", eventName: "世界人形机器人运动会", date: null, organizer: null, result: null, award: null, notes: "项目、成绩、队伍规模与排名口径待核验。" }, "27–29"),
];

export const mediaCoverageQueue = [
  evidenceRecord({ id: "EV-MEDIA-001", category: "Media", title: "电视媒体报道截图记录", outlet: "CCTV-4", date: null, url: null, notes: "当前只有演示文稿截图线索，不构成认证或背书。" }, 23),
  evidenceRecord({ id: "EV-MEDIA-002", category: "Media", title: "网络媒体转载线索", outlet: "人民网 / 新华网等", date: null, url: null, notes: "缺正式链接、标题和发布日期，不建立可点击链接。" }, "23 / 29"),
];

export const patentEvidenceQueue = [
  evidenceRecord({ id: "EV-IP-001", category: "Patent / IP", title: "专利与申请记录清单", recordCountClaim: 22, status: "UNKNOWN", notes: "演示文稿使用“已申请”口径；授权状态必须逐项核验。" }, 12),
];

const ipRows = [
  ["一种双电机驱动伺服滑臂控制电路及电路板组件", "发明专利", "2023114450474"],
  ["一种模糊自适应的电机滑模控制系统及方法", "发明专利", "2023114386853"],
  ["一种机器人电机控制器", "实用新型", "2023218252143"],
  ["一种仿真人体的机器人足部结构", "实用新型", "2023214397247"],
  ["一种行星齿轮减速器", "实用新型", "2023218393175"],
  ["一种机器人腿部结构", "实用新型", "2023214398057"],
  ["一种关节驱动机构", "实用新型", "2023214398061"],
  ["一种力矩电机", "实用新型", "2023214178589"],
  ["一种消隙机构", "实用新型", "202321417856X"],
  ["一种力矩减速电机模组", "发明专利", "2023106286590"],
  ["一种力矩减速电机模组消隙方法", "发明专利", "2023106602278"],
  ["基于门控图神经网络的机器人操作关系检测方法及系统", "发明专利", "202311816962X"],
  ["一种人形机器人双臂动力结构", "发明专利", "202610102162.9"],
  ["基于双向力觉映射的沉浸式机器人遥操作主从系统及方法", "发明专利", "202610219052.0"],
  ["一种可集成药箱的药房机器人", "实用新型", "2025224482442"],
  ["一种机器人末端的小型拆药分装装置", "实用新型", "2025225205786"],
  ["一种可更换不同指型的机器人末端执行机构", "实用新型", "2025226194238"],
  ["一种车库巡检机器人", "实用新型", "2025224090535"],
  ["机器人（Mantis 2.0）", "外观专利", "2025305147853"],
  ["一种基于虚拟现实的遥操作分身机器人系统", "发明专利", "2026104453643"],
  ["可一键切换的多模式遥操作机器人协同控制方法", "发明专利", "2026103576769"],
  ["一种基于嵌入式域控的机器人", "发明专利", "202610360160X"],
];

export const ipRecords = ipRows.map(([title, type, applicationOrPatentNumber], index) => evidenceRecord({
  id: `IP-${String(index + 1).padStart(3, "0")}`,
  category: "Patent / IP",
  title,
  type,
  applicationOrPatentNumber,
  status: "UNKNOWN",
  notes: "名称、类别与编号按演示文稿转录；法律状态未核验。",
}, 12));

export const productTestEvidenceQueue = [
  evidenceRecord({ id: "EV-TEST-001", category: "Product Test", title: "复杂信号干扰环境测试记录", date: null, result: null, notes: "机器人身份、测试方法、日期与结果均待确认。" }, 31),
];

export const progressEvidenceRecords = [
  ...competitionEvidenceQueue,
  ...mediaCoverageQueue,
  ...patentEvidenceQueue,
  ...productTestEvidenceQueue,
];
