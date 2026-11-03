export const SUPPORT_EMAIL = 'support@emmmm.dev';

export function buildFeedbackEmail({ reason, reasonLabel, site, details, version }: {
  reason: string; reasonLabel: string; site: string; details: string; version?: string;
}) {
  const subject = `[Always Light Mode${version ? ` v${version}` : ''}] Uninstall feedback - ${reason}`;
  const body = [`Reason: ${reasonLabel}`, site.trim() && `Site: ${site.trim()}`, details.trim()].filter(Boolean).join('\n\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
