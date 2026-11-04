import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpRightIcon, PlusIcon } from '@phosphor-icons/react';
import { BrandMark } from '@/components/brand-mark';
import { ChromeMark } from '@/components/chrome-mark';
import { LightModePreview } from '@/components/light-mode-preview';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/reveal';

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/always-light-mode/njnammmpdodmfkodnfpammnpdcbhnlcm';
const GITHUB_URL = 'https://github.com/chen86860/always-light-mode';

export const Route = createFileRoute('/')({ component: LandingPage });

const features = [
  { title: 'Beats built-in dark themes', body: 'Sites that switch to dark on their own, through media queries, theme classes or saved settings, still load light.' },
  { title: 'Off for one site, instantly', body: 'Prefer a site in dark? Switch it off there and the page changes in place. The choice is remembered.' },
  { title: 'Open source, no tracking', body: 'No analytics and no account. Every line that runs in your browser is on GitHub.', link: { href: GITHUB_URL, label: 'Read the source' } },
];

const steps = [
  { title: 'Add it to Chrome', body: 'Install free from the Chrome Web Store. It works right away.' },
  { title: 'Pin it to the toolbar', body: 'Keep the switch one click away.' },
  { title: 'Choose what stays light', body: 'Use the main switch for every site, or turn it off for the current one.' },
];

const questions = [
  { question: 'Will it change my system theme?', answer: 'No. Keep your computer in dark mode. The extension changes how websites display inside your browser.' },
  { question: 'Can I turn it off for one website?', answer: 'Yes. Open the extension and use the site switch. Your preference is saved, so the site stays excluded next time.' },
  { question: 'Does it work on every website?', answer: 'It works with many common dark themes, but some sites only have a dark design. Browser settings pages and the Chrome Web Store cannot be changed by extensions.' },
  { question: 'Which browsers can I use?', answer: 'Install from the Chrome Web Store on Chrome, Edge, Brave, Arc and other compatible Chromium browsers. Firefox users can build it from the source project.', link: { href: `${GITHUB_URL}#development`, label: 'Firefox build steps' } },
  { question: 'Does it track my browsing?', answer: 'The extension does not include analytics or track your browsing. Preferences use your browser’s sync storage. Feedback is shared only when you choose to send it by email.', id: 'privacy' },
  { question: 'What if a page looks wrong?', answer: 'Open the extension and turn it off for that site. You can also use the feedback option to tell us which website needs attention.' },
];

const navigation = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'questions', label: 'Questions' },
];

// 首屏右上角缓慢旋转的光芒，纯装饰
function SunBurst() {
  return (
    <svg className="sun-burst" viewBox="0 0 400 400" aria-hidden="true">
      <g className="sun-rays">
        {Array.from({ length: 24 }, (_, index) => <rect key={index} x="197" y="8" width="6" height={index % 2 ? 44 : 72} rx="3" transform={`rotate(${index * 15} 200 200)`} />)}
      </g>
      <circle className="sun-core" cx="200" cy="200" r="96" />
    </svg>
  );
}

function InstallButton({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  return (
    <Button size={size} className={cn('rounded-full bg-brand-strong px-5 text-white hover:bg-brand-strong/90 [&_svg]:size-4', size === 'sm' && 'min-h-10 px-4 has-data-[icon=inline-start]:pl-3.5')} nativeButton={false} render={<a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" />}>
      <ChromeMark data-icon="inline-start" />Add to Chrome
    </Button>
  );
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
          <InstallButton size="sm" />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero-band" id="intro" aria-labelledby="hero-title">
          <SunBurst />
          <div className="shell relative">
            <h1 className="hero-title" id="hero-title">Every website.<br />Always <span className="hero-highlight">light.</span></h1>
            <p className="hero-detail">A free browser extension that keeps every site in light mode, even when the site or your system prefers dark.</p>
            <div className="hero-actions"><InstallButton /><span>Works on Chrome, Edge, Brave and Arc. Free, no account.</span></div>
            <LightModePreview />
          </div>
        </section>

        <section className="shell section-space" id="features" aria-labelledby="features-title">
          <h2 id="features-title" className="section-title">Light pages. Nothing else changes.</h2>
          <div className="feature-row">
            {features.map(({ title, body, link }) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
                {link && <a className="text-link mt-4" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRightIcon aria-hidden="true" /></a>}
              </article>
            ))}
          </div>
        </section>

        <section className="shell section-space control-layout" id="how-it-works" aria-labelledby="controls-title">
          <div>
            <h2 id="controls-title" className="section-title">Set up in a minute.</h2>
            <ol className="steps-list">
              {steps.map(({ title, body }, index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}
            </ol>
          </div>
          <Reveal className="controls-screenshot">
            <img src="/extension-controls.webp" alt="Extension panel with the Force light mode switch, a separate github.com switch and Email feedback" width={520} height={380} loading="lazy" />
          </Reveal>
        </section>

        <section className="shell section-space questions-layout" id="questions" aria-labelledby="questions-title">
          <div>
            <h2 id="questions-title" className="section-title">Questions</h2>
            <a href="mailto:support@emmmm.dev" className="text-link mt-4">Ask us something else<ArrowUpRightIcon aria-hidden="true" /></a>
          </div>
          <div className="questions-list">
            {questions.map(({ question, answer, id, link }) => (
              <details key={question} id={id}>
                <summary><h3>{question}</h3><PlusIcon aria-hidden="true" /></summary>
                <p>{answer}{link && <> <a className="underline underline-offset-4" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></>}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing-band" aria-labelledby="closing-title">
          <div className="shell closing-layout">
            <h2 id="closing-title">Bright pages,<br />every time you browse.</h2>
            <InstallButton />
          </div>
        </section>
      </main>

      <footer className="shell site-footer"><BrandMark /><nav aria-label="Footer navigation"><a href="#privacy" className="nav-link" onClick={() => { const item = document.getElementById('privacy'); if (item instanceof HTMLDetailsElement) item.open = true; }}>Privacy</a><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a><a href="mailto:support@emmmm.dev" className="nav-link">Contact</a></nav><p>© {new Date().getFullYear()} Always Light Mode</p></footer>
    </div>
  );
}
