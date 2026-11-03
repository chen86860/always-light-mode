# 反馈收集方案（待实施）

建议直接使用官网所在的 Worker，增加 `POST /feedback` 并绑定 D1。这样 popup 和卸载页共用一个入口、一个数据库，也无需另建独立 Worker 项目。当前迁移只保留原邮件流程，本文件是实施建议，不代表接口已经上线。

## 接口与数据

建议地址：`https://always-light-mode.emmmm.dev/feedback`。仅接受 JSON，不使用 Cookie。请求示例：

```json
{
  "source": "popup",
  "type": "broken",
  "url": "https://example.com/dashboard",
  "message": "启用后按钮看不清",
  "version": "1.7.0",
  "language": "zh-CN"
}
```

`type` 为 `broken`（页面异常）、`no_effect`（没效果）、`uninstall`（不再需要）、`other`；`source` 为 `popup` 或 `uninstall`，便于区分入口。卸载页保留现有原因选项并做映射。

服务端生成 UUID 和 UTC 时间；成功写入后返回 `201 {"id":"..."}`，校验失败 `400`，过大 `413`，不支持的媒体类型 `415`，限流 `429`，存储暂不可用 `503`。不公开读取接口。前端只有收到成功响应才能显示“已发送”。

建议总请求上限 16 KiB，留言 2,000 字符，URL 2,048 字符，版本 64 字符，语言 35 字符。服务端按实际读取的字节数限制，不能只相信 Content-Length。URL 仅允许 HTTP(S)，去除用户名、密码、查询参数和 fragment；按 hostname 统计问题站点。用 D1 预编译语句绑定参数。

建议表结构：

```sql
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('popup', 'uninstall')),
  type TEXT NOT NULL CHECK (type IN ('broken', 'no_effect', 'uninstall', 'other')),
  url TEXT NOT NULL DEFAULT '',
  hostname TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX feedback_created_at ON feedback(created_at);
CREATE INDEX feedback_hostname ON feedback(hostname);
```

## 防滥用与权限

- 先按 Cloudflare 提供的真实客户端 IP 限流，再解析内容、写入数据库；例如每分钟 5 条。IP 仅用于限流，不写入反馈表。Workers Rate Limiting 是各 Cloudflare 节点内的近似限制，不能描述成严格的全球计数器。[官方说明](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- 官网卸载页可以接 Turnstile，必须在服务端验证 token。popup 是否适合嵌入尚未验证，初版建议限流；CORS 或客户端自报的 source 都不能作为身份验证或可靠的防机器人措施。
- 接口处理 OPTIONS，并在成功、校验错误、限流和服务错误响应中都附带一致的 CORS 头。正式接入时实测 Chrome 和 Firefox popup。
- 本仓库 `wxt.config.ts` 已声明 `<all_urls>` 主机权限，因此计划中的 HTTPS 反馈地址在已有权限范围内。这个结论基于当前权限配置，不能概括为所有扩展“只加 CORS 就不需要权限”。[Chrome 官方网络请求文档](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)

## 如何查看

初期使用 Cloudflare D1 控制台即可。绑定 `FEEDBACK_DB` 后，在 `website/` 中查询远端：

```sh
pnpm exec wrangler d1 execute FEEDBACK_DB --remote --command "SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100"
pnpm exec wrangler d1 execute FEEDBACK_DB --remote --command "SELECT hostname, COUNT(*) AS total FROM feedback WHERE hostname <> '' GROUP BY hostname ORDER BY total DESC LIMIT 20"
```

以后需要界面时，再增加由 Cloudflare Access 保护的只读管理页；上线前同时确认 workers.dev 等备用入口不能绕过 Access。

## 通知和失败处理

先可靠落库，再发提醒。确定邮箱或 Discord / Slack webhook 后再配置通知，凭据放 Wrangler secrets。通知失败不能使已经保存的反馈显示为失败；需要可靠重试时再引入队列。

离线、超时或服务故障时保留已填写内容，提供明确的“改用邮件发送”入口；不声称邮件已发送。对 400、413 提示修改输入，对 429 提示稍后重试，避免遇到任何错误都自动打开邮件应用。超时可能发生在服务端已经落库之后，如要自动重试需先设计幂等机制。

## 隐私和上线顺序

上线前同步更新官网隐私说明、`docs/store-listing.md` 多语言文案及商店后台声明。文案应明确：只有主动发送反馈时才提交用户填写的内容、选定的网址、插件版本和语言，说明用途、保留时间与联系删除方式；不要继续声称“不收集任何数据”。表单附近展示发送范围，避免在留言里填写密码或其他敏感信息。

建议顺序：实现和本地验证接口、限流与 D1 → 同步隐私说明 → 核对账户及域名后部署 Worker → 用实际 Chrome/Firefox popup 和卸载页验证 → 发布插件。Turnstile、通知和管理页分别在需要时接入，不增加空的开关或环境变量。

## 费用

截至 2026-11-03，D1 Free 包含每天 500 万行读取、10 万行写入和总计 5 GB 存储。小规模反馈预计可在免费额度内，但还要考虑官网 SSR 的 Workers 请求量、其他数据库用量、索引写入和通知服务费用，不能保证始终免费。[D1 当前定价](https://developers.cloudflare.com/d1/platform/pricing/)
