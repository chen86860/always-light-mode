import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import stylesheet from '@/styles/globals.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Always Light Mode — Stay on the bright side' },
      { name: 'description', content: 'Keep your favorite websites in light mode, even when your system goes dark. Free, open source, with a simple switch for every site.' },
      { name: 'color-scheme', content: 'light' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Always Light Mode — Stay on the bright side' },
      { property: 'og:description', content: 'Your system can go dark. Your favorite websites don’t have to. A free browser extension with a simple switch for every site.' },
      { property: 'og:image', content: 'https://always-light-mode.emmmm.dev/screenshot-1-hero.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'stylesheet', href: stylesheet }, { rel: 'icon', href: '/icon.png' }, { rel: 'preload', href: '/fonts/geist-400.ttf', as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' }],
  }),
  component: Root,
  notFoundComponent: () => <main id="main-content" tabIndex={-1} className="not-found"><BrandMark /><p className="eyebrow">404 / A wrong turn</p><h1 className="section-title">Let’s get you<br />back to the light.</h1><p className="text-lg text-muted-foreground">This page doesn’t exist. The homepage is a good place to start.</p><Button nativeButton={false} render={<a href="/" />}><ArrowLeft data-icon="inline-start" aria-hidden="true" />Back to home</Button></main>,
});

function Root() {
  return <html lang="en"><head><HeadContent /></head><body><a href="#main-content" className="skip-link">Skip to content</a><Outlet /><Toaster /><Scripts /></body></html>;
}
