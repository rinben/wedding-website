// client/src/components/AdminRegistryManager.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function AdminRegistryManager({ onRegistryUpdate }) {
  const [form, setForm] = useState({
    name: "",
    link: "",
    price: "",
    quantityNeeded: 1,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantityNeeded" ? parseInt(value) : value,
    }));
  };

  const handlePriceLookup = async () => {
    if (!form.link) {
      setStatus("Please enter a URL first.");
      return;
    }
    setLoading(true);
    setStatus("Looking up price...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/price-lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: form.link }),
      });

      const result = await response.json();

      if (response.ok) {
        // Price is returned as a number, format it for display
        setForm((prev) => ({
          ...prev,
          price: result.price ? result.price.toFixed(2) : "",
        }));
        setStatus(result.msg);
      } else {
        setStatus(result.msg || "Price lookup failed. Please enter manually.");
        setForm((prev) => ({ ...prev, price: "" }));
      }
    } catch (error) {
      console.error("Lookup error:", error);
      setStatus("Server error during price lookup.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.link || !form.price || form.quantityNeeded < 1) {
      setStatus("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setStatus("Adding item to registry...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/registry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          link: form.link,
          price: parseFloat(form.price), // Ensure price is float
          quantityNeeded: form.quantityNeeded,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Success: ${result.name} added to registry.`);
        setForm({ name: "", link: "", price: "", quantityNeeded: 1 }); // Reset form
        onRegistryUpdate(); // Callback to refresh the full list in the dashboard
      } else {
        setStatus(result.msg || "Failed to add item to registry.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("Server error during item submission.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div>Authentication required to manage registry.</div>;

  return (
    <div className="registry-manager-container">
      <h3>Add New Registry Item</h3>
      <form onSubmit={handleItemSubmit} className="add-item-form">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Item Name (e.g., Le Creuset Dutch Oven)"
          required
        />
        <div className="link-group">
          <input
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="Product URL"
            required
          />
          <button
            type="button"
            onClick={handlePriceLookup}
            disabled={loading || !form.link}
          >
            {loading ? "Searching..." : "Lookup Price"}
          </button>
        </div>
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          placeholder="Price (e.g., 350.00)"
          required
        />
        <input
          name="quantityNeeded"
          type="number"
          min="1"
          value={form.quantityNeeded}
          onChange={handleChange}
          placeholder="Quantity Needed"
          required
        />
        <button type="submit" disabled={loading}>
          Add Item
        </button>
      </form>
      {status && (
        <p
          className={`status-message ${status.includes("Success") ? "success" : "error"}`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default AdminRegistryManager;
