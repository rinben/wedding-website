// src/components/Travel.jsx
import React from "react";
import "./Travel.css";
import { Link } from "react-router-dom";

function Travel() {
  return (
    <div className="travel-page-container">
      <h2>Travel & Accommodation</h2>
      <p>
        We've put together some suggestions for places to stay and things to do
        to make your trip as enjoyable as possible!
      </p>

      <div className="travel-grid">
        <div className="travel-card">
          <h3>Airbnb</h3>
          <img src="/airbnb-photo.jpg" alt="Airbnb in Crystal Beach" />
          <p>
            There are many homes and cottages within walking distance of the
            venue that can be rented through Airbnb. Feel free to explore some
            of the options in the area.
          </p>
          <a
            href="https://www.airbnb.com/s/Crystal-Beach--Ontario--Canada/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJxcy0ick904kRC97fGZ0kerU&acp_id=cc2bb686-69fe-493e-840c-e65905307cbc&date_picker_type=calendar&source=structured_search_input_header&search_type=filter_change&query=Crystal%20Beach%2C%20Ontario%2C%20Canada&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2025-09-01&monthly_length=3&monthly_end_date=2025-12-01&search_mode=regular_search&price_filter_input_type=2&channel=EXPLORE"
            target="_blank"
            rel="noopener noreferrer"
            className="travel-button"
          >
            Explore Airbnb
          </a>
        </div>
        <div className="travel-card">
          <h3>Hotels & Cottages (Canada)</h3>
          <img
            src="/canada-hotel-photo.jpeg"
            alt="Hotels in Crystal Beach, Canada"
          />
          <p>
            For those looking for a hotel or cottage in Canada, there are many
            beautiful options nearby. We have compiled a list of our favorites
            for you to explore.
          </p>
          <Link to="/travel/canada" className="travel-button">
            Explore Options
          </Link>
        </div>
        <div className="travel-card">
          <h3>Hotels (Buffalo)</h3>
          <img src="/buffalo-hotel-photo.jpg" alt="Hotels in Buffalo, NY" />
          <p>
            For our guests traveling from out of town, there are several
            convenient and beautiful hotels in the Buffalo area. Feel free to
            explore some of the options here.
          </p>
          <Link to="/travel/buffalo" className="travel-button">
            Explore Options
          </Link>
        </div>
      </div>

      <h2>Things to Do</h2>
      <div className="travel-grid">
        <div className="travel-card">
          <h3>Restaurants</h3>
          <img src="/restaurants-photo.webp" alt="Restaurants" />
          <p>
            Crystal Beach and the surrounding area offer many great dining
            options, from casual eateries to fine dining. We have listed a few
            of our favorites for you to try.
          </p>
          <Link to="/travel/restaurants" className="travel-button">
            Explore
          </Link>
        </div>
        <div className="travel-card">
          <h3>Bars</h3>
          <img src="/bars-photo.jpg" alt="Bars" />
          <p>
            If you're looking for a place to grab a drink, there are many great
            bars in the area. We have listed a few of our favorites for you to
            check out.
          </p>
          <Link to="/travel/bars" className="travel-button">
            Explore
          </Link>
        </div>
        <div className="travel-card">
          <h3>Attractions</h3>
          <img src="/attractions-photo.jpeg" alt="Attractions" />
          <p>
            There are many fun things to do in the area, from exploring the
            beach to visiting a local museum. We have listed a few of our
            favorites for you to enjoy.
          </p>
          <Link to="/travel/attractions" className="travel-button">
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Travel;
