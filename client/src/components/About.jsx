// src/components/About.jsx
import React from "react";
import { useInView } from "react-intersection-observer";
import "./About.css";

function About() {
  const [refBen, inViewBen] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [refSara, inViewSara] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
      <section id="about-us" className="about-us-container">
        <h2>About the Couple</h2>
        <div
          ref={refBen}
          className={`about-section-ben ${inViewBen ? "is-visible" : ""}`}
        >
          <div className="about-text">
            <h3>About Ben</h3>
            <p>
              Sara and I first crossed paths at the University at Buffalo, where
              we were both in the marching band. While we had a brief
              introduction in 2017 at a band party, our real story started the
              following year. I was taking a break on the sidelines when I felt
              Sara playfully kick my foot. Little did I know, that small
              interaction would be the start of everything for us.
            </p>
            <p className="about-paragraph">
              I started spending as much time with her as I could, at band
              practice and at parties. I finally got up the nerve to ask her out
              in September. Within a month, I knew I loved her, and within a
              year, I knew she was the one I wanted to marry. On July 16, 2024,
              I finally asked her to be my wife. I can't wait to make more
              memories with the person I love.
            </p>
            <p className="about-signature">- Ben</p>
          </div>
          <div className="about-photo">
            <img src="/ben-solo.jpg" alt="Ben" />
          </div>
        </div>

        <div
          ref={refSara}
          className={`about-section-sara ${inViewSara ? "is-visible" : ""}`}
        >
          <div className="about-photo">
            <img src="/sara-solo.jpg" alt="Sara" />
          </div>
          <div className="about-text">
            <h3>About Sara</h3>
            <p>
              This is where Sara's story will go. Describe her personality, what
              you love about her, and her passions. It can be a short and sweet
              paragraph.
            </p>
          </div>
        </div>
      </section>
  );
}

export default About;
