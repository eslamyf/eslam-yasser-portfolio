import React from 'react';

export const Logo = ({ size = 36, className = '', showText = false, animated = true }) => {
  return (
    <div className={`ey-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'ey-logo-svg animated' : 'ey-logo-svg'}
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          {/* Deep cyber dark glass background */}
          <radialGradient id="ey-bg-grad" cx="50%" cy="25%" r="85%">
            <stop offset="0%" stopColor="#0d1b33" />
            <stop offset="60%" stopColor="#070d1a" />
            <stop offset="100%" stopColor="#03060c" />
          </radialGradient>

          {/* Electric Neon Brand Gradients */}
          <linearGradient id="ey-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#9d4edd" />
          </linearGradient>

          <linearGradient id="ey-secondary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0066ff" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id="ey-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0072FF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9d4edd" stopOpacity="0.75" />
          </linearGradient>

          {/* Precision Neon Glow Filter */}
          <filter id="ey-neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow Filter */}
          <filter id="ey-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0072FF" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Squircle Badge Container */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#ey-bg-grad)"
          stroke="url(#ey-border-grad)"
          strokeWidth="1.8"
          filter="url(#ey-drop-shadow)"
        />

        {/* Ambient Core Lighting */}
        <circle cx="50" cy="50" r="30" fill="#0072FF" opacity="0.1" filter="url(#ey-neon-glow)" />

        {/* Monogram Graphic Layer */}
        <g filter="url(#ey-neon-glow)">
          {/* Letter 'E' Path (Geometric Rounded) */}
          <path
            d="M 46 28 H 27 C 23.5 28 21 30.5 21 34 V 66 C 21 69.5 23.5 72 27 72 H 46"
            stroke="url(#ey-primary-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* 'E' Middle Cyber Bar */}
          <path
            d="M 23 50 H 41"
            stroke="url(#ey-primary-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Letter 'Y' Upper Branch (Code Bracket / Slash Inspired) */}
          <path
            d="M 54 28 L 66 48 L 78 28"
            stroke="url(#ey-secondary-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Letter 'Y' Stem */}
          <path
            d="M 66 48 V 72"
            stroke="url(#ey-secondary-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* High-Tech Terminal Accent Dot */}
          <circle cx="78" cy="72" r="3.5" fill="#00F5FF" />

          {/* Subtle Code Spark / Star at Top Right */}
          <path
            d="M 83 18 L 84.5 22.5 L 89 24 L 84.5 25.5 L 83 30 L 81.5 25.5 L 77 24 L 81.5 22.5 Z"
            fill="#00F5FF"
            opacity="0.95"
          />
        </g>
      </svg>

      {showText && (
        <div className="ey-logo-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{
            fontSize: `${Math.round(size * 0.44)}px`,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #FFFFFF 30%, #00F5FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'inherit'
          }}>
            Eslam Yasser
          </span>
          <span style={{
            fontSize: `${Math.round(size * 0.22)}px`,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'hsl(var(--fg-muted, 215 15% 65%))',
            marginTop: '2px'
          }}>
            Full-Stack Dev
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
