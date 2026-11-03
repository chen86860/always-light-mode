import { describe, expect, it } from 'vitest';
import { buildFeedbackEmail } from './feedback-email';

describe('卸载反馈邮件', () => {
  it('保留版本、原因及完整中文内容，网址和特殊符号不会破坏邮件参数', () => {
    const site = 'https://example.com/?a=1&b=中文#section';
    const message = '显示异常 & 标题\n第二行 + 100%';
    const url = new URL(buildFeedbackEmail({ reason: 'broke', reasonLabel: '页面异常', site: ` ${site} `, details: message, version: '1.7.0' }));
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('support@emmmm.dev');
    expect(url.searchParams.get('subject')).toBe('[Always Light Mode v1.7.0] Uninstall feedback - broke');
    expect(url.searchParams.get('body')).toBe(`Reason: 页面异常\n\nSite: ${site}\n\n${message}`);
    expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
  });
  it('允许只选择原因，不要求填写可选项', () => {
    const url = new URL(buildFeedbackEmail({ reason: 'notNeeded', reasonLabel: '不再需要', site: ' ', details: '' }));
    expect(url.searchParams.get('subject')).toBe('[Always Light Mode] Uninstall feedback - notNeeded');
    expect(url.searchParams.get('body')).toBe('Reason: 不再需要');
  });
});
