import React, { useEffect, useRef } from 'react';
import { TechStrip } from './TechStrip';
import { HeroNames } from './hero/HeroNames';
import { HeroPortrait } from './hero/HeroPortrait';
import { HeroPitch } from './hero/HeroPitch';
import { HeroLocation } from './hero/HeroLocation';

export const HeroWorkstation = () => {
  const heroRef = useRef(null);
  const glowRef = useRef(null);
  const namesRef = useRef(null);
  const photoRef = useRef(null);
  const rollRef = useRef(null);
  const sideWrapRef = useRef(null);
  const sideInRef = useRef(null);
  const rightWrapRef = useRef(null);
  const rightInRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const heroEl = heroRef.current;
    if (!heroEl) return;

    // --- High-Performance Precision Fit-To-Width Function ---
    const fitNames = () => {
      if (window.innerWidth > 860) {
        if (namesRef.current) {
          namesRef.current.style.removeProperty('--fit-1');
          namesRef.current.style.removeProperty('--fit-2');
        }
        return;
      }

      if (!namesRef.current || !heroEl) return;

      const availableWidth = Math.max(240, Math.min(window.innerWidth - 32, 680));

      let measurer = document.getElementById('hero-name-measurer');
      if (!measurer) {
        measurer = document.createElement('span');
        measurer.id = 'hero-name-measurer';
        measurer.style.cssText =
          'position:fixed;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;' +
          'font-family:"Archivo",sans-serif;font-weight:900;font-stretch:62%;' +
          'text-transform:uppercase;font-size:100px;letter-spacing:-0.005em;pointer-events:none;transform:none !important;';
        document.body.appendChild(measurer);
      }

      measurer.textContent = 'ESLAM';
      const w1 = measurer.getBoundingClientRect().width || 340;

      measurer.textContent = 'YASSER';
      const w2 = measurer.getBoundingClientRect().width || 410;

      if (w1 > 0 && w2 > 0) {
        const fs1 = Math.min(180, (availableWidth / w1) * 100);
        const fs2 = Math.min(150, (availableWidth / w2) * 100);

        namesRef.current.style.setProperty('--fit-1', `${fs1.toFixed(2)}px`);
        namesRef.current.style.setProperty('--fit-2', `${fs2.toFixed(2)}px`);
      }
    };

    fitNames();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 860;

    // Fallback if GSAP is unavailable or reduced motion is preferred
    if (!gsap || prefersReducedMotion) {
      if (namesRef.current) namesRef.current.style.opacity = '1';
      if (photoRef.current) {
        photoRef.current.style.transform = isMobile ? 'none' : 'translateX(-50%)';
      }
      if (sideInRef.current) sideInRef.current.style.opacity = '1';
      if (rightInRef.current) rightInRef.current.style.opacity = '1';
      return;
    }

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // 1. Initial State
      gsap.set('.hero-ref__names', { opacity: 1 });
      gsap.set(photoRef.current, { clearProps: 'transform' });

      // 2. Intro Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      const navChildren = document.querySelectorAll('.nav > *');
      if (navChildren.length) {
        tl.from(
          navChildren,
          { y: -20, opacity: 0, duration: 0.9, stagger: 0.08, clearProps: 'transform,opacity' },
          0
        );
      }

      // First name rises from below
      tl.fromTo(
        '.hero-ref__n1 .hero-ref__ch',
        { yPercent: 115, rotate: 8 },
        { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.07, clearProps: 'transform' },
        0.1
      )
        // Last name drops from above
        .fromTo(
          '.hero-ref__n2 .hero-ref__ch',
          { yPercent: -115, rotate: -8 },
          { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.07, clearProps: 'transform' },
          0.35
        )
        // Photo reveals with clip-path from bottom to top
        .fromTo(
          '.hero-ref__photo .hero-ref__me',
          { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 8 },
          { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1.5 },
          0.5
        )
        // Fade rim wrap in after the photo reveal
        .fromTo(
          '.hero-ref__rim-wrap',
          { opacity: 0 },
          { opacity: 1, duration: 1.2, ease: 'power2.out', clearProps: 'opacity' },
          1.3
        )
        // Left & Right inner blocks slide and fade in cleanly
        .fromTo(
          [sideInRef.current, rightInRef.current].filter(Boolean),
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, stagger: 0.1, clearProps: 'all' },
          0.95
        );

      // 4. Rotating words inside masked line (1.7s swap, 0.85s power4.inOut)
      const rollInner = rollRef.current;
      if (rollInner) {
        const wordCount = rollInner.children.length;
        if (wordCount > 1) {
          const rollTl = gsap.timeline({ repeat: -1, delay: 2.2 });
          for (let i = 1; i < wordCount; i++) {
            rollTl.to(
              rollInner,
              { yPercent: (-100 / wordCount) * i, duration: 0.85, ease: 'power4.inOut' },
              '+=1.7'
            );
          }
          rollTl.set(rollInner, { yPercent: 0 });
        }
      }

      // 5. Desktop-Only Media Queries using gsap.matchMedia()
      mm.add('(min-width: 861px) and (pointer: fine)', () => {
        // Desktop Scroll Scene
        if (ScrollTrigger) {
          const stMain = { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: 0.6 };
          gsap.to('.hero-ref__n1', { xPercent: -12, yPercent: -10, scrollTrigger: stMain, ease: 'none' });
          gsap.to('.hero-ref__n2', { xPercent: 12, yPercent: 8, scrollTrigger: stMain, ease: 'none' });
          gsap.to(photoRef.current, { yPercent: 10, scale: 1.08, transformOrigin: '50% 100%', scrollTrigger: stMain, ease: 'none' });

          gsap.to([sideWrapRef.current, rightWrapRef.current].filter(Boolean), {
            opacity: 0,
            y: -45,
            immediateRender: false,
            scrollTrigger: { trigger: heroEl, start: 'top top', end: '55% top', scrub: 0.6 },
            ease: 'none'
          });
        }

        // Desktop Mouse Parallax Depth & Dynamic Light Direction
        const lightX = gsap.quickTo(photoRef.current, '--mouse-light-x', { duration: 0.8, ease: 'power2.out' });

        const layers = [
          { el: '.hero-ref__n1', d: 0.03 },
          { el: '.hero-ref__n2', d: -0.05 },
          { el: photoRef.current, d: 0.014 }
        ].map((item) => ({
          x: gsap.quickTo(item.el, 'x', { duration: 1, ease: 'power3' }),
          y: gsap.quickTo(item.el, 'y', { duration: 1, ease: 'power3' }),
          d: item.d
        }));

        const onMouseMove = (e) => {
          const cx = e.clientX - window.innerWidth / 2;
          const cy = e.clientY - window.innerHeight / 2;
          layers.forEach((layer) => {
            layer.x(cx * layer.d);
            layer.y(cy * layer.d * 0.6);
          });
          const normX = cx / (window.innerWidth / 2);
          lightX(`${(normX * 10).toFixed(1)}px`);
        };
        const onMouseLeave = () => {
          layers.forEach((layer) => {
            layer.x(0);
            layer.y(0);
          });
          lightX('0px');
        };
        heroEl.addEventListener('mousemove', onMouseMove);
        heroEl.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('blur', onMouseLeave);

        // Soft Follower Glow
        const glowEl = glowRef.current;
        let onGlowMove = null;
        if (glowEl) {
          glowEl.style.display = 'block';
          gsap.set(glowEl, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
          const gx = gsap.quickTo(glowEl, 'x', { duration: 0.8, ease: 'power3' });
          const gy = gsap.quickTo(glowEl, 'y', { duration: 0.8, ease: 'power3' });

          onGlowMove = (e) => {
            const rect = heroEl.getBoundingClientRect();
            gx(e.clientX - rect.left);
            gy(e.clientY - rect.top);
          };
          heroEl.addEventListener('mousemove', onGlowMove);
        }

        // Magnetic Buttons
        const magBtns = heroEl.querySelectorAll('.mag');
        const btnCleanups = [];
        magBtns.forEach((btn) => {
          const mx = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          const my = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });

          const onBtnMove = (e) => {
            const b = btn.getBoundingClientRect();
            mx((e.clientX - b.left - b.width / 2) * 0.35);
            my((e.clientY - b.top - b.height / 2) * 0.35);
          };
          const onBtnLeave = () => {
            mx(0);
            my(0);
          };

          btn.addEventListener('mousemove', onBtnMove);
          btn.addEventListener('mouseleave', onBtnLeave);
          btnCleanups.push(() => {
            btn.removeEventListener('mousemove', onBtnMove);
            btn.removeEventListener('mouseleave', onBtnLeave);
          });
        });

        return () => {
          heroEl.removeEventListener('mousemove', onMouseMove);
          heroEl.removeEventListener('mouseleave', onMouseLeave);
          window.removeEventListener('blur', onMouseLeave);
          if (onGlowMove) heroEl.removeEventListener('mousemove', onGlowMove);
          btnCleanups.forEach(fn => fn());
          gsap.set(['.hero-ref__n1', '.hero-ref__n2', photoRef.current], {
            clearProps: 'x,y,xPercent,yPercent,transform'
          });
          if (photoRef.current) {
            photoRef.current.style.removeProperty('--mouse-light-x');
          }
          if (glowEl) glowEl.style.display = 'none';
        };
      });

      // Mobile Mode: ensure zero horizontal offset & static lighting
      mm.add('(max-width: 860px)', () => {
        gsap.set(['.hero-ref__n1', '.hero-ref__n2', photoRef.current], {
          clearProps: 'x,y,xPercent,yPercent,transform'
        });
        if (photoRef.current) {
          photoRef.current.style.setProperty('--mouse-light-x', '0px');
        }
        if (glowRef.current) glowRef.current.style.display = 'none';
      });
    }, heroRef);

    const safetyTimer = setTimeout(() => {
      if (sideInRef.current) sideInRef.current.style.opacity = '1';
      if (rightInRef.current) rightInRef.current.style.opacity = '1';
      if (sideWrapRef.current && window.scrollY < 50) sideWrapRef.current.style.opacity = '1';
      if (rightWrapRef.current && window.scrollY < 50) rightWrapRef.current.style.opacity = '1';
    }, 3500);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fitNames();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    }

    const onResize = () => {
      fitNames();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        fitNames();
      });
      resizeObserver.observe(heroEl);
    }

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      const measurer = document.getElementById('hero-name-measurer');
      if (measurer) measurer.remove();
      if (resizeObserver) resizeObserver.disconnect();
      mm.revert();
      ctx.revert();
    };
  }, []);

  const firstLetters = 'Eslam'.split('');
  const lastLetters = 'Yasser'.split('');

  return (
    <section className="hero-ref" id="home" ref={heroRef} aria-label="Introduction">
      <div className="hero-ref__glow" ref={glowRef} aria-hidden="true"></div>

      <HeroNames ref={namesRef} firstLetters={firstLetters} lastLetters={lastLetters} />

      <HeroPortrait ref={photoRef} />

      <div className="hero-ref__container">
        <div className="hero-ref__side-wrap" ref={sideWrapRef}>
          <HeroPitch ref={sideInRef} rollRef={rollRef} />
        </div>

        <div className="hero-ref__right-wrap" ref={rightWrapRef}>
          <HeroLocation ref={rightInRef} />
        </div>
      </div>

      {/* Tilted Moving Tech Strip */}
      <div className="hero-ref__strip-wrap">
        <TechStrip />
      </div>
    </section>
  );
};
