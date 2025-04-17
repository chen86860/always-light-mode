export const removeDarkSheets = (stylesheet: CSSStyleSheet | CSSLayerBlockRule) => {
  try {
    // Get all CSS rules
    const rules = stylesheet?.cssRules;
    if (!rules) return;

    // Track rules to remove
    const rulesToRemove = [];

    // Find rules with dark mode media query
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (rule instanceof CSSLayerBlockRule) {
        removeDarkSheets(rule);
      }

      if (
        rule instanceof CSSMediaRule &&
        (rule.conditionText.includes('prefers-color-scheme: dark') ||
          rule.conditionText.includes('prefers-color-scheme:dark'))
      ) {
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
};

export const removeDarkModeMediaQueries = () => {
  // Get all stylesheets
  const stylesheets = document.styleSheets;

  for (let i = 0; i < stylesheets.length; i++) {
    const stylesheet = stylesheets[i];
    removeDarkSheets(stylesheet);
  }
};
