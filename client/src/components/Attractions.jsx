// src/components/Attractions.jsx
import React from "react";
import "./Attractions.css";

function Attractions() {
  return (
    <div className="attractions-travel-container">
      <h2>Attractions</h2>
      <p>
        Here are some of the best places to visit in Crystal Beach and the
        surrounding area.
      </p>

      <div className="map-container">
        <iframe
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed/v1/search?q=attractions+near+Crystal+Beach,+Fort+Erie,+ON,+Canada&key=AIzaSyDOQJWDd6WPTjWK2SpheTxUCAzbwy_m8RU"
        ></iframe>
      </div>

      <div className="travel-grid">
        <div className="travel-card">
          <h4>Bay Beach</h4>
          <img src="/Bay_Beach.jpg" alt="Bay Beach" />
          <p>
            Bay Beach, also known as Crystal Beach is located on the shores of
            Lake Erie in the vibrant community of Crystal Beach. One of Fort
            Erie’s most popular tourist destinations, Bay Beach boasts white
            sandy beaches and clear warm waters.
          </p>
          <p>
            Bay Beach has undergone extensive renovations and now provides
            amenities and features including a state-of-the-art washroom
            facility (complete with, change rooms and a water bottle filling
            station), a playground donated by the Ridgeway Lions Club, a
            pavilion, a festival square for community events, an accessible ramp
            down to the beach, beach mats to provide access to the water’s edge.
          </p>
          <p>
            Just steps away, Crystal Beach hosts a variety of cafes,
            restaurants, patios, ice-cream and gelato shops, boutique clothing
            stores and much more! Whether you are looking for a weekend of
            family summer fun, or a relaxing day at the beach, Bay Beach has it
            all.
          </p>
          <p>
            Bay Beach is open to the general public. However, beach capacity
            limits are in effect to ensure safe enjoyment for all.
          </p>
          <a href="https://baybeach.forterie.ca/" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Point Abino Lighthouse</h4>
          <img src="/Point_Abino.jpg" alt="Point Abino Lighthouse" />
          <p>
            The Point Abino Lighthouse is on the rocky north shore of Lake Erie
            in Fort Erie. It was constructed in 1917 by the Department of Marine
            and Fisheries in response to increased traffic at the east end of
            Lake Erie, located between the high and low water marks on the rocky
            shoreline of Point Abino.
          </p>
          <p>
            A beautiful hike, but make sure you purchase a ticket in advance and
            bring your hiking shoes!
          </p>
          <a
            href="https://www.forterie.ca/en/recreation-and-culture/point-abino-lighthouse.aspx"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Local Shops Along Erie Rd. and Hot Dog Alley</h4>
          <img src="/Hotdog_Alley.jpg" alt="Hot Dog Alley" />
          <p>
            The streets near the beach are filled with boutiques and specialty
            stores.
          </p>
          <p>
            Don't miss the famous Derby Rd. or better known as Hotdog Alley!
          </p>
        </div>
        {/* Add more hotel cards here */}
      </div>
    </div>
  );
}

export default Attractions;
