# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## 蓝虫官网 V1 当前约束

- 当前视觉只是可评审 V1，不是最终定稿；后续还要合并 Envato Elements 与机器人行业标杆研究。
- 任务卡 005 只允许实现 Navbar、Product Hero、What is Mantis、Mantis Product Detail、Real World；禁止继续扩展 Technology、Applications、Progress、About、News 或 Footer。
- Hero 后的统一视觉方向为 `Premium Industrial Editorial`：White Product World 逐步进入 Dark Real World，以真实产品、大媒体、编辑网格和克制运动建立连续叙事。
- Product Hero 的产品名称、variant、定位、CTA、poster、theme 与状态统一来自 `src/data/productHeroProducts.js`。
- Standard 与 Pro 只在内部 V1 的 Product Hero 中启用；选择器不得驱动 Hero 以下内容。Standard 使用 `series-array`，Pro 使用 `single-product`，两者允许独立媒体参数。
- A01644、P00001、P00002、A01790、A01791、A01792、A01585、A01621、A01623 均为 `SOURCE`，只用于内部原型，不代表允许上线。A01644 承担 Standard 系列总览；P00001 / P00002 承担 Pro desktop/mobile 完整整机；A01790 用于 Product Idea；A01791 / A01792 用于 Product Detail；A01585 只以代表帧用于 Real World，且不声明具体型号。
- Product Hero 的 MANTIS、variant、selector、TODO 定位与 CTA 必须组成单一信息组；Desktop 产品媒体从 Navbar 下方直铺至 Hero 底部，并与纯白页面舞台融合，不再出现独立 JPG 矩形容器感。
- Desktop Standard 阵列以底部为锚点放大并保持多构型完整；Desktop Pro 保持完整轮廓并占据中右主视觉。Mobile 使用独立流式排版，产品尺度优先，但不得挤压信息组或破坏 selector 触达。
- Standard Hero 的当前 Desktop / Mobile 构图已由 ChatGPT `ACCEPT` 并冻结；后续 Pro-only 修订不得改变 Standard 的媒体参数、信息组位置或截图结果。
- Pro Hero 采用“单一旗舰产品”构图：Desktop 允许媒体使用完整 Hero 高度并把整机推到右侧，左侧信息组可独立下移；Mobile 只放大完整整机。完整主视觉足够时不加入辅助部件，避免形成第二产品或 collage。
- Product Hero V1 已 `ACCEPT / LOCK`；任务卡 005 不修改其组件、config、素材、selector 或构图参数，只做回归验证。
- 2026-09-03 负责人明确授权首页视觉继续优化：Desktop Hero 使用新增 `MANTIS standard` 完整合成视觉增强张力，Mobile 继续使用 A01644 专用构图；Navbar 采用随页面主题变化的透明渐变表面；桌面产品导航采用全宽横向产品面板，并固定为 `Standard / 敬请期待` 两个状态，不得借“敬请期待”公开未确认型号。
- 2026-09-03 负责人在视觉对比后撤回 Desktop 合成海报方案：首页首屏恢复 D-019 的 A01644 完整系列阵列、左侧实时信息组与纯白产品舞台；Navbar 渐变表面和 `Standard / 敬请期待` 产品面板继续保留。
- Task 010 建立 Support / Resources / Inquiry / Legal 基础设施。资源只有 `VERIFIED + publicApproved: true + 非 PRIVATE + 真实 URL` 才能渲染；当前资源集为空。Service / Inquiry 不接后端，Privacy / Terms 不写实质法律承诺；不得借空状态虚构文档、下载、视频、FAQ、联系方式或服务流程。
- Task 011 将当前页面壳标记为 `Website Shell Ready`：中文是一级 UI 主语言，Product / Support Dropdown、CTA、Form、EmptyState、Footer 与响应式规则以 `docs/UI_SYSTEM_V1.md` 为准。
- Support 模块级公开入口只从 `src/data/supportModules.js` 读取；公开模式隐藏模块时必须同步影响 Navbar、Support Overview、Footer、直达 Route 与 sitemap。资源级审批规则仍独立生效，详见 `docs/PUBLIC_VISIBILITY.md`。
- 正式域名未确认前不得写入假 canonical 或 sitemap URL；正式 OG 分享图未确认前不得引用 SOURCE / PRIVATE / Pro 素材。
- 下一阶段是 `Standard Real Content Ingestion`，但 Task 011 未经 ChatGPT `ACCEPT` 前不得开始。

## 2026-09-05 Homepage Premium Motion Override

- Task 015.1 的视觉、内容、媒体、路由和公开边界继续锁定；动效前版本保存在 `../backups/BLUE_WORM_TASK0151_PRE_GSAP_20260905-114210.zip`，不得覆盖或删除。
- 首页已允许使用 `GSAP + ScrollTrigger`，但仅服务于首页编排，不扩展到独立页面或全站路由过渡。
- 首屏动效应接近高端设计师作品集 / 创意机构官网：标题使用遮罩揭开、位移与压缩复位，媒体以克制的舞台式入场建立第一视觉重点。
- 滚动区块遵循“英文大标题先入场，再由内容或卡片 stagger 出现”的节奏；图片和视频可使用 reveal 与桌面端轻微 parallax。
- 动效节奏偏慢、丝滑、舒缓，统一使用自然减速曲线；禁止 bounce、elastic、back 回弹和廉价的全页统一淡入。
- 动画不得改变终态布局、阻断交互或依赖隐藏内容才能正确渲染。媒体 parallax 仅在桌面启用，幅度保持轻微。
- `prefers-reduced-motion` 必须得到完整静态回退；组件卸载或路由切换时必须清理 GSAP context、matchMedia 与 ScrollTrigger。
- 不增加 WebGL、Canvas、Lottie、新字体或第二套动画库；继续保持首页一个主动加载 MP4、Applications 零视频请求。
- 当前 Premium Motion Pass 已完成本地实现与 QA，等待 ChatGPT `ACCEPT / REVISE / REJECT`；不部署、不推送，也不命名为 Task 016。

## 2026-09-05 Visual Direction 2 Scope

- 负责人选择 Visual Direction 2，并明确要求首页 Hero 的布局、媒体、内容与 opening animation 全部保持不变。
- 本轮视觉调整只作用于首页 `Mantis Standard` 与 `Real World`：前者采用浅色画廊舞台和右侧超大产品裁切，后者采用全宽电影化任务媒体与左侧叠加标题。
- 已核验文案、Standard-only 策略、现有任务 Reel、播放控制、GSAP + ScrollTrigger、reduced-motion 和公开边界必须保留；不得借视觉调整新增产品型号、指标、主张、路线或媒体。
