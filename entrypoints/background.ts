import { syncContentScripts, updateIcon } from './utils/registration';

export default defineBackground(() => {
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
