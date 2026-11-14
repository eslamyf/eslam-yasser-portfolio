import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const CustomCursor = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const isMobile = () => {
      return (
        window.innerWidth <= 860 ||
        window.matchMedia('(max-width: 860px)').matches ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    if (isMobile()) {
      document.documentElement.classList.remove('has-cursor');
      return;
    }

    const resize = () => {
      if (isMobile()) {
        document.documentElement.classList.remove('has-cursor');
        if (ctx) ctx.clearRect(0, 0, width, height);
        return;
      }
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let points = [];
    const TRAIL_DURATION = 350; // ms trail lifetime
    let mouseX = -100;
    let mouseY = -100;
    let prevX = -100;
    let prevY = -100;
    let lastTime = performance.now();
    let isHover = false;
    let isDown = false;
    let isInside = false;
    let hasMoved = false;

    const handleMouseMove = (e) => {
      if (isMobile()) {
        isInside = false;
        points = [];
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      isInside = true;

      if (!hasMoved) {
        hasMoved = true;
        document.documentElement.classList.add('has-cursor');
      }

      const now = performance.now();
      const dist = Math.hypot(mouseX - prevX, mouseY - prevY);

      if (dist > 1.5 || now - lastTime > 20) {
        points.push({
          x: mouseX,
          y: mouseY,
          time: now,
        });
        prevX = mouseX;
        prevY = mouseY;
        lastTime = now;
      }

      startRender();
    };

    const handleMouseDown = () => {
      isDown = true;
      startRender();
    };

    const handleMouseUp = () => {
      isDown = false;
      startRender();
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.hasAttribute('data-magnetic') ||
        target.classList.contains('clickable') ||
        target.classList.contains('mag')
      ) {
        isHover = true;
      } else {
        isHover = false;
      }
    };

    const handleMouseLeave = () => {
      isInside = false;
    };

    const handleMouseEnter = () => {
      isInside = true;
      startRender();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let rafId = null;
    let isRendering = false;

    const startRender = () => {
      if (isMobile() || isRendering) return;
      isRendering = true;
      rafId = requestAnimationFrame(render);
    };

    const render = () => {
      if (isMobile()) {
        isRendering = false;
        if (ctx) ctx.clearRect(0, 0, width, height);
        return;
      }
      const now = performance.now();

      // Clean up points older than duration
      points = points.filter((p) => now - p.time < TRAIL_DURATION);

      ctx.clearRect(0, 0, width, height);

      const isDark = themeRef.current === 'dark';

      // Colors:
      // Dark Mode: Electric Lightning Yellow (#FFE14D) with white spark core
      // Light Mode: Vibrant Cobalt Ink (#2438F5) with intense blue core
      const auraColor = isDark ? 'rgba(255, 225, 77, ' : 'rgba(36, 56, 245, ';
      const coreColor = isDark ? 'rgba(255, 255, 240, ' : 'rgba(20, 35, 210, ';
      const glowColor = isDark ? '#FFE14D' : '#2438F5';

      // 1. Draw lightning/ink trail
      if (points.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isDark ? 14 : 9;

        for (let i = 1; i < points.length; i++) {
          const pPrev = points[i - 1];
          const pCurr = points[i];
          const pNext = points[i + 1] || pCurr;

          const age = (now - pCurr.time) / TRAIL_DURATION;
          const t = Math.max(0, 1 - age);
          if (t <= 0) continue;

          const xc1 = (pPrev.x + pCurr.x) / 2;
          const yc1 = (pPrev.y + pCurr.y) / 2;
          const xc2 = (pCurr.x + pNext.x) / 2;
          const yc2 = (pCurr.y + pNext.y) / 2;

          const baseWidth = (isHover ? 5.8 : 4.2) * Math.pow(t, 1.2) + 0.8;
          const alpha = Math.min(1, Math.pow(t, 1.1) * (isHover ? 0.98 : 0.88));

          // Outer lightning/ink glow
          ctx.beginPath();
          ctx.moveTo(xc1, yc1);
          ctx.quadraticCurveTo(pCurr.x, pCurr.y, xc2, yc2);
          ctx.lineWidth = baseWidth * 1.9;
          ctx.strokeStyle = auraColor + (alpha * 0.45) + ')';
          ctx.stroke();

          // Inner crisp lightning/ink streak
          ctx.beginPath();
          ctx.moveTo(xc1, yc1);
          ctx.quadraticCurveTo(pCurr.x, pCurr.y, xc2, yc2);
          ctx.lineWidth = baseWidth;
          ctx.strokeStyle = coreColor + alpha + ')';
          ctx.stroke();
        }

        ctx.restore();
      }

      // 2. Tip spark / pen nib at cursor position
      if (isInside && mouseX > -10 && mouseY > -10) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isDark ? 14 : 8;

        const tipRadius = isDown ? 2.2 : isHover ? 4.2 : 3.0;

        // Aura dot
        ctx.fillStyle = isDark ? '#FFE14D' : '#2438F5';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, tipRadius, 0, Math.PI * 2);
        ctx.fill();

        // White core center for lightning spark
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, tipRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      if (!isMobile() && (isInside || points.length > 0)) {
        rafId = requestAnimationFrame(render);
      } else {
        isRendering = false;
      }
    };

    if (!isMobile()) {
      startRender();
    }

    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="cursor" id="cursor" aria-hidden="true">
      <canvas ref={canvasRef} className="cursor__canvas" />
    </div>
  );
};
