import { useEffect, useRef, type ReactNode } from 'react';
import { animate, inView, useReducedMotion } from 'motion/react';

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // 服务端输出始终可见；进入视口后才播放动画，脚本失败也不隐藏内容。
  useEffect(() => {
    if (!ref.current) return;
    let animation: ReturnType<typeof animate> | undefined;
    const stop = inView(ref.current, (element) => {
      animation = animate(element, { opacity: [0.5, 1], transform: reduced ? ['none', 'none'] : ['translateY(16px)', 'translateY(0)'] }, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    }, { amount: 0.15 });
    return () => { stop(); animation?.stop(); };
  }, [reduced]);
  return <div ref={ref} className={className}>{children}</div>;
}
