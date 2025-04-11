import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Always Light Mode',
    description: 'Always light mode',
    permissions: ['<all_urls>'],
  },
});
