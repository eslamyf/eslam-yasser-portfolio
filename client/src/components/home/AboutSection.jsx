import React, { useEffect, useRef, useState } from 'react';
import { initialStats } from '../../data/initialData';

export const AboutSection = () => {
  const textRef = useRef(null);
  const [litCount, setLitCount] = useState(0);
  const [counts, setCounts] = useState(initialStats.map(() => 0));
  const cardRef = useRef(null);

  const aboutParagraph = "Full-Stack Web Developer working with the MEAN stack and a Computer Science student at Qena University. I build complete systems — Angular on the front, Node.js and Express on the back, MongoDB underneath — and I teach web development to CS students at Support Web Program, turning hard concepts into practical sessions.";
  const words = aboutParagraph.split(/\s+/);

  useEffect(() => {
    const handleScroll = () => {
      if (!textRef.current) return;
      const r = textRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (r.height + vh * 0.32)));
      const n = Math.round(p * words.length);
      setLitCount(n);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [words.length]);

  useEffect(() => {
    let triggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !triggered) {
          triggered = true;
          initialStats.forEach((stat, index) => {
            const duration = 1800;
            const startTime = performance.now();
            const step = (now) => {
              const progress = Math.min((now - startTime) / duration, 1);
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              setCounts((prev) => {
                const next = [...prev];
                next[index] = Math.round(stat.target * eased);
                return next;
              });
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (textRef.current) observer.observe(textRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handlePointerMove = (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(px * 14).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`);
    };

    const handlePointerLeave = () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    };

    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <section className="section about" id="about">
      <div className="wrap about__grid">
        <div className="about__media reveal is-in">
          <div className="about__card" ref={cardRef} data-tilt>
            <div className="about__card-glow"></div>
            <img
              src="/assets/img/About.png"
              alt="Developer working at desk"
              width="520"
              height="520"
              loading="lazy"
            />
            <div className="about__card-badge">
              <span className="pulse"></span> Computer Science &middot; Qena University
            </div>
          </div>
        </div>

        <div className="about__body">
          <p className="kicker reveal is-in">
            <span>01</span> About
          </p>
          <h2 className="title reveal is-in">Engineering scalable digital solutions.</h2>

          <p className="about__text" id="aboutText" ref={textRef} data-words>
            {words.map((word, i) => (
              <React.Fragment key={i}>
                <span className={`word ${i < litCount ? 'is-lit' : ''}`}>{word}</span>{' '}
              </React.Fragment>
            ))}
          </p>

          <div className="stats">
            {initialStats.map((stat, i) => (
              <div key={i} className="stat reveal is-in" style={{ '--d': `${0.05 + i * 0.1}s` }}>
                <strong data-count={stat.target} data-suffix={stat.suffix}>
                  {counts[i]}{stat.suffix}
                </strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="langs reveal is-in">
            <span className="pill">
              <b>Arabic</b> Native
            </span>
            <span className="pill">
              <b>English</b> Conversational
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
