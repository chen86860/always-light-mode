export default defineContentScript({
  registration: 'runtime',
  main(ctx) {
    console.log('Script was executed!');

    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      value: function (query: string) {
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
      },
      configurable: true,
      writable: true,
    });

    return 'Hello John!';
  },
});
