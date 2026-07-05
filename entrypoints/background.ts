import { lightModeEnabledStorage, disabledSitesStorage } from './utils/storage';

const SCRIPT_IDS = ['alm-style', 'alm-page-patch'];
const MENU_ID = 'alm-toggle-site';

/**
 * 按当前开关状态同步内容脚本注册。
 * 动态注册（而非 manifest 静态声明）让开关和站点排除在页面加载前就已生效，
 * 且 MAIN world 补丁能以 document_start 同步运行在页面脚本之前。
 */
const syncContentScripts = async () => {
  const existing = await browser.scripting.getRegisteredContentScripts({ ids: SCRIPT_IDS });
  if (existing.length > 0) {
    await browser.scripting.unregisterContentScripts({ ids: existing.map((s) => s.id) });
  }

  const isEnabled = await lightModeEnabledStorage.getValue();
  if (!isEnabled) return;

  const disabledSites = await disabledSitesStorage.getValue();
  const common = {
    matches: ['<all_urls>'],
    excludeMatches: disabledSites.map((host) => `*://${host}/*`),
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

const updateIcon = async () => {
  const isEnabled = await lightModeEnabledStorage.getValue();
  await browser.action.setIcon({
    path: { 128: isEnabled ? 'icon/128.png' : 'icon/dark-128.png' },
  });
};

const getHostname = (url?: string) => {
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'http:' || protocol === 'https:' ? hostname : null;
  } catch {
    return null;
  }
};

/** 根据当前标签页所在站点是否被禁用，更新右键菜单文案 */
const refreshMenuTitle = async (url?: string) => {
  const host = getHostname(url);
  const disabledSites = await disabledSitesStorage.getValue();
  const title = browser.i18n.getMessage(
    host && disabledSites.includes(host) ? 'enableOnSite' : 'disableOnSite',
  );
  try {
    await browser.contextMenus.update(MENU_ID, { title, enabled: !!host });
  } catch {
    // 菜单可能尚未创建
  }
};

const refreshMenuForActiveTab = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  await refreshMenuTitle(tab?.url);
};

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    try {
      browser.contextMenus.create({
        id: MENU_ID,
        title: browser.i18n.getMessage('disableOnSite'),
        contexts: ['action'],
      });
    } catch (e) {
      console.warn('Failed to create context menu:', e);
    }
    await syncContentScripts();
    await updateIcon();
  });

  // 浏览器重启后图标要与存储状态一致
  browser.runtime.onStartup.addListener(async () => {
    await syncContentScripts();
    await updateIcon();
  });

  // 点击图标：全局开关
  browser.action.onClicked.addListener(async (tab) => {
    const isEnabled = await lightModeEnabledStorage.getValue();
    await lightModeEnabledStorage.setValue(!isEnabled);

    await syncContentScripts();
    await updateIcon();

    if (tab?.id) {
      await browser.tabs.reload(tab.id);
    }
  });

  // 图标右键菜单：按站点开关
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== MENU_ID) return;
    const host = getHostname(tab?.url);
    if (!host) return;

    const disabledSites = await disabledSitesStorage.getValue();
    const next = disabledSites.includes(host)
      ? disabledSites.filter((site) => site !== host)
      : [...disabledSites, host];
    await disabledSitesStorage.setValue(next);

    await syncContentScripts();
    await refreshMenuTitle(tab?.url);

    if (tab?.id) {
      await browser.tabs.reload(tab.id);
    }
  });

  // 切换/加载标签页时更新菜单文案
  browser.tabs.onActivated.addListener(refreshMenuForActiveTab);
  browser.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
      await refreshMenuTitle(tab.url);
    }
  });
});
