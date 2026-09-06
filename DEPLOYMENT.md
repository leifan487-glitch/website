# Repository and Deployment Guide

## Repository Root

GitHub 仓库根目录应直接对应本 `website/` 目录。上传后，仓库首页应能直接看到：

```text
src/
public/
worker/
scripts/
tests/
package.json
pnpm-lock.yaml
vite.config.mjs
```

如果 GitHub 首页只看到一个 `website/` 子文件夹，说明多套了一层；此时 Cloudflare 的 Root directory 需要填写 `website`。推荐直接上传本目录内容，使 Root directory 留空。

## First Push

```bash
cd D:\codex\蓝虫具身官网\website
git init
git add .
git status
git commit -m "Prepare Blue Worm website for deployment"
git branch -M main
git remote add origin <负责人确认的仓库地址>
git push -u origin main
```

执行 `git add .` 后，确认列表中不存在：

- `node_modules/`
- `dist/`
- `screenshots/`
- `.env` 或 `.dev.vars`
- 日志、Zip、外层原始素材和备份

## Cloudflare Pages Build

```text
Framework preset: None / Vite 均可
Root directory: 留空
Build command: pnpm run build:cloudflare
Build output directory: dist/client
Node.js: 20 或更高
```

Pages Advanced Mode 入口由构建脚本生成到 `dist/client/_worker.js`。

## Current Safe Environment

```text
VITE_SITE_URL=
VITE_INQUIRY_ENABLED=false
```

询盘保持关闭。正式域名与官网邮箱审批完成前，不配置真实收件邮箱，不启用 Mail Provider，也不把任何 Secret 写入仓库。

## Verification After Clone

在另一目录全新 clone 后运行：

```bash
pnpm install --frozen-lockfile
pnpm run verify:upload
```

全部通过后，才能认为仓库内容完整。

`UPLOAD_MANIFEST.json` 是当前可上传源码基线。`verify:upload` 会先生成 Cloudflare 产物，再运行全部测试与审计；其中 `audit:upload` 会对清单中的路径、大小和 SHA-256 逐项复核，并确认所有 `public/` 文件在构建后完整出现在 `dist/client/`。如果有内容变更，先完成正常测试，再由维护者运行 `pnpm run manifest:upload` 更新基线并复跑验证。
