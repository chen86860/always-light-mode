import { lightModeEnabledStorage } from './utils/storage';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main: async () => {
    const isEnabled = await lightModeEnabledStorage.getValue();

    if (isEnabled) {
      const removeDarkModeMediaQueries = () => {
        // Get all stylesheets
        const stylesheets = document.styleSheets;

        for (let i = 0; i < stylesheets.length; i++) {
          const stylesheet = stylesheets[i];
          try {
            // Get all CSS rules
            const rules = stylesheet.cssRules || stylesheet.rules;
            if (!rules) continue;

            // Track rules to remove
            const rulesToRemove = [];

            // Find rules with dark mode media query
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-color-scheme: dark')) {
                rulesToRemove.push(j);
              }
            }

            // Remove rules in reverse order to maintain correct indices
            for (let j = rulesToRemove.length - 1; j >= 0; j--) {
              stylesheet.deleteRule(rulesToRemove[j]);
            }
          } catch (e) {
            // Skip stylesheets that can't be accessed due to CORS
            console.warn('Could not access stylesheet:', e);
          }
        }
      };

      // Remove dark mode media queries
      removeDarkModeMediaQueries();

      // Override matchMedia
      (function () {
        const originalMatchMedia = window.matchMedia;

        window.matchMedia = function (query) {
          if (query === '(prefers-color-scheme: light)') {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => false,
            };
          }

          if (query === '(prefers-color-scheme: dark)') {
            return {
              matches: false,
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => false,
            };
          }

          return originalMatchMedia(query);
        };
      })();

      document.documentElement.classList?.remove('dark');

      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = 'light';

      if (document.head) {
        document.head.appendChild(meta);
      }
    }
  },
});
