import { describe, expect, it } from 'vitest';
import { resolveCopy } from './copy';

describe('卸载页语言路由', () => {
  it.each(['en-US', 'zh_CN', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'ja-JP', 'ko-KR', 'pt-BR', 'ru-RU'])('保留 %s 的完整反馈文案', (lang) => {
    const { locale, copy } = resolveCopy(lang);
    expect(locale).toBe(lang.split(/[-_]/)[0]);
    expect(Object.keys(copy.reasons)).toEqual(['broke', 'noEffect', 'notNeeded', 'other']);
    expect(copy.submit).toBeTruthy();
  });
  it.each([undefined, '', 'unknown', '__proto__', 'constructor'])('未知输入 %s 回退英文', (lang) => {
    expect(resolveCopy(lang).locale).toBe('en');
  });
});
