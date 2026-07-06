/**
 * 名字里不含 dark/night 字样、但实际是暗色的常见主题名。
 * 主要来自 daisyUI 内置主题，供属性值与 localStorage 值的整值匹配使用
 * （含 dark/night 的值走子串匹配，无需列在这里）。
 */
export const DARK_THEME_NAMES = new Set([
  'dracula',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'luxury',
  'business',
  'coffee',
  'dim',
  'sunset',
  'abyss',
  'aqua',
]);
