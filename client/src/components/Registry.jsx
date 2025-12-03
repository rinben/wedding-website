// src/components/Registry.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Registry.css";

// --- FUND DEFINITIONS (Absolute URLs ensured) ---

const HONEYMOON_FUND = {
  id: "fund-honeymoon",
  name: "Honeymoon Fund",
  link: "https://withjoy.com/sara-and-ben-sep-26/registry", // Ensure this has https://
  price: 5000.0, // Goal (Internal tracking only)
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
  link: "https://withjoy.com/sara-and-ben-sep-26/registry", // Ensure this has https://
  price: 3000.0, // Goal (Internal tracking only)
  quantityNeeded: 1,
  quantityClaimed: 0,
  status: "AVAILABLE",
  isFund: true,
  imagePath: "/home-upgrade-fund.jpg",
  description:
    "Contribute to upgrading our new home, from landscaping to new furniture!",
};

// --- MAIN COMPONENT ---

function Registry() {
  const [registryItems, setRegistryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimed, setShowClaimed] = useState(false);
  const [claimItemId, setClaimItemId] = useState(null);

  // Function to fetch the physical items
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

  // COMBINED useEffect: Checks Local Storage AND fetches data
  useEffect(() => {
    // 1. Check Local Storage on component mount
    const pendingClaimId = localStorage.getItem("pendingRegistryClaim");
    if (pendingClaimId) {
      setClaimItemId(pendingClaimId);
    }

    // 2. Fetch the data
    fetchRegistryItems();
  }, []); // Runs once on mount

  // New function to handle the pre-purchase click (Claim logic step 1)
  const handlePurchaseClick = (e, item) => {
    e.preventDefault(); // Stop default navigation for now

    const proceed = window.confirm(
      `You are about to be redirected to the external retailer (${item.name}).\n\n` +
        `To prevent duplicate gifts, please return to this page IMMEDIATELY after purchase to confirm the item has been claimed!`,
    );

    if (proceed) {
      // 1. Save the item ID to local storage (for state persistence on accidental refresh)
      localStorage.setItem("pendingRegistryClaim", item.id);

      // 2. Open the link in a new tab (Fix for step 46)
      window.open(item.link, "_blank");

      // 3. GUARANTEED FIX: Immediately set state to show the modal card on the current screen
      setClaimItemId(item.id);
    }
  };

  // New function to handle the claim confirmation when the user returns (Claim logic step 2)
  const handleClaimConfirmation = async (isConfirmed) => {
    const itemId = claimItemId;

    // 1. Clear the storage regardless of their answer
    localStorage.removeItem("pendingRegistryClaim");
    setClaimItemId(null); // Clear the prompt

    if (isConfirmed && itemId) {
      // --- START: BACKEND CLAIM API CALL ---
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/registry/claim/${itemId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const result = await response.json();

        if (response.ok) {
          alert(`Success! ${result.message} It is now marked as claimed.`);
        } else {
          // Display error message from backend (e.g., "Item already claimed")
          alert(`Claim Failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Claim error:", error);
        alert("Error connecting to the server. Please check your connection.");
      }
      // --- END: BACKEND CLAIM API CALL ---

      // 2. Refresh the registry list to show the new status immediately
      fetchRegistryItems();
    } else if (isConfirmed) {
      alert("Claim failed: Item ID not found.");
    }
  };

  // Combine static fund items and database items. Funds appear first.
  const allItems = [HONEYMOON_FUND, HOME_UPGRADE_FUND, ...registryItems];

  // Filter items based on the toggle button
  const filteredItems = allItems.filter((item) => {
    // Funds are always visible regardless of toggle
    if (item.isFund) {
      return true;
    }

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

  // --- RENDERING CHECKS (Must be placed before the final return) ---
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
              {/* Image - Prioritize dynamic URL from database */}
              <img
                src={item.image_url || imageSrc} // item.image_url is the new scraped link
                alt={item.name}
              />
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
                // ONLY use the custom handler for physical items
                onClick={
                  item.isFund ? undefined : (e) => handlePurchaseClick(e, item)
                }
                className={`registry-button ${isFulfilled && !item.isFund ? "disabled" : ""}`}
              >
                {buttonText}
              </a>
            </div>
          );
        })}
      </div>

      {/* --- MODAL OVERLAY RENDER --- */}
      {claimItemId && (
        <div className="claim-confirmation-modal-overlay">
          <div className="claim-confirmation-card">
            <h2>Purchase Confirmation</h2>
            <p>
              You opened the link to
              {allItems.find((item) => item.id === claimItemId)?.name ||
                "an item"}
              .
            </p>
            <p>Did you successfully complete the purchase?</p>
            <div className="modal-buttons">
              <button onClick={() => handleClaimConfirmation(true)}>
                Yes, I purchased it!
              </button>
              <button onClick={() => handleClaimConfirmation(false)}>
                No, I canceled it.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registry;
