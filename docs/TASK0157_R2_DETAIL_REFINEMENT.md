# Task 015.7 R2 — Video Entry & About Research Detail Refinement

日期：2026-09-06  
状态：本地实现与 Production Preview 验证完成，等待 ChatGPT 独立 Review

## 【任务目标】

1. 压缩 Video Center 首屏无效留白，重新设计标题、辅助标签和说明文字层级。
2. 重做 About 页 Research in motion 区块，彻底取消文字压在 A01644 产品主体上的构图。

## 【需要先读取的文件】

- `docs/PROJECT.md`
- `docs/DECISIONS.md`
- `docs/HANDOFF.md`
- `website/src/components/PageHero.jsx`
- `website/src/pages/SupportPages.jsx`
- `website/src/pages/AboutPage.jsx`
- `website/src/styles.css`
- 用户提供的两张当前页面截图

## 【允许修改的范围】

- Video Center 的 PageHero 文案、专用变体与响应式样式。
- About Research in motion 区块的文案、布局与响应式样式。
- 与本轮直接相关的测试、截图、QA 和项目文档。

## 【禁止修改的范围】

- Navbar、Footer、路由、Video Center Featured 与统一媒体库结构。
- 8 条公开视频记录、媒体文件、poster、usage 与公开批准。
- About 其他 Section、公司事实、产品参数、客户、高校、内部配置和事实状态。
- 首页、Standard 产品页、原始素材、部署和远程仓库。

## 【实现要求】

- Video Hero 使用页面专用 compact 变体，不全局改变其他 `PageHero`。
- 中文标题不使用极端负字距；桌面和移动端都保留清晰标题—说明关系。
- About 文案与媒体必须在 DOM 与视觉上分区，不允许标题或正文覆盖产品图。
- A01644 继续使用既有网页资产；不生成或替换图片。

## 【验收标准】

- Video Hero 在 390 / 768 / 1024 / 1440 下高度不超过 520px，无横向溢出。
- About 标题与图片、copy 容器与 media 容器实测均不相交。
- 所有断点无破图、Console Error 或 Page Error。
- Video “任务操作”筛选仍为 `aria-pressed=true`，显示 3 条记录。
- Production Build 和全量测试通过。

## 【完成后需要返回给 ChatGPT 的内容】

- 修改文件、关键实现、测试命令与视觉证据。
- 保留的公开边界、未解决问题和建议审核点。
- 本地预览地址；不得部署或推送。

## 实现与证据

- 任务前备份：`backups/BLUE_WORM_TASK0157_R2_PRE_DETAIL_REFINEMENT_20260906.zip`
- 初始审视：`website/docs/TASK0157_R2_AUDIT.md`
- 自动化测试：`pnpm run test:v0`，75 / 75 通过。
- Worker 定向测试：`pnpm run test:sites`，8 / 8 通过。
- Production Build：通过；输出位于 `website/dist/`。
- 浏览器报告：`website/screenshots/task0157-r2/browser-qa.json`，`allPassed: true`。
- 前后对照板：`website/screenshots/task0157-r2/task0157-r2-before-after-board.jpg`。
- Product Design 最终验收：根目录 `design-qa.md`。
- 当前预览：`http://127.0.0.1:4173/`
