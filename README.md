# 蓝虫具身官网

蓝虫具身公司官网的可部署源码。当前公开产品策略为 Standard-only，包含 Home、Mantis Standard、Technology、Applications、About、Progress、Video Center、Inquiry 和 Legal 路由。

## GitHub 仓库范围

请把当前 `website/` 目录的内容作为 GitHub 仓库根目录，不要上传外层项目目录。

应提交：

- `src/`、`public/`、`worker/`
- `scripts/`、`tests/`、`internal/`
- `.openai/`、`.env.example`、`public/_headers`
- `package.json`、`pnpm-lock.yaml`、Vite 与 workspace 配置
- `UPLOAD_MANIFEST.json`，用于全新 clone 后核对上传文件是否缺失或变化
- 本目录内的说明文档

不应提交：

- `node_modules/`、`dist/`、`output/`、`screenshots/`
- `.env*`、`.dev.vars*`、`.wrangler/`
- 日志、缓存、压缩包
- 外层的原始素材、项目备份和分析文件

仓库包含内部来源登记与测试资料，首次创建 GitHub 仓库时应选择 **Private**。

## 本地运行

要求 Node.js 20+、pnpm 11。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## 发布前验证

```bash
pnpm run verify:upload
```

Cloudflare Pages 构建产物位于 `dist/client`。

`verify:upload` 固定按构建、主测试、Worker 测试、公开卫生和上传完整性审计的顺序执行。最后的 `audit:upload` 会校验仓库清单、单一 pnpm 锁文件、生产依赖图中的全部静态资源、GitHub 单文件大小限制，以及 `public/` 到 `dist/client/` 的逐文件 SHA-256 一致性。

## Cloudflare Pages

当本目录是仓库根目录时：

```text
Root directory: 留空
Build command: pnpm run build:cloudflare
Build output directory: dist/client
```

完整设置见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 询盘状态

询盘当前保持关闭。不要设置 `VITE_INQUIRY_ENABLED=true`，直到正式域名、官网邮箱、Legal 审批和邮件服务全部完成。

环境变量名称见 `.env.example`，真实 Secret 不得提交到 GitHub。
