import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Mail } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { resolveCopy } from '@/components/uninstall/copy';
import UninstallForm from '@/components/uninstall/uninstall-form';

export const Route = createFileRoute('/uninstall')({
  validateSearch: (search: Record<string, unknown>): { v?: string; lang?: string } => ({
    v: typeof search.v === 'string' ? search.v.slice(0, 64) : undefined,
    lang: typeof search.lang === 'string' ? search.lang.slice(0, 35) : undefined,
  }),
  head: () => ({ meta: [{ title: 'Always Light Mode — Uninstall feedback' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: UninstallPage,
});

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/always-light-mode/njnammmpdodmfkodnfpammnpdcbhnlcm';

/** 插件卸载后由 runtime.setUninstallURL 打开：/uninstall?v=<版本>&lang=<UI 语言> */
function UninstallPage() {
  const { v, lang } = Route.useSearch();
  const { locale, copy } = resolveCopy(lang);

  return (
    <div lang={locale} className="min-h-dvh">
      <header className="shell feedback-header">
        <BrandMark />
        <a href="/" className="text-link"><ArrowLeft className="size-4" aria-hidden="true" />{copy.back}</a>
      </header>

      <main id="main-content" tabIndex={-1} className="shell feedback-layout">
        <div className="feedback-intro">
          <p className="eyebrow"><span className="brand-dot" />{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          <div className="mt-8 flex items-start gap-3"><Mail className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="text-base text-muted-foreground">{copy.emailNote}</p></div>
          <p className="mt-8">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            {copy.reinstall}
          </a>
          </p>
        </div>
        <UninstallForm copy={copy} version={v} />
      </main>
    </div>
  );
}
