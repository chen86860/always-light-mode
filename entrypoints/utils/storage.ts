export const lightModeEnabledStorage = storage.defineItem<boolean>('sync:isLightModeEnabled', {
  fallback: true,
});

/** Hostnames where the user turned light mode off via the context menu */
export const disabledSitesStorage = storage.defineItem<string[]>('sync:disabledSites', {
  fallback: [],
});
