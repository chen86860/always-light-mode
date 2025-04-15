import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Always Light Mode',
    description: 'Keep websites in light mode, regardless of your system dark mode settings.',
    permissions: ['storage', 'activeTab'],
    action: {
      default_icon: {
        128: 'icon/128.png',
      },
    },
  },
});
