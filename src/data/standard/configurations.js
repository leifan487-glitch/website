import { standardSource } from "./product.js";

const emptyArchitecture = {
  arms: null,
  base: null,
  head: null,
  lift: null,
  cameras: null,
  compute: null,
  sdk: null,
  teleoperation: null,
  vla: null,
};

function internalConfiguration(id, internalName, sourceSlide, price = null, warranty = null) {
  return {
    id,
    internalName,
    ...emptyArchitecture,
    price,
    warranty,
    source: `${standardSource} · Slide ${sourceSlide}`,
    contentStatus: "SOURCE",
    publicApproved: false,
    visibility: "INTERNAL",
    notes: "内部配置名称、字段、价格和质保均禁止进入 Production Public。",
  };
}

export const standardConfigurations = [
  internalConfiguration("single-arm-basic", "丐版", 5, "9800", "3个月"),
  internalConfiguration("single-arm", "单臂", 5, "15800", "6个月 + 专项服务"),
  internalConfiguration("base-youth", "幼年", 5, "14800", "6个月 + 专项服务"),
  internalConfiguration("base-mature", "成熟", 5, "26800", "1年 + 专项服务"),
  internalConfiguration("dual-arm-embryo", "胚胎体", 6, "19600", "3个月"),
  internalConfiguration("dual-arm-mature", "成熟体", 6, "38800", "6个月 + 专项服务"),
  internalConfiguration("dual-arm-complete", "完全体", 6, "52800", "1年 + 专项服务"),
  internalConfiguration("dual-arm-ultimate", "究极体", 6, "61800", "1年 + 专项服务"),
  internalConfiguration("whole-child", "孩子王", 7, "23800", "3个月"),
  internalConfiguration("whole-diy", "DIY王", 7, "58800", "6个月 + 专项服务"),
  internalConfiguration("whole-guide", "导览王", 7, "83800", "1年 + 专项服务"),
  internalConfiguration("whole-research", "科研王", 7, "88800", "1年 + 专项服务"),
  internalConfiguration("whole-king", "王中王", 7, "99800", "1年 + 专项服务"),
];
