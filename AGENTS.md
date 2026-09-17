# Prototype Instructions

## 2026-09-17 Mobile Homepage Hero release authorization

- Owner accepted the local mobile Hero result and explicitly requested publication. This supersedes the local-only restriction below for this approved change only.
- Commit/push the approved <=767px Hero and derivative through existing origin/main -> bluewormrobotics Cloudflare Pages, after manifest:upload, audit:upload and verify:upload pass.
- Verify the deployed commit and four phone widths, desktop, responsive media, routes and existing video Range support. No further redesign, new hosting, DNS/domain, email or inquiry changes.

## 2026-09-17 Dedicated mobile Homepage Hero / local review only

- Owner reopens only Homepage Hero at <=767px: dedicated official full-body derivative and one small-viewport composition containing the existing title, tagline, price and CTA. No second homepage or duplicated copy.
- Desktop >=768px, header, other sections/pages, facts and video seeking remain unchanged. Source assets stay read-only; new derivative uses A01781 with proportional scaling and transparent padding only, no generated/retouched product appearance.
- Capture before/after at 360/375/390/430, desktop regression and breakpoint/resize checks. Browser emulation is not real iOS/WeChat verification.
- Do not commit, push, deploy or update release manifests. Wait for independent Review; this overrides prior release authorization.

## 2026-09-16 Homepage video seeking fix and release

- Owner reports the Homepage official-film native timeline cannot seek and explicitly authorizes fixing and publishing it.
- Add streaming single-byte-range responses for existing MP4 assets in the current Pages Worker; preserve inquiry/security/routes and original media. Do not buffer the whole movie, add services, or redesign controls.
- The Homepage official-film URL gets a query version to bypass cached full-only responses. Validate native forward/backward seeking beyond buffered data on desktop/mobile and verify actual 206 Content-Range bytes before declaring success.

## 2026-09-16 Owner approves all current refinements for release

- Owner accepted the current engineering image and product-page tail removal, and explicitly requested publishing all current local website updates to the existing official Pages site.
- Include the approved owner-feedback/final-polish work: 一脑多型, dimensions label, responsive composition, partner logo/name cards, technology typography, product anatomy, new form images and web video variants, and removal of the final two product-page sections.
- Release through existing origin/main and bluewormrobotics Pages only. Run manifest:upload, audit:upload and verify:upload before push, then validate deployed SHA and production pages/media.
- Do not enable inquiry/email/Resend/Turnstile, change DNS/domains, or redesign further during release. Original media stays read-only.
- Owner subsequently paused upload to fix the Homepage Hero right-side floor-shadow seam; authorizes a narrow edge-blending correction and release after verification. Keep product pixels opaque through 88% of the image, preserve composition and all source assets; mobile remains unchanged.

## 2026-09-16 Task0191 Boss Preview release authorization

- Owner authorizes publishing the approved local website to existing origin/main and bluewormrobotics Pages. Email/Resend/Turnstile remain postponed and disabled; no real email or email-variable changes.
- Sole new UI fix authorized: Applications Hero empty caption overlay passes pointer events through to video controls, while its actual text remains selectable. No visual/content/media changes. Historical lock hashes stay intact; tests subtract only this exact CSS addition.
- Require full local and production QA before declaring success. No new project, DNS or domain changes.

## 2026-09-16 Owner restores standalone inquiry (supersedes inline contact below)

- Restore the existing `/inquiry` page. Navbar purchase and the single Homepage contact CTA navigate to `/inquiry`; no inline form on Homepage. `/contact` redirects 308 to `/inquiry`.
- Homepage forms heading is now 形态展示. Preserve the six images, content, grid and hover behavior.
- InquiryPage / InquiryForm and email security stay unchanged; sending remains disabled. No commit/push/deploy or Task018.9. Report: ../docs/boss-review/INQUIRY_RESTORE_FORMS_LABEL.md.

## 2026-09-16 Owner final homepage polish / contact IA

- 018.8B Editorial, NAV and F News/Partners accepted by Owner. Current new card reopens only below-Hero homepage headers, six-form presentation and contact IA. Hero and all product facts/media remain locked.
- Homepage headers: 产品影片、六种形态、按需组合、真实任务、核心技术、合作伙伴、新闻动态、采购合作. Center heading anchors, not every content block. Six photographic forms use a small-gap 3×2 / mobile 2×3 grid, subtle fine-pointer hover, no fake links.
- Homepage #contact owns the inline existing InquiryForm, collapsed by default. /inquiry and /contact are 308 compatibility redirects to /#contact. Navbar purchase destination changes without changing its visual system; other locked pages/Footer keep legacy links via redirects.
- Email remains disabled. InquiryForm and Worker email/security implementation stay unchanged; only Worker public route/redirect declarations change. Do not start Task 018.9 or release preparation; no commit/push/deploy. Report: ../docs/boss-review/HOMEPAGE_FINAL_VISUAL_POLISH.md.

## 2026-09-15 Task 018.8B-F bounded final additions

- Owner confirms 018.8B Editorial and Navbar ACCEPT; current visual system including centered Navbar underlines is LOCK.
- Homepage replaces only the rendered three-task teaser with four static, non-clickable partner logos: 西安电子科技大学、西安交通大学、陕旅集团、质子汽车. Do not infer any other partner or stronger relationship label.
- Logo provenance stays in internal/task0188bf-logo-sources.json; original colors/proportions remain. No competitor extraction, tracing, generated logos or external hotlinks.
- People's Daily original URL is http://gd.people.com.cn/n2/2025/0818/c123932-41325012.html. Internal detail remains text-only with original approved facts and a secure new-tab link.
- Applications records/anchors/media remain; all prior public assets, Navbar, Standard, facts and email backend stay locked. No commit/push/deploy; stop for ChatGPT Review before 018.8C.

## 2026-09-15 Task 018.7 local polish

- RC-018.6 已由负责人确认上线；当前HEAD bb3b328。以下018.5“未部署”文字为历史状态，不覆盖最新任务。
- 本轮只重新开放 HomePage、HomeProductStory、HomeSections、Navbar、home.css 五个源文件：首页统一MANTIS/STANDARD字体逻辑、蓝色细框CTA、移除重复模块化解释、影片intro、六形态、轻量现场片段；主导航文档中心直达，不删除支持页面。
- 新增首页专用六形态官方截图只允许裁切/缩放，不生成机器人结构；800×640 WebP来源记录见 internal/task0187-form-posters.json。产品页共享原图和所有既有public资源不改。
- 中文静态标识、Standard-only、0.98万起、六问、参数、询盘disabled、四PDF、独立页和路由锁定；internal/task0187-locked-files.json 保留145个RC哈希，五个src有明确例外。
- 本地完成待ChatGPT Review；不commit/push/deploy。018.6V已知Applications暂停按钮P1仍存在，不得声称全站生产验收通过。详情见 ../docs/boss-review/TASK0187_HOMEPAGE_POLISH.md。

## 2026-09-14 Task 018.5 RC-018.5

- 018.4 已由最新任务卡 ACCEPT / LOCK；首页与Standard结构/视觉继续锁定，六问仍 OWNER COPY REVIEW REQUIRED。
- 本轮只修手机菜单视口/背景/键盘、视频卸载资源、skip-link，并做静态中文、询盘邮箱去重、390文档分类三个P2；六个src文件是明确例外，不允许扩展重设计。
- `internal/task0185-locked-files.json` 保存144个开工哈希和六个带原因例外；其余138文件含所有页面、qa.js、public和Worker完全不改。
- RC-018.5 为本地候选，不是Production批准；未commit/push/deploy，不进入018.6。报告 `../docs/final/TASK0185_FINAL_QA_REPORT.md`，部署前必须取得负责人/ChatGPT明确批准。
- 原始bundle中框架/治理关键词与实际公开DOM分开记录，不声称原始token全部清零；Legal、六问、媒体授权与正式域名仍需负责人决定。

## 2026-09-14 Task 018.4 remaining pages alignment

- 最新任务卡：Homepage 018.2 + 018.2R LOCK；Standard 018.3 STRUCTURE / VISUAL LOCK；六问 OWNER COPY REVIEW REQUIRED，qa.js 不改。
- 本轮只对 Technology / Applications / About / Inquiry 做信息优先收口并核验 Support。四技术平台中文优先；六应用方向配任务解释；About 收缩；询盘白底紧凑表单与明确 disabled 提示；导航四支持入口和四 PDF 不变。
- `internal/task0184-locked-files.json` 锁定首页、Standard、六问、后端、共享数据与全部既有媒体。136 项哈希测试通过；018.3 历史锁仅对本轮七个获授权实现文件例外，不重置基线。
- 本地完成待 ChatGPT 独立 Review，无 commit / push / deploy，未开始 018.5。完整证据 `../docs/boss-review/TASK0184_REMAINING_PAGES_ALIGNMENT.md`。

## 2026-09-14 Task 018.3 Standard product revision

- 最新任务卡确认 018.2 + 018.2R ACCEPT / HOMEPAGE LOCK；本轮只重构 `/products/mantis-standard`，不改首页或其他独立页、不部署、不进入 018.4。
- 产品页偏 Product Documentation / Editorial；十二节信息路径，章节标题克制、参数可检索、六问默认摘要并可展开。复用六形态 WebP、批准任务、四份 PDF、单一价格常量；不新增媒体或渠道下载。
- 六问原始 Word 已定位，公开边界仍优先于原文中的数值 / 比较 / 未来规划；逐项差异与参数冲突见 `../docs/boss-review/TASK0183_STANDARD_PRODUCT_REVISION.md`。等待 ChatGPT 独立 Visual Review，不把实现完成等同 ACCEPT。
- `internal/task0183-locked-files.json` 锁定本轮不得变更的首页、共享样式、其他页面、参数及 public 资源；后续任务如需变更必须有新授权，不为通过测试随意重置哈希。

## 2026-09-14 Task 018.2R Homepage refinement

- 只收口 Hero 产品名层级、六形态与 Why Modular；不改 018.2 IA、影片顺序或独立页面。无部署，等待 ChatGPT Final Homepage Review，未开始 018.3。
- 六形态使用正式宣传片真实帧：机械臂 / 工程 / 底盘 / 双臂 / 巡检 / 完整。它们是同一 Mantis Standard 的组合形态，不是六 SKU；不添加参数、套餐或配置等级。
- 派生 WebP 溯源保存在 `internal/task0182r-form-posters.json`。原片与锁定 Hero / Reel 字节不改；静态图 lazy load，官方影片 / Real World 首屏请求继续为 0。

## 2026-09-14 Task 018.2 Homepage override

- Task 018.1 ACCEPT / Task 018.1A ACCEPT WITH CONFLICT RULES。首页本轮按“内容少、清楚、实用”重排信息；覆盖旧第二屏布局锁定及旧首页不公开价格限制，仅批准 `0.98 万起`，不推导配置或交付条件。
- A01644、现有 Reel 字节及导航 / 页脚视觉不变；官方影片点击才加载，Real World 保留近视口准备 / 离屏暂停。首页减少重复产品入口、使命大字和页内询盘。
- 仅 Homepage；Standard / Technology / Applications 独立页、Support、后端、Legal 与生产配置不在本轮范围。无 push / deploy；等待 ChatGPT 独立 Review 后才能开始 Task 018.3。

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
