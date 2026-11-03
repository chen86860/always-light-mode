import { syncContentScripts, updateIcon } from './utils/registration';

/** 卸载后打开的官网反馈页；带上版本与界面语言，方便页面本地化并定位问题版本 */
const uninstallUrl = () => {
  const params = new URLSearchParams({
    v: browser.runtime.getManifest().version,
    lang: browser.i18n.getUILanguage(),
  });
  return `https://always-light-mode.emmmm.dev/uninstall?${params}`;
};

export default defineBackground(() => {
  // 每次 service worker 启动都设置一次，保证升级后 URL 里的版本号是新的
  Promise.resolve(browser.runtime.setUninstallURL(uninstallUrl())).catch(() => {});

  browser.runtime.onInstalled.addListener(async () => {
    await syncContentScripts();
    await updateIcon();
  });

  // 浏览器重启后图标要与存储状态一致
  browser.runtime.onStartup.addListener(async () => {
    await syncContentScripts();
    await updateIcon();
  });
});
