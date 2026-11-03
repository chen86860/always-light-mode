import { useEffect, useRef } from 'react';
import { animate, inView, useReducedMotion } from 'motion/react';

const lines = ['Keep your dark desktop.', 'Come back to a lighter web.'];

export function TaglineReveal() {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    const animations: ReturnType<typeof animate>[] = [];
    const stop = inView(ref.current, () => {
      ref.current?.querySelectorAll('.tagline-line > span').forEach((word, index) => {
        animations.push(animate(word, { opacity: [0.3, 1] }, {
          duration: 0.7,
          delay: index * 0.06,
          ease: [0.22, 1, 0.36, 1],
        }));
      });
    }, { amount: 0.8 });
    return () => { stop(); animations.forEach((animation) => animation.stop()); };
  }, [reduced]);

  return (
    <h2 ref={ref} className="tagline-title">
      {lines.map((line) => <span className="tagline-line" key={line}>{line.split(' ').map((word, index) => <span key={`${word}-${index}`}>{word}{' '}</span>)}</span>)}
    </h2>
  );
}
