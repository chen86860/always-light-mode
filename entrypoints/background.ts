import { lightModeEnabledStorage } from './utils/storage';

export default defineBackground(async () => {
  browser.action.onClicked.addListener(async () => {
    const isLightModeEnabled = await lightModeEnabledStorage.getValue();

    lightModeEnabledStorage.setValue(!isLightModeEnabled);

    // Update icon
    await browser.action.setIcon({
      path: isLightModeEnabled
        ? {
            128: 'icon/dark-128.png',
          }
        : {
            128: 'icon/128.png',
          },
    });

    // Reload current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.reload(tabs[0].id);
    }
  });

  // 使用 browser.scripting.executeScript 注入脚本
  // try {
  //   const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  //   if (tabs[0]?.id) {
  //     await browser.scripting.executeScript({
  //       target: { tabId: tabs[0].id },
  //       files: ['content-scripts/inject-script.js'],
  //     });
  //   }
  // } catch (e) {
  //   console.warn('Failed to inject script:', e);
  // }
});
