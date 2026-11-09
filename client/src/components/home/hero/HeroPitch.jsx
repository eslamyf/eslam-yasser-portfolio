import React from 'react';
import { SocialLinks } from '../../ui/SocialLinks';

export const HeroPitch = React.forwardRef(({ rollRef }, ref) => {
  return (
    <div className="hero-ref__side-in" ref={ref}>
      <div className="hero-ref__status">
        <i aria-hidden="true"></i>
        <span>Open to work &amp; freelance</span>
      </div>
      <h1 aria-label="I build APIs that last">
        I build{' '}
        <span className="hero-ref__roll" aria-hidden="true">
          <span className="hero-ref__roll-in" ref={rollRef}>
            <span className="hero-ref__w">APIs that last</span>
            <span className="hero-ref__w">Angular apps that scale</span>
            <span className="hero-ref__w">MongoDB models that fit</span>
            <span className="hero-ref__w">APIs that last</span>
          </span>
        </span>
      </h1>
      <div className="hero-ref__btns">
        <a className="btn btn--primary mag" href="#projects">
          <span>See my work</span>
        </a>
        <a
          className="btn btn--ghost mag"
          href="/assets/pdf/EslamCV.pdf"
          download="Eslam_Yasser_CV.pdf"
        >
          <span>Download CV</span>
        </a>
      </div>

      <SocialLinks variant="mobile" />
    </div>
  );
});

HeroPitch.displayName = 'HeroPitch';
