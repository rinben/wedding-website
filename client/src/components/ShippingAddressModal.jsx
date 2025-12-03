// client/src/components/ShippingAddressModal.jsx
import React from "react";

// NOTE: Address is hardcoded here for maximum security, as retrieving it
// via a public API endpoint would expose private information.
const SHIPPING_ADDRESS_DETAILS = {
  name: "Sara & Ben Kolipinski",
  street: "800 Loretta St.",
  city: "Tonawanda",
  state: "New York",
  zip: "14150",
  country: "USA",
};

function ShippingAddressModal({ onClose, itemName, itemLink }) {
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
    onClose(); // Close the modal first
    window.open(itemLink, "_blank"); // Open the vendor site in a new tab
  };

  return (
    <div className="shipping-modal-overlay">
      <div className="shipping-modal-card">
        <h2>
          <span style={{ color: "red", fontWeight: "bold" }}>Important!</span>
        </h2>
        <p>You are purchasing the **{itemName}**.</p>

        <p>
          Since our wedding is in **Canada**, transporting gifts across the
          border is difficult. We kindly ask that all gifts be **shipped
          directly to our US home address**.
        </p>

        <h3>Our Shipping Address:</h3>
        <div
          className="address-display"
          style={{
            border: "1px dashed #ccc",
            padding: "1rem",
            marginBottom: "1rem",
            textAlign: "left",
          }}
        >
          {/* Display address using <pre> to maintain formatting for easy manual copy */}
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
          style={{ marginTop: "1.5rem", fontWeight: "bold", color: "darkred" }}
        >
          Don't forget to return to this page to claim the item after
          purchasing!
        </p>

        <div className="modal-buttons" style={{ marginTop: "1.5rem" }}>
          <button onClick={handleRedirect} className="registry-button">
            OK, Go To Store Site
          </button>
          <button
            onClick={onClose}
            style={{ backgroundColor: "#ccc", color: "#333" }}
          >
            Cancel Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShippingAddressModal;
