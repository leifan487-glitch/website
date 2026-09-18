const basicInterfaces = "USB 2.0、CAN 2.0";
const fullInterfaces = "Wi-Fi 6、蓝牙 5.0、USB 3.1、CAN 2.0";
const row = (label, values) => ({ label, values });

// Owner 2026-09-18 explicitly approves ALL tiers, parameters and warranty
// shown in the supplied screenshots. This does not release the source PDF.
export const brochureApproval = {
  contentStatus: "VERIFIED", publicApproved: true,
  source: "Owner-approved product PPT screenshots / channel handbook pages 1, 3–7",
  confirmedAt: "2026-09-18", rawPdfPublicApproved: false,
};

export const standardConfigurations = [
  {
    id: "arm", name: "单臂", description: "从独立操作单元出发。对比负载、控制与开发支持，选择适合任务的机械臂。",
    image: "/media/mantis-standard/performance-v1/arm.webp", imageAlt: "单臂模块示意，非具体版本配置图",
    versions: ["单臂（青春）", "单臂"],
    rows: [
      row("负载能力", ["单臂 3 kg", "单臂 7 kg"]),
      row("单臂自由度", ["7 自由度", "7+1 自由度"]),
      row("最大电机扭矩", ["80 N·m", "120 N·m"]),
      row("通信与数据接口", [basicInterfaces, fullInterfaces]),
      row("主控算力", ["域控", "域控 + NUC"]),
      row("仿真环境", [false, true]), row("ROS 2 / MoveIt 2 / SDK", [false, true]),
      row("VR 遥操", [false, true]), row("深度相机", [false, false]),
      row("二次开发", ["不支持", "支持"]), row("质保期限", ["3个月", "6个月 + 专项服务"]),
    ],
  },
  {
    id: "base", name: "底盘", description: "3自由度全向移动。独立底盘配置与整机性能分别列示，不混用速度或续航口径。",
    image: "/media/mantis-standard/performance-v1/base.webp", imageAlt: "底盘模块示意，非具体版本配置图",
    versions: ["底盘（青春）", "底盘"],
    rows: [
      row("负载能力", ["60 kg", "60 kg"]), row("底盘能力", ["3 自由度全向移动", "3 自由度全向移动"]),
      row("移动速度", ["5 m/s", "5 m/s"]), row("通信与数据接口", [basicInterfaces, fullInterfaces]),
      row("主控算力", ["域控", "域控 + NUC"]), row("综合续航", ["6 h", "6 h"]),
      row("ROS 2 / MoveIt 2 / SDK", [false, true]), row("VR 遥操", [false, true]), row("激光雷达", [false, true]),
      row("二次开发", ["支持", "支持"]), row("质保期限", ["6个月 + 专项服务", "1年 + 专项服务"]),
    ],
  },
  {
    id: "dual", name: "双臂", description: "面向双臂操作与协作任务。按主控、感知和开发工具的组合，比较四种配置。",
    image: "/media/mantis-standard/product-forms-alpha/dual.webp", imageAlt: "双臂形态示意，非具体版本配置图",
    versions: ["双臂（入门）", "双臂（进阶）", "双臂（豪华）", "双臂（旗舰）"],
    rows: [
      row("负载能力", ["单臂 3 kg / 双臂 6 kg", ...Array(3).fill("单臂 7 kg / 双臂 14 kg")]),
      row("最大电机扭矩", ["80 N·m", ...Array(3).fill("120 N·m")]),
      row("通信与数据接口", [basicInterfaces, ...Array(3).fill(fullInterfaces)]),
      row("主控算力", ["域控", ...Array(3).fill("域控 + NUC")]),
      row("仿真环境", [false, true, true, true]), row("ROS 2 / MoveIt 2 / SDK", [false, true, true, true]),
      row("VR 遥操", [false, false, true, true]), row("PICO 遥操设备", [false, false, true, true]),
      row("VLA 例程", [false, false, false, true]),
      row("深度相机", [false, false, "头部相机 × 1", "头部相机 × 1 / 腕部相机 × 2"]),
      row("二次开发", ["不支持", "支持", "支持", "支持"]),
      row("质保期限", ["3个月", "6个月 + 专项服务", "1年 + 专项服务", "1年 + 专项服务"]),
    ],
  },
  {
    id: "body", name: "整机", description: "移动、双臂、升降与感知的整机组合。各版本的自由度、传感器与开发支持以本表对应列为准。",
    image: "/media/mantis-standard/performance-v1/front.webp", imageAlt: "完整机器人形态示意，非所有版本的默认配置",
    versions: ["整机（入门王）", "整机（DIY王）", "整机（导览王）", "整机（科研王）", "整机（王中王）"],
    rows: [
      row("负载能力", ["单臂 3 kg / 双臂 6 kg", ...Array(4).fill("单臂 7 kg / 双臂 14 kg")]),
      row("底盘能力", Array(5).fill("3 自由度全向移动")),
      row("升降机构", ["固定支架", ...Array(4).fill("自动升降")]),
      row("全身自由度", ["双臂14 / 底盘3", "双臂16 / 底盘3 / 腰部1", "双臂16 / 底盘3 / 头部2 / 腰部1", "双臂16 / 底盘3 / 腰部1", "双臂16 / 底盘3 / 头部2 / 腰部1"]),
      row("最大电机扭矩", ["80 N·m", ...Array(4).fill("120 N·m")]),
      row("通信与数据接口", [basicInterfaces, ...Array(4).fill(fullInterfaces)]),
      row("主控算力", ["域控", ...Array(4).fill("域控 + NUC")]), row("综合续航", Array(5).fill("3 h")),
      row("仿真环境", [false, true, true, true, true]), row("ROS 2 / MoveIt 2 / SDK", [false, true, true, true, true]),
      row("VR 遥操", [false, false, true, true, true]), row("激光雷达", [false, false, true, true, true]),
      row("PICO 遥操设备", [false, false, true, true, true]), row("VLA 例程", [false, false, false, true, true]),
      row("深度相机 / 双目视觉", [false, false, "双目视觉", "头部相机 × 1 / 腕部相机 × 2", "双目视觉 / 头部相机 × 1 / 腕部相机 × 2"]),
      row("二次开发", ["不支持", ...Array(4).fill("支持")]),
      row("质保期限", ["3个月", "6个月 + 专项服务", ...Array(3).fill("1年 + 专项服务")]),
    ],
  },
];
