import { useEffect } from 'react';

export const useMagnetic = (containerRef) => {
  useEffect(() => {
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFine) return;

    const root = containerRef?.current || document;
    const elements = root.querySelectorAll('[data-magnetic]');

    const handleMove = (e) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty('--tx', `${(dx * 0.25).toFixed(1)}px`);
      el.style.setProperty('--ty', `${(dy * 0.35).toFixed(1)}px`);
    };

    const handleLeave = (e) => {
      const el = e.currentTarget;
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
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
