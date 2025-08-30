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
  const [refus, inViewus] = useInView({
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
          <p className="about-paragraph">
            Ben grew up in a small town called Earlville, NY. He won't let you
            forget that either as he constantly says "back where I am from..."
            When he lived back where he is from you could find him hanging with
            friends, swimming/diving, and exploring nature. He enjoys technology
            whether he is playing video games or creating websites. He also
            enjoys movies and music. Ben loves to show me all of his nerdy
            movies and some of them I even enjoy. Ben played baritone and tuba
            in marching band. Ben works as a Math/Music teacher aide in a school
            that specializes in behavior disabilities. He now helps teach
            students to appreciate music through guitar, piano, and modern band.
            When he is not working you can find him playing on his computer or
            camping on the weekend. His love for camping has rubbed off onto me
            as well. Ben is an excellent listener and is always willing to help.
            I am excited to explore new interests and create fun memories that
            will last a lifetime.
          </p>
          <p className="about-signature">- Sara</p>
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
          <p className="about-paragraph">
            Sara grew up in Williamsville, NY. She has a love for Baton
            Twirling, the beach,collecting rocks, and playing music. She spends
            her days at work as an Athletic Trainer and her time off at Crystal
            Beach where she is the third generation to own property near the
            beach. When she is not able to go to Crystal Beach, she spends her
            days creating crafts, painting her nails, and listening to music.
            Sara attended University at Buffalo where she twirled baton in
            marching band and played tenor saxophone in pep band. Sara is the
            perfect compliment to me. I am known to be quite a lot to handle and
            Sara has an abundance of patience. When Sara and I first started
            dating I told her that everyday I find a new reason to love her more
            and that statement is still true today. I cannot wait to find what I
            will love about her in the future.
          </p>
          <p className="about-signature">- Ben</p>
        </div>
      </div>

      <div
        ref={refus}
        className={`about-section-us ${inViewus ? "is-visible" : ""}`}
      >
        <div className="about-text">
          <h3>About Us</h3>
          <p className="about-paragraph">
            When we met we immediately realized how much we had in common and
            over the years that we have been together even more of our interests
            have aligned. We both have a love for listening and creating music.
            It only fits that we would meet through University at Buffalo's
            Thunder of the East Marching Band. We learned that we both love the
            outdoors and through the years our love has only grown. We are
            extremely grateful for our lives as we are fortunate to have a
            house, two loving pets and the opportunity to spend our days doing
            what we love. We are excited to see what our next adventure has in
            store for us; whether that is playing with our dog Sokka, snuggling
            with our cat Juniper, listening and creating music or exploring
            nature.
          </p>
          <p className="about-signature">- Ben & Sara</p>
        </div>
        <div className="about-photo">
          <img src="/ben-sara.jpg" alt="Ben and Sara" />
        </div>
      </div>
    </section>
  );
}

export default About;
