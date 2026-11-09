import React from 'react';
import {
  IconGithub,
  IconLinkedin,
  IconWhatsapp,
  IconInstagram,
  IconMail
} from '../../assets/icons';

export const SOCIAL_PROFILES = [
  {
    name: 'GitHub',
    href: 'https://github.com/eslamyf',
    icon: IconGithub,
    ariaLabel: 'GitHub'
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/eslamyf/',
    icon: IconLinkedin,
    ariaLabel: 'LinkedIn'
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/201028103634',
    icon: IconWhatsapp,
    ariaLabel: 'WhatsApp'
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/_eslamyf/?hl=ar',
    icon: IconInstagram,
    ariaLabel: 'Instagram'
  },
  {
    name: 'Email',
    href: 'mailto:eslam9076460@gmail.com',
    icon: IconMail,
    ariaLabel: 'Email'
  }
];

export const SocialLinks = ({ variant = 'desktop', className = '' }) => {
  const isMobile = variant === 'mobile';
  const containerClass = isMobile
    ? `hero-ref__mobile-soc ${className}`.trim()
    : `hero-ref__soc ${className}`.trim();

  return (
    <div className={containerClass} aria-label="Social profiles">
      {SOCIAL_PROFILES.map((item) => {
        const Icon = item.icon;
        const isExternal = item.href.startsWith('http');
        return (
          <a
            key={item.name}
            href={item.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={!isMobile ? 'mag' : undefined}
            aria-label={item.ariaLabel}
          >
            <Icon className="i" />
            {!isMobile && <span>{item.name}</span>}
          </a>
        );
      })}
    </div>
  );
};

