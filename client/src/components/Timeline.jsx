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
              practice.
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
            <p>We had our first date at Chipotle, and the rest was history!</p>
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
            <p>Ben knew he was in love within a month of their first date.</p>
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
            <p>Our first solo vacation together to Matthews, VA.</p>
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
            <p>We moved into Ben's first apartment together.</p>
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
            <p>We expanded our family with our beloved cat, Juniper!</p>
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
            <p>Sara graduated from the University at Buffalo.</p>
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
            <p>The couple took a big step and moved in together.</p>
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
            <p>Ben graduated from the University at Buffalo.</p>
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
            <p>A memorable trip to California with some friends.</p>
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
            <p>Ben and Sara bought their first house together.</p>
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
            <h4>Ben Proposes</h4>
            <p>Ben asked Sara to be his wife, and she said yes!</p>
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
            <p>We'll be taking a wonderful vacation to Maine this summer.</p>
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
