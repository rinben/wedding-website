// src/components/Registry.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Registry.css";

// --- FUND DEFINITIONS (Absolute URLs added for correctness) ---

const HONEYMOON_FUND = {
  id: "fund-honeymoon",
  name: "Honeymoon Fund",
  // CORRECTED: Added https:// for absolute URL
  link: "https://withjoy.com/sara-and-ben-sep-26/registry",
  price: 5000.0, // Goal (Internal tracking only)
  quantityNeeded: 1,
  quantityClaimed: 0,
  status: "AVAILABLE",
  isFund: true,
  imagePath: "/honeymoon-fund.jpg",
  description:
    "Help us make our dream honeymoon a reality! Every contribution makes a difference.",
};

const HOME_UPGRADE_FUND = {
  id: "fund-home",
  name: "Home Upgrade Fund",
  // CORRECTED: Added https:// for absolute URL
  link: "https://withjoy.com/sara-and-ben-sep-26/registry",
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
      // 1. Save the item ID to local storage
      localStorage.setItem("pendingRegistryClaim", item.id);

      // 2. Manually redirect the browser
      window.location.href = item.link;
    }
  };

  // New function to handle the claim confirmation when the user returns (Claim logic step 2)
  const handleClaimConfirmation = (isConfirmed) => {
    const itemId = claimItemId;

    // 1. Clear the storage regardless of their answer
    localStorage.removeItem("pendingRegistryClaim");
    setClaimItemId(null); // Clear the prompt

    if (isConfirmed && itemId) {
      // *** NEXT STEP: We will implement the backend API call here to mark the item as claimed ***
      // For now, give immediate feedback and refresh the list
      alert("Thank you! This item is now marked as claimed.");

      // 2. Refresh the registry list to show the new status
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

  // --- GUARD CLAUSE FOR MODAL ---
  // This must be placed before the main return to interrupt the rendering flow.
  if (claimItemId) {
    const itemToConfirm = allItems.find((item) => item.id === claimItemId);
    if (itemToConfirm) {
      return (
        <div className="claim-confirmation-modal">
          <h2>Welcome Back!</h2>
          <p>Did you successfully purchase **{itemToConfirm.name}**?</p>
          <button onClick={() => handleClaimConfirmation(true)}>
            Yes, I purchased it!
          </button>
          <button onClick={() => handleClaimConfirmation(false)}>
            No, not yet.
          </button>
        </div>
      );
    }
  }

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
                // ONLY use the custom handler for physical items
                onClick={
                  item.isFund ? undefined : (e) => handlePurchaseClick(e, item)
                }
                className={`registry-button ${isFulfilled && !item.isFund ? "disabled" : ""}`}
                // The fund link is handled by the browser's default behavior, which is fine.
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
