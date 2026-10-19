import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  IconArrowR,
  IconDownload,
  IconGithub,
  IconLinkedin,
  IconWhatsapp,
  IconMail,
  IconDb
} from '../../assets/icons';

export const HeroWorkstation = () => {
  const { theme } = useTheme();
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const [clock, setClock] = useState('--:--');
  const [portraitLoaded, setPortraitLoaded] = useState(true);

  // Role rotator state
  const roles = [
    'scalable web apps',
    'REST APIs that last',
    'MEAN stack products',
    'clean architecture'
  ];
  const [currentRole, setCurrentRole] = useState(0);
  const [prevRole, setPrevRole] = useState(-1);
  const rotatorRef = useRef(null);
  const wordRefs = useRef([]);

  // Title entrance state
  const [titleIn, setTitleIn] = useState(false);

  // Dynamic Cairo clock
  useEffect(() => {
    const updateClock = () => {
      try {
        const t = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Cairo'
        }).format(new Date());
        setClock(t || '--:--');
      } catch (e) {
        setClock('--:--');
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  // Title line entrance animation
  useEffect(() => {
    const t = setTimeout(() => {
      setTitleIn(true);
    }, 150);
    return () => clearTimeout(t);
  }, []);

  // Role rotator sizing and transitions
  useEffect(() => {
    const updateSize = () => {
      if (rotatorRef.current && wordRefs.current[currentRole]) {
        const w = wordRefs.current[currentRole].offsetWidth;
        if (w > 0) {
          rotatorRef.current.style.width = `${w}px`;
        }
      }
    };

    updateSize();
    if (document.fonts?.ready) {
      document.fonts.ready.then(updateSize);
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [currentRole]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevRole(currentRole);
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [currentRole, roles.length]);

  useEffect(() => {
    if (prevRole !== -1) {
      const timer = setTimeout(() => {
        setPrevRole(-1);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [prevRole]);

  // Pointer depth (hx and hy)
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handlePointerMove = (e) => {
      const r = heroEl.getBoundingClientRect();
      const hx = (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3);
      const hy = (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3);
      heroEl.style.setProperty('--hx', hx);
      heroEl.style.setProperty('--hy', hy);
    };

    const handlePointerLeave = () => {
      heroEl.style.setProperty('--hx', '0');
      heroEl.style.setProperty('--hy', '0');
    };

    heroEl.addEventListener('pointermove', handlePointerMove);
    heroEl.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      heroEl.removeEventListener('pointermove', handlePointerMove);
      heroEl.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  // Background Canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    let particles = [];
    let rafId;
    let pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(85, Math.max(24, Math.round((W * H) / 17000)));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.4 + 0.6
        });
      }
    };

    const handlePointerMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };

    const handlePointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const col = isLight
        ? { p: 'rgba(30,90,200,0.45)', l: 'rgba(30,90,200,' }
        : { p: 'rgba(130,180,255,0.65)', l: 'rgba(100,160,255,' };

      const linkDist = 125;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = W + 10;
        else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        else if (p.y > H + 10) p.y = -10;

        const dxm = p.x - pointer.x;
        const dym = p.y - pointer.y;
        const dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 140 && dm > 0) {
          p.x += (dxm / dm) * 0.6;
          p.y += (dym / dm) * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = col.p;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const a = 1 - Math.sqrt(d2) / linkDist;
            ctx.strokeStyle = `${col.l}${(a * 0.22).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [theme]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-wrap" id="home">
      <section className="hero" ref={heroRef} aria-label="Introduction">
        <canvas className="hero__canvas" ref={canvasRef} id="bgCanvas" aria-hidden="true"></canvas>
        <div className="hero__glow" aria-hidden="true"></div>

        {/* The giant name sits BEHIND the person */}
        <h1 className="hero__title" aria-label="Eslam Yasser">
          <span
            className={`hero__line ${titleIn ? 'is-in' : ''}`}
            data-split
            style={{ '--base': '0s' }}
          >
            {'ESLAM'.split('').map((char, i) => (
              <span key={i} className="char" style={{ '--i': i }}>
                {char}
              </span>
            ))}
          </span>
          <span
            className={`hero__line hero__line--outline ${titleIn ? 'is-in' : ''}`}
            data-split
            style={{ '--base': '0.2s' }}
          >
            {'YASSER'.split('').map((char, i) => (
              <span key={i} className="char" style={{ '--i': i }}>
                {char}
              </span>
            ))}
          </span>
        </h1>

        <div className="stage" id="stage">
          <div className="stage__floor" aria-hidden="true"></div>
          <div className="stage__halo" aria-hidden="true"></div>

          {/* Card 1: Angular Component (BEHIND person) */}
          <div
            className="float float--code"
            aria-hidden="true"
            style={{ '--k': -18, '--ox': '-34vw', '--oy': '-8vh', '--or': '-16deg', '--d': '1.0s' }}
          >
            <div className="float__card" style={{ '--r': '-4deg' }}>
              <div className="win__bar">
                <i></i><i></i><i></i>
                <span>listings.component.ts</span>
              </div>
              <pre className="code">
                <span className="k">@Component</span>({`{ selector: `}<span className="s">'app-listings'</span>{` }`}){'\n'}
                <span className="k">export class</span> Listings {'{\n'}
                {'  '}items$ = api.<span className="f">get</span>(<span className="s">'/listings'</span>);{'\n'}
                {'}'}
              </pre>
            </div>
          </div>

          {/* Card 2: REST API Response (BEHIND person) */}
          <div
            className="float float--api"
            aria-hidden="true"
            style={{ '--k': 22, '--ox': '34vw', '--oy': '-10vh', '--or': '14deg', '--d': '1.15s' }}
          >
            <div className="float__card" style={{ '--r': '3deg' }}>
              <div className="api__row">
                <b>200</b>
                <span>GET /api/listings</span>
                <em>42ms</em>
              </div>
              <pre className="code">
                {'{ '}<span className="f">"role"</span>: <span className="s">"admin"</span>,{'\n'}
                {'  '}<span className="f">"jwt"</span>: <span className="s">"valid"</span>{' }'}
              </pre>
            </div>
          </div>

          {/* Portrait cutout - constrained below navbar */}
          <figure className={`portrait ${!portraitLoaded ? 'no-img' : ''}`} id="portrait">
            <div className="portrait__in">
              <img
                src="/assets/img/Eslam_Portfolio3-removebg-preview.png"
                alt="Portrait of Eslam Yasser"
                width="620"
                height="1228"
                onError={() => setPortraitLoaded(false)}
              />
              {!portraitLoaded && (
                <svg className="portrait__fallback" viewBox="0 0 400 500" aria-hidden="true">
                  <defs>
                    <linearGradient id="fbBody" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#3b82ff" />
                      <stop offset="1" stopColor="#16327a" />
                    </linearGradient>
                    <linearGradient id="fbChair" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#1b2b4d" />
                      <stop offset="1" stopColor="#0b1730" />
                    </linearGradient>
                  </defs>
                  <rect x="112" y="150" width="176" height="250" rx="44" fill="url(#fbChair)" stroke="#2b4a86" strokeWidth="2" />
                  <rect x="190" y="400" width="20" height="62" rx="8" fill="#0f1f43" />
                  <g stroke="#2b4a86" strokeWidth="9" strokeLinecap="round">
                    <path d="M200 462 L112 486" />
                    <path d="M200 462 L288 486" />
                    <path d="M200 462 L200 490" />
                  </g>
                  <g fill="#0b1730" stroke="#2b4a86" strokeWidth="2">
                    <circle cx="108" cy="490" r="9" />
                    <circle cx="292" cy="490" r="9" />
                    <circle cx="200" cy="494" r="9" />
                  </g>
                  <rect x="140" y="345" width="56" height="92" rx="24" fill="#0f1f43" />
                  <rect x="204" y="345" width="56" height="92" rx="24" fill="#0f1f43" />
                  <path d="M132 192 Q132 176 152 176 L248 176 Q268 176 268 192 L262 350 L138 350 Z" fill="url(#fbBody)" />
                  <path d="M138 205 Q110 272 160 322" stroke="#2f6df0" strokeWidth="30" fill="none" strokeLinecap="round" />
                  <path d="M262 205 Q290 272 240 322" stroke="#2f6df0" strokeWidth="30" fill="none" strokeLinecap="round" />
                  <rect x="184" y="150" width="32" height="34" rx="12" fill="#d9a784" />
                  <circle cx="200" cy="108" r="42" fill="#e7b894" />
                  <path d="M158 104 Q158 62 200 62 Q242 62 242 104 Q226 84 200 84 Q174 84 158 104 Z" fill="#0d1426" />
                  <path d="M118 346 L282 346 L264 322 L136 322 Z" fill="#1b2b4d" stroke="#3b82ff" strokeWidth="2" />
                  <rect x="140" y="250" width="120" height="74" rx="6" fill="#0e1b36" stroke="#3b82ff" strokeWidth="2" />
                  <text x="200" y="298" textAnchor="middle" fontFamily="monospace" fontSize="26" fill="#4be1d0">&lt;/&gt;</text>
                </svg>
              )}
            </div>
          </figure>

          {/* Card 3: MongoDB Document (IN FRONT of person) */}
          <div
            className="float float--db float--front"
            aria-hidden="true"
            style={{ '--k': -30, '--ox': '30vw', '--oy': '16vh', '--or': '10deg', '--d': '1.45s' }}
          >
            <div className="float__card" style={{ '--r': '3deg' }}>
              <div className="db__head">
                <IconDb className="i" /> listings
              </div>
              <pre className="code">
                {'{ '}<span className="f">_id</span>: <span className="s">ObjectId(…)</span>,{'\n'}
                {'  '}<span className="f">type</span>: <span className="s">"Villa"</span>,{'\n'}
                {'  '}<span className="f">price</span>: <span className="n">420000</span>{' }'}
              </pre>
            </div>
          </div>
        </div>

        <p className="corner corner--tl" style={{ '--d': '1.5s' }}>
          <b>Full-Stack MEAN</b>
          <span>Angular · Express · Node · MongoDB</span>
        </p>

        <p className="corner corner--tr" style={{ '--d': '1.6s' }}>
          <b>Qena, Egypt</b>
          <span><span id="heroClock">{clock}</span> local time</span>
        </p>

        <div className="hero__foot">
          <div className="hero__copy">
            <p className="eyebrow hero-in" style={{ '--d': '.9s' }}>
              <span className="pulse"></span> Open to work &amp; freelance
            </p>
            <p className="hero__role hero-in" style={{ '--d': '1s' }}>
              <span className="hero__role-static">I build</span>{' '}
              <span className="rotator" id="rotator" ref={rotatorRef} aria-live="polite">
                {roles.map((role, idx) => {
                  let cls = 'rotator__word';
                  if (idx === currentRole) cls += ' is-in';
                  else if (idx === prevRole) cls += ' is-out';
                  return (
                    <span
                      key={idx}
                      ref={(el) => (wordRefs.current[idx] = el)}
                      className={cls}
                    >
                      {role}
                    </span>
                  );
                })}
              </span>
            </p>
            <p className="hero__lead hero-in" style={{ '--d': '1.1s' }}>
              Full-Stack developer working with Angular, React, Node.js, Express and MongoDB &mdash; and an instructor who makes programming click for CS students.
            </p>
            <div className="hero__cta hero-in" style={{ '--d': '1.2s' }}>
              <a
                href="#projects"
                onClick={(e) => scrollTo(e, 'projects')}
                className="btn btn--primary"
                data-magnetic
              >
                <span>See my work</span>
                <IconArrowR className="i" />
              </a>
              <a
                href="/assets/pdf/EslamCV.pdf"
                className="btn btn--ghost"
                download
                data-magnetic
              >
                <IconDownload className="i" />
                <span>Download CV</span>
              </a>
            </div>
          </div>

          <ul className="hero__social hero-in" style={{ '--d': '1.3s' }} aria-label="Social links">
            <li>
              <a href="https://github.com/eslamyasser" target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-magnetic>
                <IconGithub className="i i--fill" />
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/eslam-yasser" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-magnetic>
                <IconLinkedin className="i i--fill" />
              </a>
            </li>
            <li>
              <a href="https://wa.me/201028103634" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" data-magnetic>
                <IconWhatsapp className="i" />
              </a>
            </li>
            <li>
              <a href="mailto:eslam9076460@gmail.com" aria-label="Email" data-magnetic>
                <IconMail className="i" />
              </a>
            </li>
          </ul>
        </div>

        <a
          href="#about"
          onClick={(e) => scrollTo(e, 'about')}
          className="scroll-cue"
          aria-label="Scroll to About"
        >
          <span></span>
        </a>
      </section>
    </div>
  );
};
