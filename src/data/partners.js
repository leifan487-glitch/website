// Owner-confirmed Homepage Partner V1 list. Asset provenance stays in internal/.
export const partners = [
  { id: "xidian", name: "西安电子科技大学", logo: "/assets/partners/xidian.png", alt: "西安电子科技大学" },
  { id: "xjtu", name: "西安交通大学", logo: "/assets/partners/xjtu.jpg", alt: "西安交通大学" },
  { id: "sxtour", name: "陕旅集团", logo: "/assets/partners/sxtour.png", alt: "陕旅集团" },
  { id: "zhizi", name: "质子汽车", logo: "/assets/partners/zhizi.jpg", alt: "质子汽车" },
].map((item) => ({
  ...item,
  publicApproved: true,
  contentStatus: "VERIFIED",
  visibility: "PUBLIC",
  logoApproved: true,
}));
