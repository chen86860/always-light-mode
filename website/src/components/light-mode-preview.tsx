import { useState } from 'react';
import { ArrowUpRight, Check, LockKeyhole, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function LightModePreview() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="preview-stage">
      <div className="preview-caption"><span>Same website. Your preference.</span><span className="text-muted-foreground">Interactive preview</span></div>
      <div className={cn('preview-browser', !enabled && 'preview-browser-dark')} id="theme-preview">
        <div className="preview-toolbar">
          <span className="flex gap-1" aria-hidden="true"><i /><i /><i /></span>
          <span className="preview-address"><LockKeyhole className="size-3" aria-hidden="true" /> your.favorite.website</span>
          <span className="size-4" aria-hidden="true" />
        </div>
        <div className="preview-content">
          <div className="flex items-center justify-between text-sm font-medium"><span>Daily reading</span><ArrowUpRight className="size-4" aria-hidden="true" /></div>
          <div className="preview-art" aria-hidden="true"><span className="preview-orbit" /><Sun strokeWidth={1} className="size-16" /></div>
          <p className="text-sm preview-muted">A little room to focus</p>
          <h2 className="mt-2 max-w-xs text-3xl font-semibold tracking-tight">Your familiar places.<br />In a lighter mood.</h2>
          <p className="preview-muted mt-4 max-w-sm text-base">The pages you come back to, in the theme you actually want to use.</p>
          <div className="preview-lines" aria-hidden="true"><span /><span /></div>
        </div>
      </div>
      <div className="preview-control">
        <span className="preview-control-icon"><Sun className="size-6" strokeWidth={1.5} aria-hidden="true" /></span>
        <div className="flex-1"><label className="cursor-pointer text-base font-semibold" htmlFor="preview-toggle">Always Light Mode</label><p className="text-sm text-muted-foreground" aria-live="polite">{enabled ? 'Light mode is on' : 'Following the dark theme'}</p></div>
        <Switch id="preview-toggle" checked={enabled} onCheckedChange={setEnabled} aria-controls="theme-preview" />
      </div>
      <p className="preview-instruction"><Check className="size-4" aria-hidden="true" /> Try the switch. This only changes the preview.</p>
    </div>
  );
}
