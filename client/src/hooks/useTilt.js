import { useEffect } from 'react';

export const useTilt = (containerRef) => {
  useEffect(() => {
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFine) return;

    const root = containerRef?.current || document;
    const elements = root.querySelectorAll('[data-tilt]');

    const handleMove = (e) => {
      const el = e.currentTarget;
      const max = el.classList.contains('vc__tilt') ? 7 : 9;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(px * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-py * max * 2).toFixed(2)}deg`);
    };

    const handleLeave = (e) => {
      const el = e.currentTarget;
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };

    elements.forEach((el) => {
      el.addEventListener('pointermove', handleMove);
      el.addEventListener('pointerleave', handleLeave);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener('pointermove', handleMove);
        el.removeEventListener('pointerleave', handleLeave);
      });
    };
  }, [containerRef]);
};
