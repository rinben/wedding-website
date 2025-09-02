// src/components/CanadaTravel.jsx
import React from "react";
import "./CanadaTravel.css";

function CanadaTravel() {
  return (
    <div className="canada-travel-container">
      <h2>Hotels in Canada</h2>
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

      <div className="travel-grid">
        <div className="travel-card">
          <h4>Lakeside Suites</h4>
          <img src="/Lakeside_Suites.jpg" alt="Hotel Name" />
          <p>
            In a residential area near Lake Erie, these casual apartments are a
            4-minute walk from Crystal Beach Waterfront Park and Boat Launch,
            and 25 km from Niagara Falls International Airport.{" "}
          </p>
          <p>
            Featuring full kitchens, the down-to-earth apartments include
            separate living areas, as well as complimentary Wi-Fi and TVs. Some
            units come with multiple bedrooms.
          </p>
          <p>There's a kids' play area.</p>
          <a href="http://lakesidesuites.ca/" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Hotel Philco</h4>
          <img src="/Hotel_Philco.jpg" alt="Hotel Name" />
          <p>
            A family-owned boutique hotel located in the lakeside community of
            Crystal Beach on the sunny shores of Lake Erie, conveniently located
            in the historic Derby Square building on the corner of Erie and
            Derby Roads.
          </p>
          <a href="https://hotelphilco.com/" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Yellow Door Bed and Breakfast</h4>
          <img src="/Yellow_Door.jpg" alt="Hotel Name" />
          <p>
            Set on a tree-lined residential street, this quaint B&B in a Cape
            Cod–style house is 2 km from the Sanctuary Centre for the Arts. It's
            a 6-minute walk from Crystal Beach along Lake Erie and 4 km from
            Route 3.
          </p>
          <p>
            A warmly decorated room features free Wi-Fi, a flat-screen TV and a
            sitting area, as well as a private bathroom. A colourful suite adds
            a fully stocked minifridge, tea and coffeemaking facilities, and a
            separate living room, plus a fireplace and a dining table.
          </p>
          <p>
            Parking is included. Full breakfast is served in-room or on a deck
            surrounded by lush gardens. Organized activities are available.
            Children age 16 and over are welcome.
          </p>
          <a href="http://www.yellowdoorbandb.com/" className="travel-button">
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Comfort Inn</h4>
          <img src="/Comfort_Inn.jpg" alt="Hotel Name" />
          <p>
            This unpretentious low-rise hotel is 2 km from Fort Erie Race Track,
            13 km from Buffalo Zoo and 28 km from Niagara Falls.
          </p>
          <p>
            Down-to-earth rooms come with free Wi-Fi and 42-inch flat-screen
            TVs, as well as coffeemakers. Some have minifridges, microwaves,
            whirlpool tubs and/or pull-out sofas.
          </p>
          <p>
            Breakfast is complimentary. Other amenities include a gym, a
            business centre and a meeting room, as well as a coin-operated
            laundry.
          </p>
          <a
            href="https://www.choicehotels.com/ontario/fort-erie/comfort-inn-hotels/cn004?mc=llrscncn&pmf=canada"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Knights Inn Fort Erie</h4>
          <img src="/Knights_Inn.jpg" alt="Hotel Name" />
          <p>
            In an area filled with fast food restaurants and major
            thoroughfares, this casual hotel off Ontario Highways 3 and 124 is a
            15-minute walk from the Peace Bridge and 2 km from Old Fort Erie.
          </p>
          <p>
            Straightforward rooms provide microwaves, minifridges and
            coffeemakers, in addition to flat-screen TVs and Wi-Fi access.
            Upgraded rooms add whirlpool tubs.
          </p>
          <p>
            Parking is available. Pets are welcome for a surcharge (restrictions
            apply).
          </p>
          <a
            href="https://www.knightsinn.com/ca/on/fort-erie/knights-inn-fort-erie?utm_source=google&utm_medium=organic&utm_campaign=gmb"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        {/* Add more hotel cards here */}
      </div>
    </div>
  );
}

export default CanadaTravel;
