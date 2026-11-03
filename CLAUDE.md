# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

强制所有网站浅色显示的浏览器扩展（Chrome MV3 / Firefox MV2），基于 WXT + TypeScript。popup 没有用任何前端框架，是原生 TS/CSS（`react` 虽然在 dependencies 里，实际没有用到）。

## 常用命令

```sh
pnpm dev                 # Chrome 开发模式（HMR）
pnpm compile             # 类型检查（tsc --noEmit）；项目没有 lint 脚本
pnpm build               # 构建到 .output/chrome-mv3（e2e 加载的就是这个目录）
pnpm build:firefox       # 构建到 .output/firefox-mv2
pnpm test:e2e            # 先 build 再跑全部 Playwright 用例
pnpm exec playwright test force-light            # 只跑单个 spec（按文件名匹配）
pnpm exec playwright test -g "排除当前站点"         # 按测试名过滤
```

e2e 测试加载的是构建产物，改完源码后要先 `pnpm build` 再单跑 spec，否则测的还是旧代码。首次运行需要 `pnpm exec playwright install chromium`。

## 架构

### 内容脚本是运行时动态注册的

`inject.content.ts` 和 `content.ts` 都声明了 `registration: 'runtime'`，manifest 里不会出现它们。注册由 `utils/registration.ts` 的 `syncContentScripts()` 负责：background 在 install / startup 时调用，popup 切换开关后也会调用。它先注销旧注册，再按当前状态重新注册：总开关关闭时不注册；排除列表（内置黑名单加用户排除的站点）写进 `excludeMatches`。注册参数统一为 `document_start` 和 `allFrames`。

因此：**脚本被注入，就代表当前站点应该生效**，加载阶段不会去读 storage。新增需要排除的站点或注册条件时，改 `registration.ts`，不要在内容脚本里判断。

### 两个 world 分工

- `inject.content.ts`（MAIN world，脚本 ID `alm-page-patch`）：在页面脚本执行前给原生 API 打补丁，包括 `matchMedia`、`CSSStyleSheet.replace/replaceSync/insertRule`、`Storage.prototype.*`、`window.localStorage`（用 Proxy 包装，拦截 `localStorage.theme` 这类属性式读取）和 `attachShadow`。
  - 补丁一直挂着，通过 `__almEnable` / `__almDisable` 两个 DOM 事件运行时启停。
  - 这些补丁会直接影响页面自己的代码，改动时要保证页面拿到的对象行为和原生一致。之前出过问题：Proxy 对返回的函数做了 bind，导致 Stripe 白屏。
- `content.ts`（ISOLATED world，脚本 ID `alm-style`）：注入浅色样式，把暗色媒体规则改写成恒假条件，改写主题标记（class、`data-theme` 等），并挂上 style、theme、shadow 三个 observer。
  - 监听 storage 变化，开关切换时无需刷新页面即可生效或还原。
  - 所有改写都要能撤销：`utils/styles/dark-mode.ts` 记录每处改写的原值，disable 时逐一还原，不能直接删除规则。

两个脚本开头都会调用 `isInjectableDocument()`，遇到 XML / SVG / RSS 文档直接返回，不做任何处理。`content.ts` 是个例外：它会先注册 `alm-ping` 应答，再做这个判断。popup 依靠这个 ping 判断页面里是否已有脚本，以决定是否需要刷新页面。

### 站点专用修复

通用逻辑覆盖不到的站点，在 `entrypoints/utils/sites/` 下单独写一个文件，导出 `setup*` / `teardown*`，并在 `content.ts` 的 enable / disable 里各接上一处。现有例子见 `apple-music.ts`、`opencode.ts`。

### 状态

`utils/storage.ts` 中有两项状态，都存在 `storage.sync`：`isLightModeEnabled`（总开关）和 `disabledSites`（用户排除的 hostname 列表）。

## 测试

- `tests/e2e/fixtures.ts` 用持久化 context 加载 `.output/chrome-mv3`，并强制系统深色（`--force-dark-mode`）。
- `serveFixture()` 通过 `page.route` 把本地 HTML 挂到虚构域名上，测试时不需要真实网络。
- `fixtures/dark-page.html` 汇集了各种暗色写法，运行后会把自检结果写进 `#results`。在 `force-light.spec.ts` 里新增断言时，通常要同时改这两个文件。

## 发布

推送 `v*` 标签后，`.github/workflows/release.yml` 会依次：执行 `pnpm zip`，通过 `publish-extension`（Chrome Web Store API v2 + service account）上传并提交审核，再把 zip 附到 GitHub Release。

- 不能用 `wxt submit`，它依赖的是已停服的 v1 API。
- 商店同一时间只允许一个版本在审核，审核期间再次提交会返回 `NOT_UPDATEABLE`。
- 发版前要更新 `package.json` 的 version 和 `CHANGELOG.md`。
- 凭据配置和本地发布步骤见 `docs/publishing.md`；商店文案在 `docs/store-listing.md`（多语言）。

## 约定

- 代码注释和测试名用中文，CHANGELOG 用英文。
- 用户可见文案都放在 `public/_locales/*/messages.json`，共 10 种语言，新增一个 key 时每种语言都要补上。
