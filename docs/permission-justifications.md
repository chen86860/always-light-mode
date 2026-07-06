# Chrome Web Store — Permission Justifications

Store console → Privacy practices → Permission justification. One block per field.

## scripting

Used solely to register/unregister the extension's own bundled content scripts at runtime
(chrome.scripting.registerContentScripts). Dynamic registration is how the on/off switch and
per-site exclusions (excludeMatches) take effect: one script runs in the page's MAIN world,
which cannot access chrome.storage, so honoring the user's settings requires adding or
removing the registration itself. No remote or user-supplied code is ever executed.

## Host permission (<all_urls>)

The extension's single purpose is to force any website the user visits into light mode.
Dark styling can appear on any site, so the content scripts (which remove dark CSS rules and
neutralize dark-theme markers) must be registerable for all URLs. The broad host access is
also what allows per-site exclusions to work: sites the user opts out are excluded from the
registration via excludeMatches. The extension does not read, collect, or transmit any page
content; it only modifies CSS rules and theme-related attributes locally.

## storage

Stores exactly two settings in chrome.storage.sync: the global on/off flag and the list of
hostnames the user excluded. Sync scope is used so the user's preference follows their
browser account. No browsing history, page content, or personal data is stored.

## activeTab

Used to read the active tab's hostname when the popup opens (to label and apply the
per-site switch) and to reload the current tab after the user toggles a switch, so the new
setting takes effect immediately.
