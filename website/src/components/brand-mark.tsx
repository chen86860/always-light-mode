import { Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return <a href="/" aria-label="Always Light Mode home" className={cn('brand-mark', className)}>
    <span className="brand-symbol"><Sun className="size-6" strokeWidth={1.5} aria-hidden="true" /></span>
    <span>Always Light Mode<span className="brand-period">.</span></span>
  </a>;
}
