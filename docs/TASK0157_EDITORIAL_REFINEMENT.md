# Task 015.7 — Editorial & Inquiry / Video Layout Refinement

日期：2026-09-06  
状态：本地实现与 Production Preview 验证完成，等待 ChatGPT 独立 Review

## 【任务目标】

1. 重做询盘页正文标题、左侧说明和右侧表单文字 / 排版，减少生成式口号感与过度留白。
2. 重写用户截图点名的 Technology / Applications 大标题与合作入口，建立具体、直接、可控断行的中文标题系统。
3. 重做 Video Center 标题下方内容编排，将分散的分类段落合并为紧凑、可筛选的统一媒体库。

## 【需要先读取的文件】

- `docs/PROJECT.md`
- `docs/DECISIONS.md`
- `docs/HANDOFF.md`
- `website/src/pages/InquiryPage.jsx`
- `website/src/components/InquiryForm.jsx`
- `website/src/components/TechnologyExplorer.jsx`
- `website/src/pages/TechnologyPage.jsx`
- `website/src/pages/ApplicationsPage.jsx`
- `website/src/components/VideoCenter.jsx`
- `website/src/styles.css`
- 用户提供的 8 张页面截图

## 【允许修改的范围】

- 上述 Inquiry、Technology、Applications、Video Center 页面 / 组件的文案、结构和响应式样式。
- 与本轮验收直接相关的自动化测试、Edge 截图脚本与项目文档。

## 【禁止修改的范围】

- 首页、Standard 产品页、Navbar、Footer、路由与 GSAP 体系。
- 询盘字段集合、校验规则、Worker `/api/inquiry` 接口和接收合约。
- 8 条公开 Standard 媒体记录、usage、视频 / poster 文件与公开批准。
- 产品参数、客户、高校、内部配置、价格、质保与任何事实状态。
- 原始素材目录；不得部署或推送。

## 【实现要求】

- Inquiry 采用“任务简报 + 分组表单”结构；左侧说明任务现场、目标动作与合作方式，右侧按联系信息 / 任务信息分组。
- 输入字段从低对比横线改为完整边界控件，提升标签、必填和错误状态可读性；桌面双列，移动单列。
- 五处标题使用具体任务语言，使用显式语义断行，避免随机折行、单字悬挂和同构口号。
- Video Center 保留 Featured；其余 7 条内容集中到一个库，提供全部 / 产品 / 任务操作 / 服务场景 / 工业场景筛选。
- 筛选必须使用原生按钮与可访问状态；页面在 390 / 768 / 1024 / 1440 不得横向溢出。

## 【验收标准】

- 用户截图中的五组旧口号不再存在于公开源码。
- 询盘所有字段、必填校验、聚焦首个错误和提交 API 保持有效。
- 视频分类按钮可点击，任务操作筛选显示 3 条视频并正确标记 `aria-pressed=true`。
- Production Build 和全量主测试通过。
- 12 组 Edge 截图无横向溢出、破图、Console Error 或 Page Error。

## 【完成后需要返回给 ChatGPT 的内容】

- 修改文件、关键实现、验证命令与报告路径。
- 未解决问题、公开边界和建议审核点。
- 本地 Production Preview 地址；不得部署或推送。

## 实现与证据

- 修改前备份：`backups/BLUE_WORM_TASK0157_PRE_EDITORIAL_REFINEMENT_20260906.zip`
- 自动化测试：`pnpm run test:v0`，74 / 74 通过。
- Worker 定向测试：`pnpm run test:sites`，8 / 8 通过。
- Production Build：通过；输出位于 `website/dist/`。
- 浏览器报告：`website/screenshots/task0157-editorial-refinement/browser-qa.json`，`allPassed: true`。
- 视觉截图：同目录保存 Inquiry、Technology、Applications、Video Center 的 1440 / 1024 / 768 / 390 页面与重点 Section。
- 前后对照板：`website/screenshots/task0157-editorial-refinement/task0157-before-after-qa-board.jpg`。
- Product Design 最终验收：根目录 `design-qa.md`，`final result: passed`。
- 当前预览：`http://127.0.0.1:4173/`
