// src/components/Timeline.jsx
import React from "react";
import { useInView } from "react-intersection-observer";
import "./Timeline.css";

function Timeline() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="timeline-container">
      <h2>Our Relationship Timeline</h2>
      <div className="timeline">
        <div
          ref={ref1}
          className={`timeline-item ${inView1 ? "is-visible" : ""}`}
        >
          <div className="timeline-date">
            <h3>[Date]</h3>
          </div>
          <div className="timeline-content">
            <h4>We Met!</h4>
            <p>
              Where and how did you meet? What were your first impressions of
              each other?
            </p>
          </div>
        </div>
        <div
          ref={ref2}
          className={`timeline-item ${inView2 ? "is-visible" : ""}`}
        >
          <div className="timeline-date">
            <h3>[Date]</h3>
          </div>
          <div className="timeline-content">
            <h4>First Date</h4>
            <p>
              Describe your first date here. Was it a success? What did you do?
            </p>
          </div>
        </div>
        <div
          ref={ref3}
          className={`timeline-item ${inView3 ? "is-visible" : ""}`}
        >
          <div className="timeline-date">
            <h3>[Date]</h3>
          </div>
          <div className="timeline-content">
            <h4>The Proposal</h4>
            <p>
              Tell the story of the proposal here. Was it a surprise? How did
              you feel?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Timeline;
