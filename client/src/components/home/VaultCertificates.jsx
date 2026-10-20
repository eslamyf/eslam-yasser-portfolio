import React, { useState, useEffect, useRef } from 'react';
import { initialCertificates } from '../../data/initialData';
import { certificateApi } from '../../api/client';
import { IconShield, IconArrowUR } from '../../assets/icons';

const escapeXml = (unsafe) => {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const getCertificateSvg = (cert) => {
  const title = (cert?.title || cert?.name || 'Certificate of Achievement').slice(0, 48);
  const org = cert?.org || cert?.issuer || 'Verified Institution';
  const date = cert?.date || cert?.issueDate || '2026';
  const credId = cert?.credentialId || 'VERIFIED-CREDENTIAL';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
    <defs>
      <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a192f"/>
        <stop offset="50%" stop-color="#071324"/>
        <stop offset="100%" stop-color="#030812"/>
      </linearGradient>
      <linearGradient id="cborder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
    </defs>
    <rect width="600" height="420" rx="16" fill="url(#cbg)"/>
    <rect x="14" y="14" width="572" height="392" rx="12" fill="none" stroke="url(#cborder)" stroke-width="2" stroke-opacity="0.6"/>
    <rect x="22" y="22" width="556" height="376" rx="8" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="6,4" stroke-opacity="0.25"/>
    
    <circle cx="300" cy="65" r="24" fill="#0c2340" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="300,48 305,62 319,62 308,70 312,84 300,75 288,84 292,70 281,62 295,62" fill="#38bdf8"/>
    
    <text x="300" y="112" text-anchor="middle" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" letter-spacing="3">CERTIFICATE OF ACHIEVEMENT</text>
    <text x="300" y="136" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="11" letter-spacing="1">PROUDLY PRESENTED TO</text>
    
    <text x="300" y="175" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="800" letter-spacing="1.5">ESLAM YASSER</text>
    <line x1="170" y1="188" x2="430" y2="188" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.5"/>
    
    <text x="300" y="226" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="700">${escapeXml(title)}</text>
    <text x="300" y="254" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12">Issued by: ${escapeXml(org)}</text>
    
    <circle cx="300" cy="326" r="20" fill="#052e26" stroke="#34d399" stroke-width="1.5"/>
    <text x="300" y="330" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="8" font-weight="bold" letter-spacing="0.5">VERIFIED</text>
    
    <text x="45" y="375" text-anchor="start" fill="#475569" font-family="'JetBrains Mono', monospace" font-size="10">ID: ${escapeXml(credId)}</text>
    <text x="555" y="375" text-anchor="end" fill="#475569" font-family="sans-serif" font-size="10">Date: ${escapeXml(date)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const VaultCertificates = () => {
  const [certs, setCerts] = useState(initialCertificates);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);
  const vaultRef = useRef(null);

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

            const imgUrl = c.image || (isImg(c.pdfFile) ? c.pdfFile : (c.img || ''));

            return {
              _id: c._id || `cert-${i}`,
              title: c.name || c.title || 'Certificate',
              name: c.name || c.title || 'Certificate',
              org: c.issuer || c.subtitle || c.organization || 'Verified Institution',
              date: c.issueDate || c.year || '2026',
              duration: c.duration || '',
              credentialId: c.credentialId || `CERT-${i + 101}`,
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
      .catch(() => {});
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
          <div className="vault__stage" id="vaultStage">
            {certs.map((cert, i) => {
              const isActive = activeIdx === i;
              const isPast = activeIdx > i;
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

                        {(() => {
                          const hasValidImg = cert.img && typeof cert.img === 'string' && !cert.img.includes('azk1xpfli') && (cert.img.startsWith('http') || cert.img.startsWith('/'));
                          const visualSrc = hasValidImg ? cert.img : getCertificateSvg(cert);

                          return (
                            <div
                              className="vc__preview"
                              title="Click to view full certificate"
                              onClick={() => setSelectedImg(visualSrc)}
                            >
                              <img
                                src={visualSrc}
                                alt={cert.title}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = getCertificateSvg(cert);
                                }}
                              />
                            </div>
                          );
                        })()}
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
