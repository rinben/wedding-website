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
            This is where you'll tell your story! Talk about how you met, some
            of your favorite memories together, and what you're excited for in
            the future.
          </p>
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
