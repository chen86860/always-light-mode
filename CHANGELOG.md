# Changelog

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
