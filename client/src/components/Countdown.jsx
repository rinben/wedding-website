// src/components/Countdown.jsx
import React, { useState, useEffect } from "react";

const weddingDate = new Date("2026-09-12T00:00:00");

function Countdown() {
  const [daysLeft, setDaysLeft] = useState(getDaysUntilWedding());

  function getDaysUntilWedding() {
    const now = new Date();
    const difference = weddingDate.getTime() - now.getTime();

    if (difference <= 0) {
      return 0;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days;
  }

  useEffect(() => {
    const timer = setInterval(
      () => {
        setDaysLeft(getDaysUntilWedding());
      },
      1000 * 60 * 60,
    ); // Update once every hour

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-timer">
      <p className="countdown-text">Days Until We Say "I Do"</p>
      <span className="countdown-days">{daysLeft}</span>
    </div>
  );
}

export default Countdown;
