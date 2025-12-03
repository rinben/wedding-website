// client/src/components/ShippingAddressModal.jsx
import React from "react";

// NOTE: Hardcoded the address here for maximum security.
const SHIPPING_ADDRESS_DETAILS = {
  name: "Sara & Ben Kolipinski",
  street: "800 Loretta St.",
  city: "Tonawanda",
  state: "New York",
  zip: "14150",
  country: "USA",
};

function ShippingAddressModal({ onCancel, onRedirect, itemName, itemLink }) {
  // Consolidate granular details into a single formatted string for copying
  const formattedAddress = `
        ${SHIPPING_ADDRESS_DETAILS.name}
        ${SHIPPING_ADDRESS_DETAILS.street}
        ${SHIPPING_ADDRESS_DETAILS.city}, ${SHIPPING_ADDRESS_DETAILS.state} ${SHIPPING_ADDRESS_DETAILS.zip}
        ${SHIPPING_ADDRESS_DETAILS.country}
    `
    .trim()
    .replace(/\n\s+/g, "\n"); // Clean up spacing and format

  const handleCopy = () => {
    navigator.clipboard
      .writeText(formattedAddress)
      .then(() => {
        alert("Shipping address copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        alert("Failed to copy address. Please copy manually from the box.");
      });
  };

  // The 'OK' button action: close the modal AND redirect to the vendor site
  const handleRedirect = () => {
    onClose(); // 1. Close the modal
    window.open(itemLink, "_blank"); // 2. Open the vendor site in a new tab
  };

  // The 'Cancel Purchase' button action
  const handleCancel = () => {
    onClose(); // Just closes the modal, user stays on the registry page
  };

  return (
    <div className="shipping-modal-overlay">
      <div className="claim-confirmation-card shipping-modal-card">
        <h2>
          <span style={{ color: "var(--color-secondary)" }}>Important!</span>
        </h2>
        <p>You are initiating a purchase for the **{itemName}**.</p>

        <p style={{ marginTop: "1rem" }}>
          Due to our wedding being held in Canada, shipping gifts across the
          border is difficult. We strongly urge you to ship your gift directly
          to our **US home address**.
        </p>

        <h3>Our Shipping Address:</h3>

        <div className="address-display">
          <pre>{formattedAddress}</pre>
        </div>

        <button
          onClick={handleCopy}
          className="copy-button"
          style={{ marginRight: "1rem" }}
        >
          Copy Address to Clipboard
        </button>

        <p
          style={{
            marginTop: "2rem",
            marginBottom: "1rem",
            fontWeight: "bold",
            color: "var(--color-secondary)",
          }}
        >
          After purchasing, you must return to this site to claim the item!
        </p>

        <div className="modal-buttons" style={{ marginTop: "1.5rem" }}>
          <button
            // Attach the new onRedirect handler here
            onClick={onRedirect}
            className="registry-button"
            style={{ backgroundColor: "var(--color-accent-1)" }}
          >
            OK
          </button>
          <button
            // Attach the new onCancel handler here
            onClick={onCancel}
            style={{ backgroundColor: "#ccc", color: "#333" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShippingAddressModal;
