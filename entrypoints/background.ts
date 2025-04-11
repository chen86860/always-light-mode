import { lightModeEnabledStorage } from './utils/storage';

export default defineBackground(async () => {
  // Handle icon click
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
            128: 'icon/light-128.png',
          },
    });

    // Reload current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.reload(tabs[0].id);
    }
  });
});
