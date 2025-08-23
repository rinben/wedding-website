// src/components/Information.jsx
import React from "react";
import "./Information.css";

function Information() {
  return (
    <section id="information" className="information-section">
      <h2>Important Information</h2>
      <div className="info-card-container">
        <div className="info-card">
          <h3>Venue</h3>
          <p>Bay Beach Club, Ontario, Canada</p>
        </div>
        <div className="info-card">
          <h3>Date</h3>
          <p>September 12, 2026</p>
        </div>
        <div className="info-card">
          <h3>Attire</h3>
          <p>Semi-formal colorful</p>
        </div>
      </div>
    </section>
  );
}

export default Information;
