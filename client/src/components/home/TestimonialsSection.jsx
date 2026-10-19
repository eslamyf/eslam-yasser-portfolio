import React, { useState, useEffect, useRef } from 'react';
import { initialTestimonials } from '../../data/initialData';
import { testimonialApi } from '../../api/client';
import { IconQuote, IconArrowL, IconArrowR } from '../../assets/icons';
import { VaultCertificates } from './VaultCertificates';

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    testimonialApi.getAll().then((res) => {
      if (res.data?.success && res.data?.data?.length > 0) {
        setTestimonials(res.data.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const prev = () => {
    setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  };

  return (
    <section className="section proof" id="proof">
      <div className="wrap">
        <div className="section__head">
          <p className="kicker reveal is-in">
            <span>06</span> Credentials
          </p>
          <h2 className="title reveal is-in">Certificates &amp; licenses.</h2>
        </div>
      </div>

      <VaultCertificates />

      <div className="wrap voices">
        <div className="section__head">
          <p className="kicker reveal is-in">
            <span>07</span> Kind words
          </p>
          <h2 className="title reveal is-in">What people say.</h2>
        </div>

        <div
          className={`quote reveal is-in ${isPaused ? 'is-paused' : ''}`}
          id="quote"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <IconQuote className="i quote__mark" />

          <div className="quote__stage" id="quoteStage" aria-live="polite">
            {testimonials.map((t, idx) => {
              const isActive = currentIdx === idx;
              return (
                <figure key={t._id || idx} className={`q ${isActive ? 'is-active' : ''}`}>
                  <blockquote>{t.quote || t.content}</blockquote>
                  <figcaption>
                    <span className="av">
                      {t.initials || (t.author ? t.author.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'EX')}
                    </span>
                    <div>
                      <b>{t.author || t.name}</b>
                      <small>{t.role || t.title}</small>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <div className="quote__nav">
            <div className="bars" id="quoteBars">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Show testimonial ${idx + 1}`}
                  className={`${currentIdx === idx ? 'is-active' : ''} ${idx < currentIdx ? 'is-done' : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  <i></i>
                </button>
              ))}
            </div>

            <div className="arrows">
              <button className="arrow" id="qPrev" aria-label="Previous testimonial" onClick={prev}>
                <IconArrowL className="i" />
              </button>
              <button className="arrow" id="qNext" aria-label="Next testimonial" onClick={next}>
                <IconArrowR className="i" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
