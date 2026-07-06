# 发布到 Chrome Web Store

上传、提审、过审后发布均可自动化（Chrome Web Store API **v2**，经由 `publish-browser-extension` v5）；Google 的人工审核本身仍需等待，通常几小时到几天。

> 为什么不用 `wxt submit`：wxt 锁定的 publish-browser-extension 旧版本走的是
> 2026-10-15 停服的 v1 API。本项目直接依赖 v5 并使用 v2 API + service account。

## 一次性准备：Service Account（推荐）

1. [Google Cloud Console](https://console.cloud.google.com/) 创建/选择项目，搜索并启用 **Chrome Web Store API**；
2. IAM 和管理 → 服务账号 → **创建服务账号**（无需授予任何角色）→ 创建完成后进入该账号 → 密钥 → 添加密钥 → **JSON**，下载密钥文件；
3. 打开 [Chrome Web Store 开发者后台](https://chrome.google.com/webstore/devconsole) → **Account（账号）** 页 → 把服务账号的邮箱（`xxx@项目.iam.gserviceaccount.com`）添加为 API 访问者（每个发布者账号只能绑一个服务账号）；
4. 在后台 Publisher → Settings 记下 **Publisher ID**。

最终需要四个值：

| 变量 | 来源 |
|---|---|
| `CHROME_EXTENSION_ID` | 商店里扩展的 ID（商店 URL 末尾那串） |
| `CHROME_PUBLISHER_ID` | 开发者后台 Publisher Settings |
| `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL` | 服务账号 JSON 里的 `client_email` |
| `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY` | 服务账号 JSON 里的 `private_key`（含换行的完整 PEM） |

相比 OAuth refresh token 方案：不需要同意屏幕、不会过期、没有 OOB/invalid_request 那些坑。

## 本地发布

```sh
# 四个变量写入 .env（已被 git 忽略）或直接导出；CLI 默认走旧版 v1.1，须显式指定 v2
pnpm zip
CHROME_API_VERSION=v2 pnpm exec publish-extension --chrome-zip .output/*-chrome.zip
```

先验证不实际提交：加 `--dry-run`。只上传不提审：设 `CHROME_SKIP_SUBMIT_REVIEW=true`。

## GitHub Actions 自动发布

1. 仓库 Settings → Secrets and variables → Actions，添加上表四个 secret；
2. 更新 `package.json` 版本号、`CHANGELOG.md`，合并到 main；
3. 打标签推送即触发 `.github/workflows/release.yml`：

   ```sh
   git tag v1.3.0 && git push origin v1.3.0
   ```

工作流会构建、打 zip、提交商店审核，并把 zip 附到 GitHub Release 上。审核通过后 Google 自动发布新版本。

## 备选：OAuth refresh token（旧 v1.1 API，2026-10-15 停服）

如果暂时不方便配 service account，仍可用 OAuth 凭据走 v1.1：

1. Cloud Console 创建 **Desktop app** 类型 OAuth 客户端，拿到 client id/secret
   （secret 只在创建时显示一次，错过了在客户端详情页 "Add secret" 重新生成）；
2. 换取 refresh token（不要用 `publish-extension init`，它的 OOB 流已被 Google
   废弃，会报 "Error 400: invalid_request"；本脚本走现行的 loopback 流）：

   ```sh
   CHROME_CLIENT_ID=xxx CHROME_CLIENT_SECRET=xxx pnpm token:chrome
   ```

3. 提交时指定旧版 API：

   ```sh
   CHROME_API_VERSION=v1.1 pnpm exec publish-extension --chrome-zip .output/*-chrome.zip
   ```

   所需变量：`CHROME_EXTENSION_ID`、`CHROME_CLIENT_ID`、`CHROME_CLIENT_SECRET`、`CHROME_REFRESH_TOKEN`。

注意：OAuth 同意屏幕处于 Testing 状态时 refresh token 7 天过期，把应用改为
In production（此 scope 无需审核）即可长期有效。

## API 能做与不能做

- ✅ 上传 zip、提审、发布、灰度放量（v2）、取消审核中的提交（v2）；
- ❌ 商店长描述、截图、推广图、类目——没有 API，只能后台手动维护。
  manifest 内的短描述（多语言）随 zip 包自动更新。

## 商店后台素材（人工维护）

- 长描述：`docs/store-listing.md`（10 种语言）
- 权限说明：`docs/permission-justifications.md`
- 截图与推广图：`assets/store/`（`pnpm store:assets` 重新生成）
