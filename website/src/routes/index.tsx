import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowDown, ArrowUpRight, Check, Sun } from '@phosphor-icons/react';
import { BrandMark } from '@/components/brand-mark';
import { GithubMark } from '@/components/github-mark';
import { LightModePreview } from '@/components/light-mode-preview';
import { TaglineReveal } from '@/components/tagline-reveal';
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

const navigation = [
  { id: 'features', label: 'Why light?' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'questions', label: 'Questions' },
];

function InstallButton({ header = false }: { header?: boolean }) {
  return <Button size={header ? 'sm' : 'lg'} nativeButton={false} render={<a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" />}>
    {header ? <><span className="sm:hidden">Install</span><span className="hidden sm:inline">Add to Chrome</span></> : 'Add to Chrome'}<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
  </Button>;
}

function LandingPage() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      }
    }, { rootMargin: '-20% 0px -50% 0px' });
    const sections = document.querySelectorAll('.landing-page section[id]');
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <header className="site-header">
        <div className="navigation-surface">
          <BrandMark />
          <nav aria-label="Main navigation" className="main-navigation">
            {navigation.map(({ id, label }) => <a key={id} href={`#${id}`} className="nav-link" aria-current={activeSection === id ? 'location' : undefined}>{label}</a>)}
          </nav>
          <InstallButton header />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="shell hero-section" id="intro" aria-labelledby="hero-title">
          <div className="hero-intro">
            <h1 className="hero-title" id="hero-title">Dark system.<br />Light websites.</h1>
            <div className="hero-copy">
              <p className="hero-description">Stay on the bright side.</p>
              <p className="hero-detail">Keep your favorite websites in light mode, even when your system goes dark. One extension. Your preference.</p>
              <div className="hero-actions"><InstallButton /><span>Free. No account needed.</span></div>
            </div>
          </div>
          <LightModePreview />
          <div className="compatibility-line"><p>At home in your browser.</p><p className="browser-list"><span>Chrome</span><span>Edge</span><span>Brave</span><span>Arc</span></p><a href="#how-it-works" className="text-link">Take a closer look<ArrowDown aria-hidden="true" /></a></div>
        </section>

        <section className="shell section-space benefits-section" id="features" aria-labelledby="features-title">
          <div className="benefits-intro">
            <h2 id="features-title" className="section-title">Your preference.<br />Not your system’s.</h2>
            <p>Light pages shouldn’t mean changing everything else. Keep the look you like, with room for exceptions.</p>
            <div className="appearance-note" aria-hidden="true"><Sun weight="light" /><span>A brighter default.<br /><strong>Nothing else to adjust.</strong></span></div>
          </div>
          <div className="benefits-list">
            <article><h3>Leave your desktop alone.</h3><p>Keep your system in dark mode. The extension asks websites for their light appearance and overrides common dark themes.</p></article>
            <article><h3>Make room for exceptions.</h3><p>Like a particular site dark? Turn the extension off just there. Your choice is remembered the next time you visit.</p></article>
            <article><h3>Set it. Then forget it.</h3><p>Light mode starts working after installation. No account, setup wizard or theme to configure.</p></article>
          </div>
        </section>

        <section className="tagline-section" aria-label="A lighter web">
          <div className="shell tagline-layout"><Sun className="tagline-sun" weight="thin" aria-hidden="true" /><TaglineReveal /><p>A small extension.<br />A difference you can see.</p></div>
        </section>

        <section className="shell section-space control-layout" id="how-it-works" aria-labelledby="controls-title">
          <div>
            <h2 id="controls-title" className="section-title">A little control.<br />A lighter everyday.</h2>
            <p className="section-description">Everything you need, in one small panel.</p>
            <ol className="steps-list">
              <li><span>1</span><div><h3>Add it to your browser</h3><p>Install the free extension from the Chrome Web Store.</p></div></li>
              <li><span>2</span><div><h3>Keep it within reach</h3><p>Pin the extension to your toolbar for easy access.</p></div></li>
              <li><span>3</span><div><h3>Choose what stays light</h3><p>Use the main switch for all sites, or make an exception for the current one.</p></div></li>
            </ol>
          </div>
          <Reveal className="controls-figure">
            <figure>
              <div className="controls-screenshot"><img src="/extension-controls.webp" alt="Extension panel with the Force light mode switch, a separate github.com switch and Email feedback" width={520} height={380} loading="lazy" /></div>
              <figcaption>Your whole setup. Not another settings page.</figcaption>
            </figure>
          </Reveal>
        </section>

        <section className="shell source-section" aria-labelledby="source-title">
          <GithubMark className="source-mark" />
          <div><h2 id="source-title">Nothing hidden. Including the code.</h2><p>Free to use, open source, and no browsing analytics. See exactly what runs in your browser.</p></div>
          <a className="text-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Explore on GitHub<ArrowUpRight aria-hidden="true" /></a>
        </section>

        <section className="shell section-space questions-layout" id="questions" aria-labelledby="questions-title">
          <div><h2 id="questions-title" className="section-title">Good questions.<br />Clear answers.</h2><p className="section-description">Something else on your mind?</p><a href="mailto:support@emmmm.dev" className="text-link mt-4">Get in touch<ArrowUpRight aria-hidden="true" /></a></div>
          <div className="questions-list">{questions.map(({ question, answer, id }) => <article key={question} id={id}><h3>{question}</h3><p>{answer}</p></article>)}</div>
        </section>

        <section className="shell closing-section" aria-labelledby="closing-title">
          <div className="closing-panel"><Sun weight="light" className="closing-sun" aria-hidden="true" /><div><h2 id="closing-title">Make yourself<br />at light.</h2><p>Your browser. A brighter default.</p></div><div className="closing-action"><InstallButton /><p><Check aria-hidden="true" /> Free, open source, no tracking</p></div></div>
        </section>
      </main>

      <footer className="shell site-footer"><BrandMark /><nav aria-label="Footer navigation"><a href="#privacy" className="nav-link">Privacy</a><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a><a href="mailto:support@emmmm.dev" className="nav-link">Contact</a></nav><p>© {new Date().getFullYear()} Always Light Mode</p></footer>
    </div>
  );
}
