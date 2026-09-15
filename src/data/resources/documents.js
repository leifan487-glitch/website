export const documentResourceFields = [
  "id",
  "title",
  "product",
  "category",
  "description",
  "fileUrl",
  "fileType",
  "fileSize",
  "version",
  "updatedAt",
  "contentStatus",
  "visibility",
  "publicApproved",
];

export const documentResources = [
  ["user-manual", "使用说明书", "产品安装、基础操作与使用说明", "PDF", 4400782],
  ["delivery-checklist", "交付清单", "产品交付内容及配件核对说明", "PDF", 191719],
  ["safety-notes", "注意事项", "产品使用、安全及相关注意事项", "PDF", 543601],
  ["developer-guide", "开发手册", "面向开发者的 Mantis Standard 二次开发资料", "PDF / Developer", 4124914],
].map(([id, name, description, fileType, fileSize]) => ({
  id: `mantis-standard-${id}`,
  title: `Mantis Standard 人形机器人${name}`,
  product: "Mantis Standard",
  category: id === "developer-guide" ? "开发资料" : "产品资料",
  description,
  fileUrl: `/documents/mantis-standard/mantis-standard-${id}.pdf`,
  fileType,
  fileSize,
  contentStatus: "VERIFIED",
  visibility: "PUBLIC",
  publicApproved: true,
}));
