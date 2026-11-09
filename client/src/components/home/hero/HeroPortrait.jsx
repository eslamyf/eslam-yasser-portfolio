import React from 'react';
import meWebp from '../../../assets/me.webp';
import me960Webp from '../../../assets/me-960.webp';
import mePng from '../../../assets/me.png';

export const HeroPortrait = React.forwardRef((props, ref) => {
  return (
    <div className="hero-ref__photo" ref={ref}>
      <div className="hero-ref__photo-inner">
        <div className="hero-ref__rim-wrap">
          <picture className="hero-ref__pic">
            <source media="(max-width: 900px)" srcSet={me960Webp} type="image/webp" />
            <source srcSet={meWebp} type="image/webp" />
            <img
              className="hero-ref__me"
              src={mePng}
              alt="Eslam Yasser - Full-Stack Developer"
              width="1632"
              height="1932"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onLoad={() => {
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
              }}
            />
          </picture>
        </div>
      </div>
    </div>
  );
});

HeroPortrait.displayName = 'HeroPortrait';

