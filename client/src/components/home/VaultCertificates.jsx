import React, { useState, useEffect, useRef } from 'react';
import { initialCertificates } from '../../data/initialData';
import { certificateApi } from '../../api/client';
import { IconShield, IconArrowUR, IconArrowL, IconArrowR } from '../../assets/icons';

export const VaultCertificates = () => {
  const [certs, setCerts] = useState(initialCertificates);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);
  const vaultRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const prevCert = () => setActiveIdx((prev) => Math.max(0, prev - 1));
  const nextCert = () => setActiveIdx((prev) => Math.min(certs.length - 1, prev + 1));

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextCert();
      else prevCert();
    }
  };

  useEffect(() => {
    certificateApi
      .getAll()
      .then((res) => {
        if (res.data?.success && res.data?.data?.length > 0) {
          const mapped = res.data.data.map((c, i) => {
            const isImg = (url) => {
              if (!url || typeof url !== 'string') return false;
              const clean = url.trim().toLowerCase().split('?')[0].split('#')[0];
              return (
                clean.startsWith('data:image/') ||
                clean.includes('/image/upload/') ||
                clean.includes('/uploads/images/') ||
                /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)$/i.test(clean)
              );
            };

            const rawImg = c.image || (isImg(c.pdfFile) ? c.pdfFile : (c.img || ''));
            const imgUrl = rawImg && typeof rawImg === 'string'
              ? rawImg.replace('azk1xpfli', 'azk1xpfi').replace('nnzkclycuu6mnbxg8c3v.png', 'nnzkclycuu6mnbcg8c3v.png')
              : '';

            return {
              _id: c._id || `cert-${i}`,
              title: c.name || c.title || 'Certificate',
              name: c.name || c.title || 'Certificate',
              org: c.issuer || c.subtitle || c.organization || 'Verified Institution',
              date: c.issueDate || c.year || '2026',
              duration: c.duration || '',
              credentialId: c.credentialId || '',
              desc: c.description || '',
              tags: Array.isArray(c.skills) && c.skills.length > 0
                ? c.skills
                : Array.isArray(c.tags) && c.tags.length > 0
                  ? c.tags
                  : ['Software Engineering', 'Problem Solving'],
              link: c.link || c.credentialUrl || c.certificateUrl || c.pdfFile || '#',
              img: imgUrl
            };
          });
          setCerts(mapped);
        }
      })
      .catch(() => { });
  }, []);

  // Update active certificate as user scrolls through the 3D vault
  useEffect(() => {
    const handleScroll = () => {
      const vault = vaultRef.current;
      if (!vault || certs.length === 0) return;
      const r = vault.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(vault.offsetHeight - vh, 1);
      const p = Math.min(1, Math.max(0, -r.top / total));
      const idx = r.top > vh * 0.3 ? 0 : Math.min(certs.length - 1, Math.max(0, Math.floor(p * certs.length)));
      setActiveIdx(idx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [certs.length]);

  const jumpToCert = (idx) => {
    setActiveIdx(idx);
    const vault = vaultRef.current;
    if (!vault) return;
    const top = vault.getBoundingClientRect().top + window.pageYOffset;
    const total = vault.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + total * ((idx + 0.5) / certs.length),
      behavior: 'smooth'
    });
  };

  return (
    <div className="vault" id="vault" ref={vaultRef} style={{ '--n': certs.length }}>
      <div className="vault__pin">
        <div className="wrap vault__grid">
          {/* Left Side: Certificates index list */}
          <ol className="vault__index" id="vaultIndex" aria-label="Certificates">
            {certs.map((cert, i) => (
              <li key={cert._id || i} className={activeIdx === i ? 'is-on' : ''}>
                <button type="button" onClick={() => jumpToCert(i)} data-i={i}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <div className="vault__btn-text">
                    <b>{cert.title}</b>
                    <small>{cert.org}</small>
                  </div>
                </button>
              </li>
            ))}
          </ol>

          {/* Right Side: 3D stage with active certificate card */}
          <div
            className="vault__stage"
            id="vaultStage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="vault__mobile-nav" aria-label="Certificate navigation">
              <button
                type="button"
                onClick={prevCert}
                disabled={activeIdx === 0}
                aria-label="Previous certificate"
                style={{ opacity: activeIdx === 0 ? 0.35 : 1 }}
              >
                <IconArrowL className="i" />
              </button>
              <span className="vault__mobile-counter">
                {String(activeIdx + 1).padStart(2, '0')} / {String(certs.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={nextCert}
                disabled={activeIdx === certs.length - 1}
                aria-label="Next certificate"
                style={{ opacity: activeIdx === certs.length - 1 ? 0.35 : 1 }}
              >
                <IconArrowR className="i" />
              </button>
            </div>

            {certs.map((cert, i) => {
              const isActive = activeIdx === i;
              const isPast = activeIdx > i;
              const rawVisual = cert.img || cert.image;
              const visualSrc = rawVisual && typeof rawVisual === 'string'
                ? rawVisual.replace('azk1xpfli', 'azk1xpfi').replace('nnzkclycuu6mnbxg8c3v.png', 'nnzkclycuu6mnbcg8c3v.png')
                : '';

              return (
                <article
                  key={cert._id || i}
                  className={`vc ${isActive ? 'is-active is-in' : ''} ${isPast ? 'is-past is-in' : ''}`}
                  data-i={i}
                >
                  <div className="vc__tilt" data-tilt>
                    <div className="vc__face">
                      <div className="vc__shine"></div>

                      <div className="vc__top">
                        <span className="vc__badge">
                          <IconShield className="i" />
                          <span>Verified credential</span>
                        </span>
                        <div className="vc__meta">
                          {cert.credentialId && <span className="vc__id">{cert.credentialId}</span>}
                          {cert.date && <span>{cert.date}</span>}
                        </div>
                      </div>

                      <div className="vc__body">
                        <div className="vc__info">
                          <h3>{cert.title}</h3>
                          <p className="vc__org">
                            {cert.org}
                            {cert.duration ? ` · ${cert.duration}` : ''}
                          </p>
                          {cert.desc && <p className="vc__desc">{cert.desc}</p>}
                          <ul className="tags">
                            {cert.tags?.map((tag, tIdx) => (
                              <li key={tIdx}>{tag}</li>
                            ))}
                          </ul>
                        </div>

                        {visualSrc ? (
                          <div
                            className="vc__preview"
                            title="Click to view full certificate"
                            onClick={() => setSelectedImg(visualSrc)}
                          >
                            <img
                              src={visualSrc}
                              alt={cert.title}
                              loading="lazy"
                            />
                            <span className="vc__preview-hint" aria-hidden="true">
                              <IconArrowUR className="i" />
                            </span>
                          </div>
                        ) : (
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="vc__preview vc__preview--doc"
                            title="View PDF Credential"
                          >
                            <div style={{ textAlign: 'center', padding: '0.8rem', color: 'hsl(var(--brand))' }}>
                              <IconShield style={{ width: '28px', height: '28px', margin: '0 auto 4px', display: 'block' }} />
                              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>PDF Document</span>
                            </div>
                            <span className="vc__preview-hint" aria-hidden="true">
                              <IconArrowUR className="i" />
                            </span>
                          </a>
                        )}
                      </div>

                      <a
                        href={cert.link}
                        target={cert.link === '#' ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className="vc__link"
                      >
                        <span>View credential / Details</span>
                        <IconArrowUR className="i" />
                      </a>

                      <span className="stamp">Verified</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Certificate Preview */}
      {selectedImg && (
        <div
          className="cert-modal"
          onClick={() => setSelectedImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 350,
            background: 'rgba(3, 10, 22, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'grid',
            placeItems: 'center',
            padding: '2rem',
            cursor: 'zoom-out'
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImg}
              alt="Certificate Full View"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '82vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <button
              type="button"
              onClick={() => setSelectedImg(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
