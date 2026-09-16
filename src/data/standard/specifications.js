import { standardSource } from "./product.js";

function spec(record) {
  return {
    publicApproved: false,
    visibility: "SOURCE",
    contentStatus: "SOURCE",
    conflict: false,
    notes: "待负责人确认正式 Standard 口径。",
    ...record,
  };
}

export const standardSpecs = [
  spec({ id: "dimensions-overall", group: "Robot Body", label: "尺寸", value: "633 x 552 x 1300", unit: "mm", variant: "productGeneral", source: `${standardSource} · Slide 3` }),
  spec({ id: "arm-reach", group: "Dual Arm", label: "臂展", value: "663", unit: "mm", variant: "productGeneral", source: `${standardSource} · Slide 3` }),
  spec({ id: "lift-range", group: "Lift / Workspace", label: "升降范围", value: "550", unit: "mm", variant: "productGeneral", source: `${standardSource} · Slide 3` }),
  spec({ id: "repeat-position", group: "Dual Arm", label: "重复定位精度", value: "1?", unit: "mm", variant: "productGeneral", source: `${standardSource} · Slide 2`, conflict: true, notes: "源文件数值带问号，必须确认。" }),
  spec({ id: "control-latency", group: "Compute / Interface", label: "控制延迟", value: "< 10", unit: "ms", variant: "productGeneral", source: `${standardSource} · Slide 2` }),
  spec({ id: "speed-overview", group: "Mobility", label: "前进速度", value: "3", unit: "m/s", variant: "productGeneral", source: `${standardSource} · Slide 3`, conflict: true, notes: "与底盘配置表 5m/s 冲突。" }),
  spec({ id: "speed-base-table", group: "Mobility", label: "底盘移动速度", value: "5", unit: "m/s", variant: "mobileBase", source: `${standardSource} · Slide 5`, conflict: true, notes: "与结构介绍页 3m/s 冲突。" }),
  spec({ id: "lift-speed", group: "Lift / Workspace", label: "升降速度", value: "200", unit: "mm/s", variant: "productGeneral", source: `${standardSource} · Slide 3` }),
  spec({ id: "dof-overview", group: "Robot Body", label: "全身自由度", value: "22", unit: "DoF", variant: "productGeneral", source: `${standardSource} · Slide 2`, conflict: true, notes: "配置矩阵中存在不同自由度组合。" }),
  spec({ id: "payload-overview", group: "Dual Arm", label: "单臂负载", value: "7", unit: "kg", variant: "productGeneral", source: `${standardSource} · Slide 2`, conflict: true, notes: "配置矩阵同时出现 3kg 与 7kg。" }),
  spec({ id: "base-dof", group: "Mobility", label: "底盘能力", value: "3 自由度全向移动", unit: "", variant: "productGeneral", source: `${standardSource} · Slides 3, 5, 7` }),
  spec({ id: "perception-overview", group: "Compute / Interface", label: "感知交互", value: "视听说 / 力控", unit: "", variant: "productGeneral", source: `${standardSource} · Slide 3`, conflict: true, notes: "配置矩阵中的双目视觉、深度相机、激光雷达组合不同。" }),
  spec({ id: "compute-config", group: "Compute / Interface", label: "主控", value: "嵌入式 / 嵌入式 + NUC", unit: "", variant: "configuration", source: `${standardSource} · Slides 5–7`, conflict: true, notes: "不同配置使用不同主控组合。" }),
  spec({ id: "interface-list", group: "Development / Connectivity", label: "通信与数据接口", value: "Wi‑Fi 6 / Bluetooth 5.0 / USB 3.1 / CAN 2.0", unit: "", variant: "configuration", source: `${standardSource} · Slides 5–7` }),
  spec({ id: "battery-overview", group: "Mobility", label: "单电池续航", value: "5", unit: "h", variant: "productGeneral", source: `${standardSource} · Slide 3`, conflict: true, notes: "配置矩阵同时出现 2h、5h 与 10h。" }),
  spec({ id: "battery-base", group: "Mobility", label: "底盘续航", value: "10", unit: "h", variant: "mobileBase", source: `${standardSource} · Slide 5`, conflict: true, notes: "与结构介绍页和整机矩阵不一致。" }),
  spec({ id: "development-stack", group: "Development / Connectivity", label: "开发接口", value: "ROS 2 / MoveIt 2 / SDK", unit: "", variant: "configuration", source: `${standardSource} · Slides 5–7`, conflict: true, notes: "不同内部配置的支持状态不同。" }),
];

export const standardSpecGroups = [
  "Robot Body",
  "Mobility",
  "Dual Arm",
  "Lift / Workspace",
  "Compute / Interface",
  "Development / Connectivity",
];

const publicSpec = (record) => ({
  ...record,
  unit: record.unit ?? "",
  variant: record.variant ?? "PUBLIC BASELINE",
  source: "docs/STANDARD_SPEC_BASELINE_V1.md",
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  conflict: false,
});

// Public projection for Task 014.1. Conflicting configuration values stay in
// standardSpecs for Internal Review; their public rows only state that the
// value depends on configuration and never expose an unresolved number.
export const standardPublicSpecs = [
  publicSpec({ id: "public-dimensions", group: "Robot Body", label: "尺寸", value: "633 x 552 x 1300", unit: "mm", variant: "整机通用" }),
  publicSpec({ id: "public-base-dof", group: "Mobility", label: "底盘能力", value: "3 自由度全向移动", variant: "整机通用" }),
  publicSpec({ id: "public-mobility-config", group: "Mobility", label: "移动能力与续航", value: "根据配置不同", variant: "配置相关" }),
  publicSpec({ id: "public-arm-reach", group: "Dual Arm", label: "臂展", value: "663", unit: "mm", variant: "整机通用" }),
  publicSpec({ id: "public-arm-config", group: "Dual Arm", label: "负载与自由度", value: "根据配置不同", variant: "配置相关" }),
  publicSpec({ id: "public-lift-range", group: "Lift / Workspace", label: "升降范围", value: "550", unit: "mm", variant: "整机通用" }),
  publicSpec({ id: "public-lift-speed", group: "Lift / Workspace", label: "升降速度", value: "200", unit: "mm/s", variant: "整机通用" }),
  publicSpec({ id: "public-control-latency", group: "Compute / Interface", label: "控制延迟", value: "< 10", unit: "ms", variant: "整机通用" }),
  publicSpec({ id: "public-compute-config", group: "Compute / Interface", label: "感知与主控", value: "根据配置不同", variant: "配置相关" }),
  publicSpec({ id: "public-interface-list", group: "Development / Connectivity", label: "通信与数据接口", value: "Wi‑Fi 6 / Bluetooth 5.0 / USB 3.1 / CAN 2.0", variant: "公开接口" }),
  publicSpec({ id: "public-development-config", group: "Development / Connectivity", label: "开发接口", value: "根据配置不同", variant: "配置相关" }),
];
