// src/components/Itinerary.jsx
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import "./Itinerary.css";

function Itinerary() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref4, inView4] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="itinerary-container">
      <h2>Wedding Day Itinerary</h2>
      <div className="itinerary-timeline">
        {/* Friday Welcome Party */}
        <div
          ref={ref1}
          className={`itinerary-timeline-item ${inView1 ? "is-visible" : ""}`}
        >
          <div className="itinerary-timeline-dot"></div>
          <div className="itinerary-card">
            <h3 className="itinerary-date">Friday Sept. 11th 2026</h3>
            <p className="itinerary-time">6:00 PM</p>
            <hr />
            <h4>Optional Welcome Party</h4>
            <p>
              <b>Location:</b> Bay Beach Club
            </p>
          </div>
        </div>

        {/* Saturday Ceremony */}
        <div
          ref={ref2}
          className={`itinerary-timeline-item ${inView2 ? "is-visible" : ""}`}
        >
          <div className="itinerary-timeline-dot"></div>
          <div className="itinerary-card">
            <h3 className="itinerary-date">Saturday Sept. 12th 2026</h3>
            <p className="itinerary-time">4:00 PM</p>
            <hr />
            <h4>Wedding Ceremony</h4>
            <p>
              <b>Location:</b> Bay Beach Club
            </p>
          </div>
        </div>

        {/* Saturday Cocktail Hour */}
        <div
          ref={ref3}
          className={`itinerary-timeline-item ${inView3 ? "is-visible" : ""}`}
        >
          <div className="itinerary-timeline-dot"></div>
          <div className="itinerary-card">
            <h3 className="itinerary-date">Saturday Sept. 12th 2026</h3>
            <p className="itinerary-time">Following Ceremony</p>
            <hr />
            <h4>Cocktail Hour</h4>
            <p>
              <b>Location:</b> Bay Beach Club
            </p>
          </div>
        </div>

        {/* Saturday Reception */}
        <div
          ref={ref4}
          className={`itinerary-timeline-item ${inView4 ? "is-visible" : ""}`}
        >
          <div className="itinerary-timeline-dot"></div>
          <div className="itinerary-card">
            <h3 className="itinerary-date">Saturday Sept. 12th 2026</h3>
            <p className="itinerary-time">5:30 PM - 10:00 PM</p>
            <hr />
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
