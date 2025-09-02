// src/components/BuffaloTravel.jsx
import React from "react";
import "./BuffaloTravel.css";

function BuffaloTravel() {
  return (
    <div className="buffalo-travel-container">
      <h2>Hotels in Buffalo</h2>
      <p>
        Here are some of the best places to stay in Buffalo and the surrounding
        area.
      </p>

      <div className="map-container">
        <iframe
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed/v1/search?q=places%20to%20stay%20buffalo%20ny&key=AIzaSyDOQJWDd6WPTjWK2SpheTxUCAzbwy_m8RU"
        ></iframe>
      </div>

      <div className="travel-grid">
        <div className="travel-card">
          <h4>Holiday Inn Express & Suites Buffalo Downtown</h4>
          <img
            src="/holiday_inn.jpg"
            alt="Holiday Inn Express & Suites Buffalo Downtown"
          />
          <p>
            Set among the bars and restaurants of Downtown, this informal
            all-suite hotel is a minute's walk from the nearest light rail
            station, 7 minutes away on foot from the Buffalo Niagara Convention
            Center and 2 miles from Seneca Buffalo Creek Casino.
          </p>
          <p>
            The unfussy suites come with free Wi-Fi, flat-screen TVs,
            microwaves, and tea and coffeemaking facilities. All also include
            minifridges, and separate living rooms with pull-out sofas.
          </p>
          <p>
            A casino shuttle is complimentary, as is a breakfast buffet. Other
            amenities include a casual restaurant, a 24/7 fitness room and a
            coin-operated laundry.
          </p>
          <a
            href="https://www.ihg.com/holidayinnexpress/hotels/us/en/buffalo/bufms/hoteldetail?cm_mmc=GoogleMaps-_-EX-_-US-_-BUFMS"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Hotel at the Lafayette, Trademark Collection by Wyndham</h4>
          <img
            src="/lafayette.jpg"
            alt="Hotel at the Lafayette, Trademark Collection by Wyndham"
          />
          <p>
            Built in 1904, this polished hotel in downtown is an 8-minute walk
            from Niagara Square and 20.6 miles from Niagara Falls.
          </p>
          <p>
            Streamlined rooms have free Wi-Fi, flat-screen TVs, desks and
            coffeemakers. Vibrant 1- and 2-bedroom suites add full kitchens, and
            living areas with wood floors and plush sofas. Breakfast is
            complimentary, and there's a fitness center and event space. Dining
            options consist of 3 restaurants, including a brewpub with an
            on-site brewery.
          </p>
          <a
            href="https://www.wyndhamhotels.com/trademark/buffalo-new-york/hotel-at-the-lafayette-a-trademark-collection-hotel/overview?CID=LC:4d7auublw4ufaga:51765&iata=00093796"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>Courtyard by Marriott Buffalo Downtown/Canalside</h4>
          <img
            src="/courtyard.jpeg"
            alt="Courtyard by Marriott Buffalo Downtown/Canalside"
          />
          <p>
            Set in the lively Canalside area, this modern hotel with views of
            the Buffalo River is off I-190 and next to a metro rail station.
            It's 1 block from KeyBank Center.
          </p>
          <p>
            Contemporary rooms offer free Wi-Fi, desks with ergonomic chairs,
            and flat-screen TVs, as well as microwaves, minifridges and
            coffeemakers. Studios add sitting/living areas. Some quarters
            feature river views.
          </p>
          <p>
            An American restaurant serves breakfast and dinner, as well as
            all-day drinks, including Starbucks coffee. Other amenities consist
            of an indoor pool, an exercise room and a business center, plus 4
            meeting rooms. Parking is available for a fee.
          </p>
          <a
            href="https://www.marriott.com/en-us/hotels/bufdt-courtyard-buffalo-downtown-canalside/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0"
            className="travel-button"
          >
            Visit Website
          </a>
        </div>
        <div className="travel-card">
          <h4>The Westin Buffalo</h4>
          <img src="/westin.jpg" alt="The Westin Buffalo" />
          <p>
            Set in a sleek building with views of Lake Erie, this upscale hotel
            on a bustling street in downtown Buffalo is a 5-minute walk from the
            nearest metro station, a mile from the lively Canalside District and
            5 miles from Buffalo Zoo.
          </p>
          <p>
            Elegant rooms with rustic-chic accents include 55-inch flat-screens,
            Wi-Fi (fee) and coffeemakers. Upgraded rooms add city or lake views.
            Suites feature living areas with sofas. Upgraded suites come with
            kitchenettes; some add fireplaces and wood-paneled walls. Room
            service is offered.
          </p>
          <p>
            Amenities include a refined restaurant and a casual cafe, as well as
            a kids' club, a business center, and a gym with downtown views.
          </p>
          <a
            href="https://www.marriott.com/en-us/hotels/bufwi-the-westin-buffalo/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0"
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

export default BuffaloTravel;
