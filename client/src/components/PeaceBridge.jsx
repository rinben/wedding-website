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
        <p>
          There are many official documents that are required to cross the
          US-Canada border. To ensure that you have all the required documents
          please review this page.
        </p>
        <a
          href="https://www.ezbordercrossing.com/the-inspection-experience/documentation-needed-to-cross-border/"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          Required Documentation
        </a>
        <p className="note">
          Note: A standard birth certificate and government-issued ID are no
          longer valid for land travel if you are an adult.
        </p>
      </div>

      <div className="border-info-card">
        <h3>Traveling with Pets</h3>
        <p>
          If you plan on bringing a pet with you, you must have all the
          appropriate paperwork. This includes a valid rabies vaccination
          certificate signed by a licensed veterinarian. For more information
          please review this page.{" "}
        </p>
        <a
          href="https://www.ezbordercrossing.com/the-inspection-experience/travelling-with-pets/"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          Traveling with Pets Information
        </a>
      </div>

      <div className="border-info-card">
        <h3>For More Information</h3>
        <p>For more information here are a few more websites.</p>
        <a
          href="https://www.peacebridge.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          Peace Bridge Official Website
        </a>
        <a
          href="https://www.cbsa-asfc.gc.ca/travel-voyage/checklist-aidememoire-eng.html"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          Canadian Border Checklist
        </a>
        <a
          href="https://www.cbp.gov/travel/us-citizens/know-before-you-go/know-you-go-traveling-abroad"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          United States Returning Citizens Information
        </a>
      </div>
    </div>
  );
}

export default PeaceBridge;
