// src/components/restaurants.jsx
import React from "react";
import "./Restaurants.css";

function restaurants() {
  return (
    <div className="restaurants-travel-container">
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

      <div className="travel-grid">
        <div className="travel-card">
          <h4>Crystal Ball Cafe</h4>
          <img src="/Crystal_Ball.jpg" alt="Crystal Ball Cafe" />
          <p>
            Welcome to the Crystal Ball Cafe in Crystal Beach, Ontario. We are
            located on Erie Road, steps from the Bay Beach entrance. We offer a
            great selection of coffees, teas, soups, sandwiches, paninis, and
            fresh baked pastries. There really is something for everyone. With
            friendly service and a great local vibe, come on out and enjoy the
            year round, street side patio so you don’t miss a thing.{" "}
          </p>
          <a href="https://www.crystalballcafe.com/" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>South Coast Cookhouse</h4>
          <img src="/South_Coast.jpg" alt="South Coast Cookhouse" />
          <p>
            Steak, seafood, pasta & pizza, plus pub grub, in a convivial
            bar-&-grill atmosphere.
          </p>
          <a
            href="http://www.southcoastcookhouse.com/"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>sublife: a sandwich joint</h4>
          <img src="/Sublife.jpg" alt="sublife: a sandwich joint" />
          <p>
            A sandwich joint. Their saying is "i didn't choose the sublife, the
            sublife chose me."
          </p>
          <a
            href="http://www.sublifecrystalbeach.com/"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Rizzo's House of Parm</h4>
          <img src="/Rizzos.jpg" alt="Rizzo's House of Parm" />
          <p>Homemade Italian Food, From Our Family to Yours.</p>
          <a href="http://www.rizzoshouseofparm.com/" className="travel-button">
            Visit Website
          </a>
        </div>
        {/* Add more hotel cards here */}
      </div>
    </div>
  );
}

export default restaurants;
