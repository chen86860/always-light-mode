export const DARK_CONDITION = /prefers-color-scheme\s*:\s*dark/i;

/**
 * 递归删除样式表中的暗色媒体查询规则。
 * 覆盖 @media、@import（含媒体条件）、以及 @layer/@supports/@container 等分组规则的嵌套内容。
 * 跨域样式表（CORS）无法访问 cssRules，静默跳过。
 */
export const removeDarkRules = (sheet: CSSStyleSheet | CSSGroupingRule) => {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    return;
  }
  if (!rules) return;

  // 倒序遍历，删除时不影响未处理的索引
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];

    if (rule instanceof CSSMediaRule && DARK_CONDITION.test(rule.conditionText)) {
      sheet.deleteRule(i);
    } else if (rule instanceof CSSImportRule) {
      if (DARK_CONDITION.test(rule.media.mediaText)) {
        sheet.deleteRule(i);
      } else if (rule.styleSheet) {
        removeDarkRules(rule.styleSheet);
      }
    } else if (rule instanceof CSSGroupingRule) {
      removeDarkRules(rule);
    }
  }
};

/**
 * 清理某个根节点（document 或 shadow root）下所有可访问的样式表，
 * 包括 adoptedStyleSheets（constructed stylesheets）。
 */
export const removeDarkModeMediaQueries = (root: Document | ShadowRoot = document) => {
  for (const sheet of Array.from(root.styleSheets)) {
    removeDarkRules(sheet);
  }

  try {
    for (const sheet of root.adoptedStyleSheets) {
      removeDarkRules(sheet);
    }
  } catch {
    // 某些环境下跨 world 访问 adoptedStyleSheets 会失败，忽略
  }
};
