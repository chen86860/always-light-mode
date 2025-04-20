// This script is injected into the page when the extension is installed.
// It overrides the matchMedia function to always return a light mode.
(function () {
  const originalMatchMedia = window.matchMedia;

  window.matchMedia = function (query) {
    if (query === '(prefers-color-scheme: dark)') {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      };
    }

    if (query === '(prefers-color-scheme: light)') {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      };
    }

    return originalMatchMedia(query);
  };
})();
