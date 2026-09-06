export const publicProgressRecords = [
  {
    id: "xbotman-2023",
    category: "Competition",
    year: "2023",
    title: "XbotMan 明月湖硬科技创业者大赛",
    summary: "全国亚军。",
    result: "全国亚军",
    source: "蓝虫具身介绍.pptx · Page 24",
  },
  {
    id: "xian-entrepreneurship-2025",
    category: "Competition",
    year: "2025",
    title: "西安国际创业大赛",
    summary: "三等奖。",
    result: "三等奖",
    source: "蓝虫具身介绍.pptx · Page 25",
  },
  {
    id: "zhuhai-dexterous-operation",
    category: "Competition",
    year: null,
    title: "第二届珠海国际灵巧操作挑战赛",
    summary: "生活赛道优胜奖。",
    result: "生活赛道优胜奖",
    source: "蓝虫具身介绍.pptx · Page 26",
  },
  {
    id: "whrg-2025",
    category: "Competition",
    year: "2025",
    title: "世界人形机器人运动会",
    summary: "参加场景赛，并在混料分拣项目获得铜牌。",
    result: "混料分拣项目铜牌",
    source: "蓝虫具身介绍.pptx · Pages 27–28 / 人民日报 2025-08-18",
  },
].map((record) => ({
  ...record,
  media: null,
  contentStatus: "VERIFIED",
  publicApproved: true,
  visibility: "PUBLIC",
  approval: { copy: true, media: false, claim: true },
}));

export const verifiedMediaCoverage = [
  {
    id: "peoples-daily-whrg-2025",
    publisher: "人民日报",
    date: "2025-08-18",
    title: "全球首个人形机器人运动会精彩瞬间",
    summary: "报道图片说明记录蓝虫具身机器人亮相酒店场景清洁服务技能比赛。",
    href: "https://paper.people.com.cn/rmrb/pad/content/202508/18/content_30096779.html",
    contentStatus: "VERIFIED",
    publicApproved: true,
    visibility: "PUBLIC",
    approval: { copy: true, media: false, claim: true },
  },
];

export const newsItems = publicProgressRecords.slice(0, 3).map((item) => ({
  ...item,
  category: `${item.category.toUpperCase()} / ${item.year || "RECORD"}`,
  image: null,
  assetId: null,
  alt: "",
}));
