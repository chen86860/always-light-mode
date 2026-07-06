export const DARK_CONDITION = /prefers-color-scheme\s*:\s*dark/i;
export const LIGHT_CONDITION = /prefers-color-scheme\s*:\s*light/i;

const DARK_CONDITION_G = /prefers-color-scheme\s*:\s*dark/gi;
const LIGHT_CONDITION_G = /prefers-color-scheme\s*:\s*light/gi;

// dark → 恒假、light → 恒真；改写而非删除，保证可以无刷新还原
const ALWAYS_FALSE = 'min-width: 999999px';
const ALWAYS_TRUE = 'min-width: 0px';

interface MediaEdit {
  media: MediaList;
  original: string;
}

/** 所有被改写过的媒体条件，disable 时按记录还原 */
const mediaEdits: MediaEdit[] = [];

const rewriteMediaList = (media: MediaList) => {
  const original = media.mediaText;
  if (!DARK_CONDITION.test(original) && !LIGHT_CONDITION.test(original)) return;
  try {
    media.mediaText = original
      .replace(DARK_CONDITION_G, ALWAYS_FALSE)
      .replace(LIGHT_CONDITION_G, ALWAYS_TRUE);
    mediaEdits.push({ media, original });
  } catch {
    // 个别只读 MediaList，跳过
  }
};

/**
 * 递归改写样式表中的暗色/亮色媒体条件。
 * 覆盖 @media、@import（含媒体条件）、以及 @layer/@supports/@container 等分组规则的嵌套内容。
 * 跨域样式表（CORS）无法访问 cssRules，静默跳过。
 */
export const neutralizeDarkRules = (sheet: CSSStyleSheet | CSSGroupingRule) => {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    return;
  }
  if (!rules) return;

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    if (rule instanceof CSSMediaRule) {
      rewriteMediaList(rule.media);
      neutralizeDarkRules(rule);
    } else if (rule instanceof CSSImportRule) {
      rewriteMediaList(rule.media);
      if (rule.styleSheet) {
        neutralizeDarkRules(rule.styleSheet);
      }
    } else if (rule instanceof CSSGroupingRule) {
      neutralizeDarkRules(rule);
    }
  }
};

/**
 * 处理某个根节点（document 或 shadow root）下所有可访问的样式表，
 * 包括 adoptedStyleSheets（constructed stylesheets）。
 */
export const neutralizeDarkStyles = (root: Document | ShadowRoot = document) => {
  for (const sheet of Array.from(root.styleSheets)) {
    neutralizeDarkRules(sheet);
  }

  try {
    for (const sheet of root.adoptedStyleSheets) {
      neutralizeDarkRules(sheet);
    }
  } catch {
    // 某些环境下跨 world 访问 adoptedStyleSheets 会失败，忽略
  }
};

/** 无刷新还原所有被改写的媒体条件 */
export const restoreDarkRules = () => {
  for (const edit of mediaEdits) {
    try {
      edit.media.mediaText = edit.original;
    } catch {
      // 规则可能已随样式表移除
    }
  }
  mediaEdits.length = 0;
};
