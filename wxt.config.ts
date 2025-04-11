import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Always Light Mode',
    description:
      'This extension injects custom scripts to force websites into light mode, even when the system is set to dark mode.',
    permissions: ['storage', 'activeTab'],
    action: {
      default_icon: {
        128: 'icon/128.png',
      },
    },
  },
});
