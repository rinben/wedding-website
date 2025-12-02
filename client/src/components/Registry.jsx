// src/components/Registry.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Registry.css";

// --- FUND DEFINITIONS ---

const HONEYMOON_FUND = {
  id: "fund-honeymoon",
  name: "Honeymoon Fund",
  link: "www.hitchd.com/benandsara", // *** UPDATE THIS WITH YOUR REAL FUND LINK ***
  price: 5000.0, // Goal (Internal tracking only, not displayed)
  quantityNeeded: 1,
  quantityClaimed: 0,
  status: "AVAILABLE",
  isFund: true,
  imagePath: "/honeymoon-fund.jpg", // Add this image to your public folder
  description:
    "Help us make our dream honeymoon a reality! Every contribution makes a difference.",
};

const HOME_UPGRADE_FUND = {
  id: "fund-home",
  name: "Home Upgrade Fund",
  link: "www.hitchd.com/benandsara", // *** UPDATE THIS WITH YOUR REAL FUND LINK ***
  price: 3000.0, // Goal (Internal tracking only, not displayed)
  quantityNeeded: 1,
  quantityClaimed: 0,
  status: "AVAILABLE",
  isFund: true,
  imagePath: "/home-upgrade-fund.jpg", // Add this image to your public folder
  description:
    "Contribute to upgrading our new home, from landscaping to new furniture!",
};

// --- MAIN COMPONENT ---

function Registry() {
  const [registryItems, setRegistryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimed, setShowClaimed] = useState(false); // Default: Hide claimed items

  useEffect(() => {
    const fetchRegistryItems = async () => {
      try {
        // Fetches physical items added via the Admin Dashboard
        const response = await fetch(`${API_BASE_URL}/api/registry`);
        if (!response.ok) {
          throw new Error(`Registry HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRegistryItems(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistryItems();
  }, []);

  // Combine static fund items and database items. Funds appear first.
  const allItems = [HONEYMOON_FUND, HOME_UPGRADE_FUND, ...registryItems];

  // Filter items based on the toggle button
  const filteredItems = allItems.filter((item) => {
    // Funds are always visible regardless of toggle
    if (item.isFund) {
      return true;
    }

    // Check if a physical item is fulfilled
    const isFulfilled =
      item.quantityClaimed >= item.quantityNeeded &&
      item.status !== "AVAILABLE";

    // If showClaimed is true, return all items
    if (showClaimed) {
      return true;
    }
    // If showClaimed is false, return only physical items that are NOT fulfilled
    return !isFulfilled;
  });

  if (loading)
    return <div className="registry-page-container">Loading Registry...</div>;
  if (error)
    return (
      <div className="registry-page-container">Error: {error.message}</div>
    );

  return (
    <div className="registry-page-container">
      <h2>Gift Registry</h2>
      <p>
        Your presence is the only gift we need, but if you're feeling generous,
        here are a few things we've been saving up for!
      </p>

      {/* Toggle Button */}
      <button
        onClick={() => setShowClaimed(!showClaimed)}
        className="registry-toggle-button"
      >
        {showClaimed ? "Hide Purchased Items" : "Show All Items"}
      </button>

      <div className="registry-grid">
        {filteredItems.map((item) => {
          // Determine status for styling
          const isFulfilled =
            item.quantityClaimed >= item.quantityNeeded &&
            item.status !== "AVAILABLE";
          const isClaimedByAdmin = item.status === "FULFILLED";
          const buttonText = item.isFund
            ? "Contribute to Fund"
            : isClaimedByAdmin
              ? "Purchased / Fulfilled"
              : "View & Purchase";

          // Image Path logic: Use item's path or a generic placeholder
          const imageSrc = item.imagePath || "/registry-default.jpg";

          return (
            <div
              key={item.id}
              className={`registry-card ${isFulfilled ? "claimed" : ""}`}
            >
              {/* Image */}
              <img src={imageSrc} alt={item.name} />
              <h3>{item.name}</h3>

              {/* DESCRIPTION & DISPLAY LOGIC: Checks isFund to hide Price/Quantity */}
              {item.isFund ? (
                // Displays only the description for funds
                <p>{item.description}</p>
              ) : (
                // Displays Price and Quantity for physical items
                <>
                  <p>Price: ${item.price ? item.price.toFixed(2) : "N/A"}</p>

                  {item.quantityNeeded > 0 && (
                    <p>
                      Needed: {item.quantityNeeded - item.quantityClaimed} of{" "}
                      {item.quantityNeeded}
                      {item.quantityClaimed > 0 && (
                        <span> (Claimed: {item.quantityClaimed})</span>
                      )}
                    </p>
                  )}
                </>
              )}

              {/* Button */}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`registry-button ${isFulfilled && !item.isFund ? "disabled" : ""}`}
                // Disable button if purchased and not a fund
                onClick={(e) => {
                  if (isFulfilled && !item.isFund) {
                    e.preventDefault();
                    alert("This item has already been purchased!");
                  }
                }}
              >
                {buttonText}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Registry;
