// src/components/CanadaTravel.jsx
import React from "react";
import "./CanadaTravel.css";

function CanadaTravel() {
  return (
    <div className="canada-travel-container">
      <h2>Restaurants</h2>
      <p>
        Here are some of the best places to grab a bite in Crystal Beach and the
        surrounding area.
      </p>

      <div className="map-container">
        <iframe
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed/v1/search?q=restaurants+near+Crystal+Beach,+Fort+Erie,+ON,+Canada&key=AIzaSyDOQJWDd6WPTjWK2SpheTxUCAzbwy_m8RU"
        ></iframe>
      </div>

      <h3>Restaurants</h3>
      <div className="travel-grid">
        <div className="travel-card">
          <h4>Hotel Name</h4>
          <img src="/path/to/hotel-photo.jpg" alt="Hotel Name" />
          <p>A short description of the hotel and its amenities.</p>
          <a href="#" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Hotel Name</h4>
          <img src="/path/to/hotel-photo.jpg" alt="Hotel Name" />
          <p>A short description of the hotel and its amenities.</p>
          <a href="#" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Hotel Name</h4>
          <img src="/path/to/hotel-photo.jpg" alt="Hotel Name" />
          <p>A short description of the hotel and its amenities.</p>
          <a href="#" className="travel-button">
            Visit Website
          </a>
        </div>
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
    </div>
  );
}

export default CanadaTravel;
