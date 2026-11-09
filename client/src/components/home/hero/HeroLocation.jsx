import React from 'react';
import { SocialLinks } from '../../ui/SocialLinks';

export const HeroLocation = React.forwardRef((props, ref) => {
  return (
    <div className="hero-ref__right-in" ref={ref}>
      <b>Egypt</b>
      <span className="hero-ref__role">Full-Stack Developer · React &amp; Angular</span>
      <SocialLinks variant="desktop" />
    </div>
  );
});

HeroLocation.displayName = 'HeroLocation';
