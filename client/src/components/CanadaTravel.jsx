// src/components/CanadaTravel.jsx
import React from "react";
import "./CanadaTravel.css";

function CanadaTravel() {
  return (
    <div className="canada-travel-container">
      <h2>Hotels & Cottages in Canada</h2>
      <p>
        Here are some of the best places to stay in Crystal Beach and the
        surrounding area.
      </p>

      <div className="map-container">
        <iframe
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed/v1/search?q=places%20to%20stay%20crystal%20beach%2C%20Ontario%2C%20canada&key=AIzaSyDOQJWDd6WPTjWK2SpheTxUCAzbwy_m8RU"
        ></iframe>
      </div>

      <h3>Hotels</h3>
      <div className="travel-grid">
        <div className="travel-card">
          <h4>Hotel Name</h4>
          <img src="/path/to/hotel-photo.jpg" alt="Hotel Name" />
          <p>A short description of the hotel and its amenities.</p>
          <a href="#" className="travel-button">
            Visit Website
          </a>
        </div>
        {/* Add more hotel cards here */}
      </div>

      <h3>Motels</h3>
      <div className="travel-grid">
        <div className="travel-card">
          <h4>Motel Name</h4>
          <img src="/path/to/motel-photo.jpg" alt="Motel Name" />
          <p>A short description of the motel and its amenities.</p>
          <a href="#" className="travel-button">
            Visit Website
          </a>
        </div>
        {/* Add more motel cards here */}
      </div>

      <h3>Cottage Rentals</h3>
      <div className="travel-grid">
        <div className="travel-card">
          <h4>Cottage Name</h4>
          <img src="/path/to/cottage-photo.jpg" alt="Cottage Name" />
          <p>A short description of the cottage and its amenities.</p>
          <a href="#" className="travel-button">
            Visit Website
          </a>
        </div>
        {/* Add more cottage rental cards here */}
      </div>
    </div>
  );
}

export default CanadaTravel;
