import { lightModeEnabledStorage, disabledSitesStorage } from './storage';

const SCRIPT_IDS = ['alm-style', 'alm-page-patch'];

/**
 * 按当前开关状态同步内容脚本注册。
 * 动态注册（而非 manifest 静态声明）让开关和站点排除在页面加载前就已生效，
 * 且 MAIN world 补丁能以 document_start 同步运行在页面脚本之前。
 */
export const syncContentScripts = async () => {
  const existing = await browser.scripting.getRegisteredContentScripts({ ids: SCRIPT_IDS });
  if (existing.length > 0) {
    await browser.scripting.unregisterContentScripts({ ids: existing.map((s: { id: string }) => s.id) });
  }

  const isEnabled = await lightModeEnabledStorage.getValue();
  if (!isEnabled) return;

  const disabledSites = await disabledSitesStorage.getValue();
  const common = {
    matches: ['<all_urls>'],
    excludeMatches: disabledSites.map((host: string) => `*://${host}/*`),
    runAt: 'document_start' as const,
    allFrames: true,
    persistAcrossSessions: true,
  };

  // MAIN world 在部分浏览器（旧版 Firefox）不可用，失败时至少保留样式处理脚本
  try {
    await browser.scripting.registerContentScripts([
      { ...common, id: 'alm-page-patch', js: ['content-scripts/inject.js'], world: 'MAIN' },
    ]);
  } catch (e) {
    console.warn('MAIN world script registration failed:', e);
  }
  await browser.scripting.registerContentScripts([
    { ...common, id: 'alm-style', js: ['content-scripts/content.js'] },
  ]);
};

export const updateIcon = async () => {
  const isEnabled = await lightModeEnabledStorage.getValue();
  await browser.action.setIcon({
    path: { 128: isEnabled ? 'icon/128.png' : 'icon/dark-128.png' },
  });
};

export const getHostname = (url?: string) => {
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'http:' || protocol === 'https:' ? hostname : null;
  } catch {
    return null;
  }
};
