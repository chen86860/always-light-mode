# Changelog

## 1.4.0 (2026-07-06)

### Added

- **Stored theme preference interception.** Sites that boot into dark mode by reading a saved
  preference (`localStorage.theme`, `darkMode`, `color-mode` and similar keys, including JSON
  values like `{"mode":"dark"}`) now read `light` at the source: `Storage.prototype.getItem`
  is patched and `window.localStorage` is wrapped in a Proxy to cover property-style reads
  (`localStorage.theme`). Gated on the extension toggle — reads pass through unchanged when
  disabled — and degrades silently in sandboxed iframes.
- **Dark theme name dictionary** (`utils/theme-names.ts`): theme attribute and stored values
  that are dark themes without "dark" in the name (daisyUI's dracula, synthwave, black, dim,
  coffee, …) are rewritten to `light`.

### Changed

- Dark class detection upgraded from a fixed 7-word list to token-level matching: variants
  like `theme--dark`, `is_dark` and `nightmode` are now caught, while `darken` and Tailwind's
  `dark:` variant classes are correctly left alone.
- `color-scheme: light` is now forced on all elements (previously root/body only), covering
  component-level `color-scheme: dark` combined with `light-dark()`.

### Known limitations

- While the extension is enabled, a site's own theme switcher reads the stored preference as
  `light` — by design (dark never flashes), but worth knowing when triaging "my theme setting
  doesn't stick" reports.

## 1.3.0 (2026-07-05)

### Changed

- **Toggling no longer reloads the page.** Dark CSS rules are now neutralized by rewriting
  their media conditions (reversibly) instead of deleting them, and theme markers record
  their original values — so both switches apply and revert instantly on already-open pages.
  The page is only reloaded in the rare case where the content script isn't present yet
  (e.g. re-enabling a previously excluded site). The "Changes reload the page" hint is gone.
- Light-scheme media queries (`prefers-color-scheme: light`) are now forced active, so sites
  that style their light theme behind a light media query render correctly under system dark mode.

### Added

- **E2E test suite** (`pnpm test:e2e`, Playwright): forced-light coverage on a hostile dark
  page, live-toggle round-trips without navigation, popup state machine and feedback mailto.
- **CI** (GitHub Actions): typecheck, Chrome + Firefox builds and E2E on every push/PR.
- **Automated store submission**: pushing a `v*` tag builds, zips and submits to the
  Chrome Web Store via `wxt submit` (see `docs/publishing.md`).
- **Store assets generator** (`pnpm store:assets`): reproducible 1280×800 screenshots and
  440×280 promo tile in `assets/store/`.

### Known limitations

- Constructed stylesheets created while light mode was active keep their rewritten (light)
  conditions after a live toggle-off; a reload fully restores them.
- Sites that themed themselves via `matchMedia` JavaScript at load keep their light theme
  after a live toggle-off until reloaded (CSS-based theming reverts instantly).

## 1.2.0 (2026-07-05)

Major rework of how light mode is enforced, greatly expanding site compatibility.

### Fixed

- **Crash at `document_start` when `<head>` did not exist yet** — the style injection threw and silently killed the rest of the script (including the `matchMedia` patch). This was the main cause of "some sites stay dark".
- Extension icon now reflects the stored on/off state after a browser restart.

### Changed

- **Content scripts are now registered dynamically** from the background via `scripting.registerContentScripts` instead of being declared in the manifest. Whether the extension is enabled (globally or per site) is baked into the registration, so pages no longer race an async storage read at load time.
- **`matchMedia` patch runs synchronously in the page's MAIN world** at `document_start`, before any page script. Dark/light conditions are rewritten and delegated to the native implementation, so a genuine `MediaQueryList` is returned and compound queries like `screen and (prefers-color-scheme: dark)` are handled. The old async `inject.js` (via `web_accessible_resources`) is gone.
- Removing dark CSS rules now recurses into `@import`, `@layer`, `@supports` and `@container`, and only re-processes the stylesheet that actually changed instead of rescanning everything.
- The injected `color-scheme: light` rule uses `!important` and falls back to `documentElement` when `<head>` is not ready.

### Added

- **Popup control panel**: clicking the toolbar icon now opens a small panel with a master switch and a per-site switch, replacing the old click-to-toggle behavior. Per-site exclusions are stored in sync storage and applied via `excludeMatches`. Localized in all 10 languages.
- **Broader theme detection**: 7 common dark class names, and theme attributes `data-theme`, `data-color-mode` (GitHub), `data-bs-theme` (Bootstrap 5.3+), `data-color-scheme`, `data-mode`, `data-scheme`, `data-dark-mode`, `theme`, `color-scheme`, plus inline `style="color-scheme: dark"`. Dark values are rewritten to `light`.
- **Shadow DOM support**: open shadow roots are processed via an `attachShadow` hook plus fallback DOM sweeps.
- **Constructed stylesheets support**: `CSSStyleSheet.replace/replaceSync/insertRule` are intercepted so CSS-in-JS dark rules never apply; `adoptedStyleSheets` are also cleaned.
- `<link media="(prefers-color-scheme: dark)">` stylesheets are disabled wholesale; `<meta name="color-scheme" content="dark">` is rewritten; `<style>` text mutations are re-processed.
- Content scripts now run in all iframes (`allFrames: true`).

### Removed

- Dead/duplicate code: `utils/observer.ts`, `utils/stylesheet.ts`, `utils/override.ts`, `utils/inject-script.content.ts`, `public/inject.js`.

### Permissions

- Added `scripting` and `host_permissions: <all_urls>` (required for dynamic registration); removed `web_accessible_resources`.

### Known limitations

- Closed shadow roots cannot be reached from content scripts.
- On Firefox, the MAIN-world page patch requires Firefox 128+; on older versions the extension falls back to CSS handling only.

## 1.1.0 (2025-04-29)

- Localization support (10 languages).

## 1.0.4 (2025-04-22)

- Updated icons.
- Fixed light mode setting synchronization; moved the storage key to sync scope.

## 1.0.2

- Cleaned up console logs.

## 1.0.1

- Overrode JS theme detection (`matchMedia`) to always report light; improved compatibility.

## 1.0.0

- Initial release.
