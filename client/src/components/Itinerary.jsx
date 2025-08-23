// src/components/Timeline.jsx
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import "./Timeline.css";

function Timeline() {
  const [showSecret, setShowSecret] = useState({});

  const toggleSecret = (id) => {
    setShowSecret((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref4, inView4] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref5, inView5] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref6, inView6] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref7, inView7] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref8, inView8] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref9, inView9] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref10, inView10] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref11, inView11] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref12, inView12] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref13, inView13] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref14, inView14] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref15, inView15] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref16, inView16] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref17, inView17] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="timeline-container">
      <h2>Our Relationship Timeline</h2>
      <div className="timeline">
        {/* Public Events */}
        <div
          ref={ref1}
          className={`timeline-item ${inView1 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>November 2017</h3>
          </div>
          <div className="timeline-content">
            <h4>First Interaction</h4>
            <p>We first crossed paths at a marching band party.</p>
          </div>
        </div>
        <div
          ref={ref2}
          className={`timeline-item ${inView2 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>August 2018</h3>
          </div>
          <div className="timeline-content">
            <h4>We Met</h4>
            <p>
              Our real friendship and relationship began during marching band
              practice when Sara playfully kicked Ben's foot.
            </p>
          </div>
        </div>
        <div
          ref={ref3}
          className={`timeline-item ${inView3 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>September 2018</h3>
          </div>
          <div className="timeline-content">
            <h4>First Date</h4>
            <p>
              We had our first date at Chipotle. Before Ben could get up the
              nerve to kiss Sara goodbye, Sara left with her friend Kaitlyn.
            </p>
          </div>
        </div>
        <div
          ref={ref4}
          className={`timeline-item ${inView4 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>November 2018</h3>
          </div>
          <div className="timeline-content">
            <h4>Said "I Love You"</h4>
            <p>
              Our friends kept saying that it was too early, but we both knew.
              We had never felt love like this.
            </p>
          </div>
        </div>
        {/* Secret Event: June 2020 */}
        <div
          ref={ref5}
          className={`timeline-item ${inView5 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event5")}
          ></div>
          {showSecret["event5"] && (
            <div className="timeline-date">
              <h3>June 2020</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event5"] ? "is-shown" : ""}`}
          >
            <h4>Vacation to Matthews, VA</h4>
            <p>
              Our first solo vacation together to Matthews, VA. Ask Ben about
              his run in with a shark!
            </p>
          </div>
        </div>
        {/* Secret Event: August 2020 */}
        <div
          ref={ref6}
          className={`timeline-item ${inView6 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event6")}
          ></div>
          {showSecret["event6"] && (
            <div className="timeline-date">
              <h3>August 2020</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event6"] ? "is-shown" : ""}`}
          >
            <h4>Ben Moves into His Apartment</h4>
            <p>
              Ben and his roommate Connor get an apartment in Buffalo to finish
              college. Sara was over as often as she could be.
            </p>
          </div>
        </div>
        {/* Secret Event: September 2020 */}
        <div
          ref={ref7}
          className={`timeline-item ${inView7 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event7")}
          ></div>
          {showSecret["event7"] && (
            <div className="timeline-date">
              <h3>September 2020</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event7"] ? "is-shown" : ""}`}
          >
            <h4>Juniper Moves in with Ben</h4>
            <p>
              Juniper was Ben's family cat. Sara immediately fell in love with
              her.
            </p>
          </div>
        </div>
        {/* Secret Event: May 2021 */}
        <div
          ref={ref8}
          className={`timeline-item ${inView8 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event8")}
          ></div>
          {showSecret["event8"] && (
            <div className="timeline-date">
              <h3>May 2021</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event8"] ? "is-shown" : ""}`}
          >
            <h4>Sara Graduates</h4>
            <p>Sara graduated from the University at Buffalo!</p>
          </div>
        </div>
        {/* Public Event: July 2021 */}
        <div
          ref={ref9}
          className={`timeline-item ${inView9 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>July 2021</h3>
          </div>
          <div className="timeline-content">
            <h4>Sara Moved In</h4>
            <p>
              After Sara graduated, She fully moved into the apartment with Ben.
              For the first time, we were living together without anyone else.
            </p>
          </div>
        </div>
        {/* Secret Event: May 2022 */}
        <div
          ref={ref10}
          className={`timeline-item ${inView10 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event10")}
          ></div>
          {showSecret["event10"] && (
            <div className="timeline-date">
              <h3>May 2022</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event10"] ? "is-shown" : ""}`}
          >
            <h4>Ben Graduates</h4>
            <p>Ben graduated from the University at Buffalo!</p>
          </div>
        </div>
        {/* Secret Event: September 2023 */}
        <div
          ref={ref11}
          className={`timeline-item ${inView11 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event11")}
          ></div>
          {showSecret["event11"] && (
            <div className="timeline-date">
              <h3>September 2023</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event11"] ? "is-shown" : ""}`}
          >
            <h4>Vacation to California</h4>
            <p>
              A memorable trip to California. It felt like two vacations in one.
              We had a week just the two of us, then we spent the weekend with
              friends celebrating Eric and Bill.
            </p>
            <p>P.S. Ben buys the first engagement ring!</p>
          </div>
        </div>
        {/* Public Event: December 2023 */}
        <div
          ref={ref12}
          className={`timeline-item ${inView12 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>December 2023</h3>
          </div>
          <div className="timeline-content">
            <h4>We Got a House</h4>
            <p>
              Ben and Sara bought their first house together. Ask Ben how much
              he loves laying new flooring!
            </p>
          </div>
        </div>
        {/* Secret Event: January 2024 */}
        <div
          ref={ref13}
          className={`timeline-item ${inView13 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event13")}
          ></div>
          {showSecret["event13"] && (
            <div className="timeline-date">
              <h3>January 2024</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event13"] ? "is-shown" : ""}`}
          >
            <h4>Rinaldo Family Cruise</h4>
            <p>A fun-filled cruise with the Rinaldo family.</p>
            <p>P.S. Ben is in contact with the jeweler to perfect the ring.</p>
          </div>
        </div>
        {/* Public Event: May 2024 */}
        <div
          ref={ref14}
          className={`timeline-item ${inView14 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>May 2024</h3>
          </div>
          <div className="timeline-content">
            <h4>We Got a Dog</h4>
            <p>
              The couple expanded their family with their beloved dog, Sokka!
            </p>
          </div>
        </div>
        {/* Public Event: July 16, 2024 */}
        <div
          ref={ref15}
          className={`timeline-item ${inView15 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>July 16, 2024</h3>
          </div>
          <div className="timeline-content">
            <h4>
              Ben Proposes while we are on a trip around Lake Michigan and Lake
              Huron.
            </h4>
            <p>
              We went on a week long road trip through Chicago, Upper Peninsula,
              and the Manatoulin Islands. While exploring Sable Falls in the
              upper peninsula of Michigan, Ben asked Sara to be his wife, and
              she said yes! Ask us about the proposal!
            </p>
            <p>
              P.S. Ben received the ring in the mail the day before we left for
              our trip.
            </p>
          </div>
        </div>
        {/* Secret Event: July 2025 */}
        <div
          ref={ref16}
          className={`timeline-item ${inView16 ? "is-visible" : ""}`}
        >
          <div
            className="timeline-dot secret-dot"
            onClick={() => toggleSecret("event16")}
          ></div>
          {showSecret["event16"] && (
            <div className="timeline-date">
              <h3>July 2025</h3>
            </div>
          )}
          <div
            className={`timeline-content secret-content ${showSecret["event16"] ? "is-shown" : ""}`}
          >
            <h4>Vacation to Maine</h4>
            <p>
              To stick to our growing tradition, we take a road trip to Maine to
              visit Bar Harbor, Acadia National Park, Portland and the coast of
              Maine. Ask us about our favorite places!
            </p>
          </div>
        </div>
        {/* Public Event: September 12, 2026 */}
        <div
          ref={ref17}
          className={`timeline-item ${inView17 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>September 12, 2026</h3>
          </div>
          <div className="timeline-content">
            <h4>Wedding Day</h4>
            <p>We can't wait to celebrate our big day with you!</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Timeline;
