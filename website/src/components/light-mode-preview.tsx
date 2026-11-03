import { useState } from 'react';
import { Check, CursorClick, LockSimple, Moon, Sun } from '@phosphor-icons/react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function ReadingPage() {
  return (
    <div className="reading-page">
      <div className="reading-masthead"><span>The everyday</span><span>Notes on a slower web</span></div>
      <div className="reading-story">
        <div className="reading-art" aria-hidden="true"><span className="reading-disc" /><span className="reading-horizon" /></div>
        <div className="reading-copy">
          <p className="reading-category">A moment to yourself</p>
          <h3>A little room<br />to focus.</h3>
          <p>Open a favorite page. Find something worth reading. Stay a little longer.</p>
          <div className="reading-meta"><span>Daily reading</span><span>3 min read</span></div>
        </div>
      </div>
    </div>
  );
}

export function LightModePreview() {
  const [enabled, setEnabled] = useState(true);

  return (
    <figure className="preview-stage" aria-label="Interactive website appearance comparison">
      <div className="preview-browser">
        <div className="preview-toolbar">
          <span className="preview-window-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="preview-address"><LockSimple weight="regular" aria-hidden="true" /> your.favorite.website</span>
          <span className="preview-demo-label">Live demo</span>
        </div>
        <div className="preview-comparison">
          <section className="preview-pane preview-pane-dark" aria-label="Without the extension">
            <div className="preview-pane-label"><span><Moon aria-hidden="true" /> Without the extension</span><span>System: dark</span></div>
            <ReadingPage />
          </section>
          <section className={cn('preview-pane', !enabled && 'preview-pane-dark')} id="theme-preview" aria-label="With Always Light Mode">
            <div className="preview-pane-label"><span><Sun aria-hidden="true" /> With Always Light Mode</span><span aria-live="polite">{enabled ? 'Light, as you like it' : 'System: dark'}</span></div>
            <ReadingPage />
          </section>
        </div>
        <div className="preview-control">
          <div className="preview-control-copy"><CursorClick aria-hidden="true" /><p>Same website. <strong>Your choice.</strong></p></div>
          <div className="preview-switch-group">
            <label htmlFor="preview-toggle">Light mode <span aria-live="polite">{enabled ? 'on' : 'off'}</span></label>
            <Switch id="preview-toggle" checked={enabled} onCheckedChange={setEnabled} aria-controls="theme-preview" />
          </div>
        </div>
      </div>
      <figcaption className="preview-caption"><span><Check aria-hidden="true" /> Your system theme stays untouched.</span><span>Try the switch. It only changes this demo.</span></figcaption>
    </figure>
  );
}
