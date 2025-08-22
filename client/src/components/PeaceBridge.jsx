import React from "react";
import "./PeaceBridge.css";

function PeaceBridge() {
  return (
    <div className="peace-bridge-container">
      <h2>Crossing the Peace Bridge</h2>
      <p>
        For our guests traveling from the United States, here is some important
        information you will need to cross the Peace Bridge into Canada.
      </p>

      <div className="border-info-card">
        <h3>Required Documents</h3>
        <ul>
          <li>Passport</li>
          <li>Enhanced Driver's License (EDL)</li>
          <li>NEXUS Card</li>
          <li>Free and Secure Trade (FAST) Card</li>
        </ul>
        <p className="note">
          Note: A standard birth certificate and government-issued ID are no
          longer valid for land travel.
        </p>
      </div>

      <div className="border-info-card">
        <h3>Traveling with Pets</h3>
        <p>
          If you plan on bringing a pet with you, you must have all the
          appropriate paperwork. This includes a valid rabies vaccination
          certificate signed by a licensed veterinarian.{" "}
        </p>
      </div>

      <div className="border-info-card">
        <h3>For More Information</h3>
        <p>
          For the most up-to-date information, please visit the official Peace
          Bridge website.
        </p>
        <a
          href="https://www.peacebridge.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          Peace Bridge Official Website
        </a>
      </div>
    </div>
  );
}

export default PeaceBridge;
