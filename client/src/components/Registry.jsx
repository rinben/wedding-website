// src/components/Registry.jsx
import React from "react";
import "./Registry.css";

function Registry() {
  return (
    <div className="registry-page-container">
      <h2>Gift Registry</h2>
      <p>
        Your presence is the only gift we need, but if you're feeling generous,
        here are a few things we've been saving up for!
      </p>

      <div className="registry-grid">
        <div className="registry-card">
          <h3>Amazon</h3>
          <img src="/path/to/amazon-photo.jpg" alt="Amazon Registry" />
          <p>Explore our curated list of items on Amazon.</p>
          <a
            href="https://www.amazon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="registry-button"
          >
            Shop Now
          </a>
        </div>
        <div className="registry-card">
          <h3>Walmart</h3>
          <img src="/path/to/walmart-photo.jpg" alt="Walmart Registry" />
          <p>Find some of our favorite things from Walmart.</p>
          <a
            href="https://www.walmart.com"
            target="_blank"
            rel="noopener noreferrer"
            className="registry-button"
          >
            Shop Now
          </a>
        </div>
        <div className="registry-card">
          <h3>Pottery Barn</h3>
          <img
            src="/path/to/potterybarn-photo.jpg"
            alt="Pottery Barn Registry"
          />
          <p>Help us furnish our new home with some items from Pottery Barn.</p>
          <a
            href="https://www.potterybarn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="registry-button"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default Registry;
