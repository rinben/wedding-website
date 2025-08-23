// src/components/Itinerary.jsx
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import "./Itinerary.css";

function Itinerary() {
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

  return (
    <section className="itinerary-container">
      <h2>Wedding Day Itinerary</h2>
      <div className="timeline">
        {/* Public Events */}
        <div
          ref={ref1}
          className={`timeline-item ${inView1 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>Friday Sept. 11th 2026</h3>
            <p>7:00 PM</p>
          </div>
          <div className="timeline-content">
            <h4>Welcome Party</h4>
            <p>
              <b>Location:</b> Gather Tasting Room
            </p>
          </div>
        </div>
        <div
          ref={ref2}
          className={`timeline-item ${inView2 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>Saturday Sept. 12th 2026</h3>
            <p>3:00 PM</p>
          </div>
          <div className="timeline-content">
            <h4>Wedding Ceremony</h4>
            <p>
              <b>INVITED GUESTS ONLY</b>
            </p>
            <p>
              <b>Location:</b> Bay Beach Club
            </p>
          </div>
        </div>
        <div
          ref={ref3}
          className={`timeline-item ${inView3 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>Saturday Sept. 12th 2026</h3>
            <p>5:00 PM</p>
          </div>
          <div className="timeline-content">
            <h4>Cocktail Hour</h4>
            <p>
              <b>Location:</b> Bay Beach Club
            </p>
          </div>
        </div>
        <div
          ref={ref4}
          className={`timeline-item ${inView4 ? "is-visible" : ""}`}
        >
          <div className="timeline-dot"></div>
          <div className="timeline-date">
            <h3>Saturday Sept. 12th 2026</h3>
            <p>6:00 PM</p>
          </div>
          <div className="timeline-content">
            <h4>Dinner and Reception</h4>
            <p>
              <b>Location:</b> Bay Beach Club
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Itinerary;
