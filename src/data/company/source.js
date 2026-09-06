export const companyIntroductionSource = {
  id: "BW-COMPANY-INTRO-036P",
  title: "蓝虫具身介绍",
  fileName: "蓝虫具身介绍.pptx",
  type: "company-presentation",
  pageCount: 36,
  sourcePath: "D:/微信缓存/xwechat_files/wxid_uhonng7fyrci22_a5df/msg/file/2026-09/蓝虫具身介绍.pptx",
  sha256: "009E846F",
  contentStatus: "SOURCE",
  publicApproved: false,
  notes: "公司级内容来源；SOURCE 不等于可公开。",
};

export function withCompanySource(record, sourcePage, overrides = {}) {
  return {
    ...record,
    sourceId: companyIntroductionSource.id,
    sourcePage,
    contentStatus: "SOURCE",
    publicApproved: false,
    evidenceStatus: "UNVERIFIED",
    ...overrides,
  };
}
