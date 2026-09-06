# GitHub Upload Checklist

## 上传前

- [ ] GitHub 仓库设为 Private。
- [ ] 仓库根目录选定为当前 `website/`。
- [ ] `.env`、API Key、Token、密码均不在提交列表。
- [ ] `node_modules`、`dist`、截图、日志和 Zip 均不在提交列表。
- [ ] `public/assets/` 中的 Logo、图片、视频和 favicon 全部在提交列表。
- [ ] `VITE_INQUIRY_ENABLED` 保持 `false`。
- [ ] `pnpm-lock.yaml` 与 `package.json` 已提交。
- [ ] 仓库中不存在 `package-lock.json`、`yarn.lock` 或 Bun 锁文件。
- [ ] `UPLOAD_MANIFEST.json` 已提交，`pnpm run audit:upload` 通过。

## 上传后

- [ ] 在 GitHub 确认 `src/`、`public/`、`worker/`、`scripts/`、`tests/` 都存在。
- [ ] 全新 clone 后执行 `pnpm install --frozen-lockfile`。
- [ ] `pnpm run verify:upload` 通过。该命令会先构建，再运行主测试、Worker 测试、公开卫生和上传完整性审计。
- [ ] `audit:upload` 报告中的缺失、变化、额外文件和资源错误均为 0。
- [ ] `dist/client/_worker.js` 在构建后生成。
- [ ] Cloudflare Preview 中首页、产品页、Video Center 与 Legal 路由可直接刷新。
- [ ] 询盘仍显示暂未开放。

## 不要做

- 不要上传外层 `经验素材取地/` 或 `backups/`。
- 不要上传真实 `.env` 或 Cloudflare / Resend Secret。
- 不要把 GitHub 仓库意外设为 Public。
- 不要在正式域名、官网邮箱和审批完成前开启询盘。
- 不要同时保留多个包管理器锁文件；本项目只使用 pnpm。
