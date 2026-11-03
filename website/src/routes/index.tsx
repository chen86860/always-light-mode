import { createFileRoute } from '@tanstack/react-router';
import { ArrowDown, ArrowUpRight, Check, Globe2, MousePointer2, SlidersHorizontal } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { GithubMark } from '@/components/github-mark';
import { LightModePreview } from '@/components/light-mode-preview';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/always-light-mode/njnammmpdodmfkodnfpammnpdcbhnlcm';
const GITHUB_URL = 'https://github.com/chen86860/always-light-mode';

export const Route = createFileRoute('/')({ component: LandingPage });

const questions = [
  { question: 'Will it change my system theme?', answer: 'No. Keep your computer in dark mode. The extension changes how websites display inside your browser.' },
  { question: 'Can I turn it off for one website?', answer: 'Yes. Open the extension and use the site switch. Your preference is saved, so the site stays excluded next time.' },
  { question: 'Does it work on every website?', answer: 'It works with many common dark themes, but some sites only have a dark design. Browser settings pages and the Chrome Web Store cannot be changed by extensions.' },
  { question: 'Which browsers can I use?', answer: 'Install from the Chrome Web Store on Chrome, Edge, Brave, Arc and other compatible Chromium browsers. Firefox builds are available from the source project.' },
  { question: 'Does it track my browsing?', answer: 'The extension does not include analytics or track your browsing. Preferences use your browser’s sync storage. Feedback is shared only when you choose to send it by email.', id: 'privacy' },
  { question: 'What if a page looks wrong?', answer: 'Open the extension and turn it off for that site. You can also use the feedback option to tell us which website needs attention.' },
];

function InstallButton({ header = false }: { header?: boolean }) {
  return <Button size={header ? 'sm' : 'lg'} nativeButton={false} render={<a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" />}>
    {header ? <><span className="sm:hidden">Install</span><span className="hidden sm:inline">Add to Chrome</span></> : 'Add to Chrome'}<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
  </Button>;
}

function LandingPage() {
  return (
    <>
      <header className="site-header shell">
        <div className="navigation-surface">
          <BrandMark />
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <a href="#features" className="nav-link">Why light?</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#questions" className="nav-link">Questions</a>
          </nav>
          <InstallButton header />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="shell hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><span className="brand-dot" /> For the light mode people</p>
            <h1 className="hero-title">Stay on the<br />bright side.</h1>
            <p className="hero-description">Your system can go dark.<br className="hidden sm:block" /> Your favorite websites don’t have to.</p>
            <p className="max-w-md text-base text-muted-foreground">Keep websites in light mode, with a simple switch for the places you want to leave alone.</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <InstallButton />
              <a href="#how-it-works" className="text-link">See how it works<ArrowDown className="size-4" aria-hidden="true" /></a>
            </div>
            <div className="hero-assurance"><span><Check className="size-4" aria-hidden="true" /> Free to use</span><span><Check className="size-4" aria-hidden="true" /> Open source</span><span><Check className="size-4" aria-hidden="true" /> No tracking</span></div>
          </div>
          <LightModePreview />
        </section>

        <div className="shell compatibility-line"><span>A small extension. A familiar browser.</span><p>Chrome <span aria-hidden="true">/</span> Edge <span aria-hidden="true">/</span> Brave <span aria-hidden="true">/</span> Arc</p></div>

        <section className="shell section-space" id="features" aria-labelledby="features-title">
          <Reveal className="section-heading"><p className="eyebrow">Your browser, your call</p><h2 id="features-title">Less adjusting.<br />More browsing.</h2><p>One preference for your everyday websites.<br className="hidden sm:block" /> Room for the exceptions.</p></Reveal>
          <div className="benefit-layout">
            <Reveal className="benefit-main">
              <div className="benefit-illustration" aria-hidden="true"><Globe2 className="size-24" strokeWidth={1} /><span className="orbit-label">Light, by default</span></div>
              <div><p className="feature-number">01 / Make it yours</p><h3>Dark system.<br />Light websites.</h3><p>Keep the system theme you like. Always Light Mode asks websites to use their light appearance and overrides common dark themes.</p></div>
            </Reveal>
            <div className="benefit-stack">
              <Reveal className="benefit-small"><SlidersHorizontal className="size-8" strokeWidth={1.5} aria-hidden="true" /><div><p className="feature-number">02 / Keep the exceptions</p><h3>A switch for each site.</h3><p>Prefer a particular site in dark mode? Turn the extension off just there. Your choice is remembered.</p></div></Reveal>
              <Reveal className="benefit-small"><MousePointer2 className="size-8" strokeWidth={1.5} aria-hidden="true" /><div><p className="feature-number">03 / Get on with your day</p><h3>Install. Then just browse.</h3><p>Light mode starts working after installation. No account, setup wizard or theme to configure.</p></div></Reveal>
            </div>
          </div>
        </section>

        <section className="section-space control-section" id="how-it-works" aria-labelledby="controls-title">
          <div className="shell control-layout">
            <Reveal>
              <p className="eyebrow">Simple by design</p>
              <h2 id="controls-title" className="section-title">A little control.<br />A lighter everyday.</h2>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">Everything you need lives in one small panel. Change your mind whenever you like.</p>
              <ol className="steps-list">
                <li><span>01</span><div><h3>Add it to your browser</h3><p>Install the free extension from the Chrome Web Store.</p></div></li>
                <li><span>02</span><div><h3>Keep it within reach</h3><p>Pin the extension to your toolbar for easy access.</p></div></li>
                <li><span>03</span><div><h3>Choose what stays light</h3><p>Use the main switch for all sites, or make an exception for the current one.</p></div></li>
              </ol>
            </Reveal>
            <Reveal className="controls-figure">
              <figure><img src="/screenshot-2-controls.png" alt="Always Light Mode panel showing the main switch, a separate switch for the current website and email feedback" width={1280} height={800} loading="lazy" className="h-auto w-full rounded-2xl" /><figcaption>A main switch, a site switch, and a way to send feedback.</figcaption></figure>
              <a className="text-link mt-6" href={GITHUB_URL} target="_blank" rel="noopener noreferrer"><GithubMark className="size-4" />See what’s under the hood<ArrowUpRight className="size-4" aria-hidden="true" /></a>
            </Reveal>
          </div>
        </section>

        <section className="shell section-space questions-layout" id="questions" aria-labelledby="questions-title">
          <div><p className="eyebrow">A few things to know</p><h2 id="questions-title" className="section-title">Clear answers.<br />No guesswork.</h2><p className="mt-6 max-w-xs text-base text-muted-foreground">Something else on your mind?</p><a href="mailto:support@emmmm.dev" className="text-link mt-4">Get in touch<ArrowUpRight className="size-4" aria-hidden="true" /></a></div>
          <div className="questions-list">{questions.map(({ question, answer, id }) => <article key={question} id={id}><h3>{question}</h3><p>{answer}</p></article>)}</div>
        </section>

        <section className="shell pb-16 md:pb-24" aria-labelledby="closing-title"><Reveal className="closing-panel"><div><p className="eyebrow">A brighter default</p><h2 id="closing-title" className="section-title">Make yourself<br className="sm:hidden" /> at light.</h2><p className="mt-4 text-base text-muted-foreground">Free, open source, and ready when you are.</p></div><InstallButton /></Reveal></section>
      </main>

      <footer className="shell site-footer"><BrandMark /><nav aria-label="Footer navigation"><a href="#privacy" className="nav-link">Privacy</a><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a><a href="mailto:support@emmmm.dev" className="nav-link">Contact</a></nav><p>© {new Date().getFullYear()} Always Light Mode</p></footer>
    </>
  );
}
