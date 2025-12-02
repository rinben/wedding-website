// src/components/Registry.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Registry.css";

// Honeymoon Fund object (static data for the fund)
const HONEYMOON_FUND = {
  id: "fund",
  name: "Honeymoon Fund",
  link: "https://example.com/honeymoon-fund", // *** UPDATE THIS WITH YOUR REAL FUND LINK ***
  price: 5000.0, // Honeymoon Goal
  quantityNeeded: 1,
  quantityClaimed: 0,
  status: "AVAILABLE",
  isFund: true,
  imagePath: "/honeymoon-fund.jpg", // Add a fitting image to your public folder
  description:
    "Help us make our dream honeymoon a reality! Every contribution makes a difference.",
};

function Registry() {
  const [registryItems, setRegistryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimed, setShowClaimed] = useState(false); // Default: Hide claimed items

  useEffect(() => {
    const fetchRegistryItems = async () => {
      try {
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

  // Combine database items and the static fund item
  const allItems = [HONEYMOON_FUND, ...registryItems];

  // Filter items based on the toggle button
  const filteredItems = allItems.filter((item) => {
    // A fund is always shown unless we specifically mark it as fulfilled
    const isFulfilled =
      item.quantityClaimed >= item.quantityNeeded &&
      item.status !== "AVAILABLE";

    // If showClaimed is true, return all items
    if (showClaimed) {
      return true;
    }
    // If showClaimed is false, return only items that are NOT fulfilled
    return !isFulfilled || item.isFund; // Always show funds, only show items if NOT fulfilled
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
          // Determine if item is claimed/fulfilled to style the card
          const isFulfilled =
            item.quantityClaimed >= item.quantityNeeded &&
            item.status !== "AVAILABLE";
          const isClaimedByAdmin = item.status === "FULFILLED";
          const buttonText = item.isFund
            ? "Contribute to Fund"
            : isClaimedByAdmin
              ? "Purchased / Fulfilled"
              : "View & Purchase";
          const imageSrc = item.imagePath || "/registry-default.jpg";

          return (
            <div
              key={item.id}
              className={`registry-card ${isFulfilled ? "claimed" : ""}`}
            >
              {/* NOTE: You should add images for your items to your client/public folder */}
              <img src={imageSrc} alt={item.name} />
              <h3>{item.name}</h3>

              {/* Price / Fund Goal Display */}
              {item.isFund ? (
                <p>{item.description}</p>
              ) : (
                <p>Price: ${item.price ? item.price.toFixed(2) : "N/A"}</p>
              )}

              {/* Quantity Display */}
              {!item.isFund && item.quantityNeeded > 0 && (
                <p>
                  Needed: {item.quantityNeeded - item.quantityClaimed} of{" "}
                  {item.quantityNeeded}
                  {item.quantityClaimed > 0 && (
                    <span> (Claimed: {item.quantityClaimed})</span>
                  )}
                </p>
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
