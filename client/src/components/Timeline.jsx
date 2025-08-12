// src/components/Timeline.jsx
import React from 'react';

function Timeline() {
  return (
    <section>
      <h2>Our Relationship Timeline</h2>
      <ul>
        <li>
          <h3>[Date] - We Met!</h3>
          <p>Where and how did you meet? What were your first impressions of each other?</p>
        </li>
        <li>
          <h3>[Date] - First Date</h3>
          <p>Describe your first date here. Was it a success? What did you do?</p>
        </li>
        <li>
          <h3>[Date] - The Proposal</h3>
          <p>Tell the story of the proposal here. Was it a surprise? How did you feel?</p>
        </li>
      </ul>
    </section>
  );
}

export default Timeline;
