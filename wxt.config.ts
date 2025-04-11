import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Always Light Mode',
    description: 'Always light mode',
    permissions: ['storage', 'tabs', 'activeTab'],
    action: {
      default_icon: {
        128: 'icon/128.png',
      },
    },
  },
});
