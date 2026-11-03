# Always Light Mode 官网

官网与浏览器扩展现在放在同一个仓库：扩展仍在仓库根目录，官网在 `website/`，各自保留独立的 pnpm 锁文件和命令。

技术栈：React 19、Vite、TanStack Start / Router（SSR）、Tailwind CSS v4、shadcn/ui（Base UI）、lucide-react、Sonner、Motion、Vitest、Cloudflare Workers。

## 开发和检查

在 `website/` 下执行，`packageManager` 锁定 `pnpm@11.28.10`：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview
```

`/` 为首页；`/uninstall?v=1.7.0&lang=zh-CN` 为卸载反馈页，保留 10 种语言及原来的邮件反馈流程。`src/routes/` 使用文件路由，`src/routeTree.gen.ts` 由 TanStack 自动生成。TypeScript 启用 strict，`@/*` 指向 `src/*`。

原 `always-light-mode-site` 目录及 Git 历史、未提交的卸载页保留作回滚备份；日常开发以本目录为准。新目录只迁入页面实际使用的 UI 组件，旧模板中的闲置组件仍在备份中。

## Cloudflare Workers

根据 [Cloudflare 官方 TanStack Start 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)配置。Vite 的开发和预览服务使用 Workers 运行时；生产构建输出到 `dist/client` 和 `dist/server`。

```sh
pnpm cf-typegen
pnpm deploy:dry-run
# 确认账户、现有站点域名和远端配置后，再执行正式部署：
pnpm deploy
```

当前没有绑定生产域名，没有创建 D1，也没有执行远端部署。域名 `always-light-mode.emmmm.dev` 的现有服务不会因本地迁移自动切换。

反馈收集的下一步方案见 [feedback-plan.md](docs/feedback-plan.md)。

## 第三方素材

GitHub 标志使用 [GitHub 官方 Octicons](https://github.com/primer/octicons)，许可见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。其他界面图标来自 lucide-react。
