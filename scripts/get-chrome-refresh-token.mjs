// 换取 Chrome Web Store 发布用的 refresh token（替代 `wxt submit init`——
// 其底层 publish-browser-extension 仍在用已被 Google 废弃的 OOB 流，会报
// "Error 400: invalid_request"）。本脚本走现行的 loopback 回环授权流。
//
// 用法：
//   CHROME_CLIENT_ID=xxx CHROME_CLIENT_SECRET=xxx node scripts/get-chrome-refresh-token.mjs
import http from 'node:http';
import { exec } from 'node:child_process';
import crypto from 'node:crypto';

const clientId = process.env.CHROME_CLIENT_ID;
const clientSecret = process.env.CHROME_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('请设置 CHROME_CLIENT_ID 和 CHROME_CLIENT_SECRET 环境变量（Desktop app 类型的 OAuth 客户端）');
  process.exit(1);
}

const state = crypto.randomBytes(16).toString('hex');

const server = http.createServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const redirectUri = `http://127.0.0.1:${port}`;

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/chromewebstore',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

console.log('在浏览器中打开授权页……如未自动打开，请手动访问：\n\n' + authUrl + '\n');
const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
exec(`${opener} "${authUrl.replace(/"/g, '%22')}"`);

// 等 Google 带着授权码重定向回本地
const code = await new Promise((resolve, reject) => {
  server.on('request', (req, res) => {
    const url = new URL(req.url, redirectUri);
    if (url.searchParams.get('state') !== state) return;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (url.searchParams.get('code')) {
      res.end('<p>授权完成，可以关闭此页面回到终端。</p>');
      resolve(url.searchParams.get('code'));
    } else {
      res.end('<p>授权失败：' + (url.searchParams.get('error') ?? 'unknown') + '</p>');
      reject(new Error(url.searchParams.get('error') ?? 'authorization failed'));
    }
  });
});
server.close();

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  }),
});
const token = await tokenRes.json();

if (!token.refresh_token) {
  console.error('未拿到 refresh token，Google 返回：', JSON.stringify(token, null, 2));
  process.exit(1);
}

console.log('\n成功！把下面的值存入 .env / GitHub Secrets：\n');
console.log('CHROME_REFRESH_TOKEN=' + token.refresh_token);
