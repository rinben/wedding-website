// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import AdminRegistryManager from "./AdminRegistryManager"; // New import
import "./AdminDashboard.css";

function AdminDashboard() {
  const [guests, setGuests] = useState([]);
  const [registryItems, setRegistryItems] = useState([]); // New state for registry items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("guests"); // New state for view control

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    party_id: "",
    attending: false,
    dietary_restrictions: "",
  });
  const [editingGuest, setEditingGuest] = useState(null);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDirection, setSortDirection] = useState("asc");

  const { user } = useAuth();
  const token = localStorage.getItem("access_token");
  const [originalPartyId, setOriginalPartyId] = useState(null);

  const fetchGuests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGuests(data);
    } catch (error) {
      setError(error);
    }
  };

  const fetchRegistryItems = async () => {
    try {
      // Public endpoint, no auth required for GET
      const response = await fetch(`${API_BASE_URL}/api/registry`);
      if (!response.ok) {
        throw new Error(`Registry HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRegistryItems(data);
    } catch (error) {
      setError(error);
    }
  };

  // Combined data fetching
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    await fetchGuests();
    await fetchRegistryItems();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // New function to handle deletion of a registry item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this registry item?"))
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registry/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the registry list after deletion
      await fetchRegistryItems();
    } catch (error) {
      console.error(`Failed to delete item:`, error);
      setError(error);
    }
  };

  // Function to mark an item as fulfilled (admin side)
  const handleUpdateItemStatus = async (itemId, status) => {
    if (
      !window.confirm(
        `Are you sure you want to change this item status to '${status}'?`,
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registry/${itemId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchRegistryItems(); // Only refresh the registry list
    } catch (error) {
      console.error(`Failed to update item status:`, error);
      setError(error);
    }
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setForm({
        first_name: "",
        last_name: "",
        party_id: "",
        attending: false,
        dietary_restrictions: "",
      });
      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error("Failed to add guest:", error);
      setError(error);
    }
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/guests/${guestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete guest:", error);
      setError(error);
    }
  };

  const handleMassDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedGuests.length} guests?`,
      )
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/guests/mass-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedGuests }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSelectedGuests([]);
      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete guests:", error);
      setError(error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/export-guests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "guest_list.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to export guest list:", error);
      setError(error);
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setOriginalPartyId(guest.party_id);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingGuest((prevGuest) => ({
      ...prevGuest,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSave = async () => {
    try {
      // Check if party ID has changed
      if (editingGuest.party_id !== originalPartyId) {
        const shouldUpdateParty = window.confirm(
          `The party ID for this guest has changed. Would you like to update all guests in the original party (ID: ${originalPartyId}) to the new party ID (${editingGuest.party_id})?`,
        );

        if (shouldUpdateParty) {
          await fetch(`${API_BASE_URL}/api/party/update-id`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              old_party_id: originalPartyId,
              new_party_id: editingGuest.party_id,
            }),
          });
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/guests/${editingGuest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingGuest),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEditingGuest(null);
      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error("Failed to save guest changes:", error);
      setError(error);
    }
  };

  const handleEditCancel = () => {
    setEditingGuest(null);
  };

  const handleCheckboxChange = (guestId) => {
    setSelectedGuests((prevSelected) => {
      if (prevSelected.includes(guestId)) {
        return prevSelected.filter((id) => id !== guestId);
      } else {
        return [...prevSelected, guestId];
      }
    });
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/import-guests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Guest list imported successfully!");
      e.target.value = null; // Clear the input
      fetchGuests(); // Refresh the list
    } catch (error) {
      console.error("Failed to import guest list:", error);
      setError(error);
    }
  };

  const sortedGuests = [...guests].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;

    if (sortKey !== "first_name") {
      const aParty = a.party_id;
      const bParty = b.party_id;
      if (aParty < bParty) return -1;
      if (aParty > bParty) return 1;
    }

    return 0;
  });

  if (!token) return <div>Please log in to view this page.</div>;
  if (loading) return <div>Loading guests...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // --- RENDERING LOGIC ---
  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>

      {/* View Selector Buttons */}
      <div className="admin-view-selector">
        <button
          onClick={() => setCurrentView("guests")}
          className={currentView === "guests" ? "active" : ""}
        >
          Guest Management
        </button>
        <button
          onClick={() => setCurrentView("registry")}
          className={currentView === "registry" ? "active" : ""}
        >
          Registry Management
        </button>
        <button onClick={fetchData}>Refresh All Data</button>
      </div>

      {currentView === "guests" && (
        <>
          <div className="admin-actions">
            <button onClick={handleExport}>Export Guest List</button>
            {selectedGuests.length > 0 && (
              <button onClick={handleMassDelete}>
                Delete Selected ({selectedGuests.length})
              </button>
            )}
            <button onClick={fetchGuests}>Refresh</button>
          </div>

          <div className="import-guests">
            <h3>Import Guest List (CSV)</h3>
            <label htmlFor="csv-upload" className="import-button">
              Upload CSV
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </div>

          <h3>Add New Guest</h3>
          <form onSubmit={handleAddSubmit} className="add-guest-form">
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleAddChange}
              placeholder="First Name"
              required
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleAddChange}
              placeholder="Last Name"
              required
            />
            <input
              name="party_id"
              value={form.party_id}
              onChange={handleAddChange}
              placeholder="Party ID"
              required
            />
            <label>
              <input
                type="checkbox"
                name="attending"
                checked={form.attending}
                onChange={handleAddChange}
              />{" "}
              Attending
            </label>
            <input
              name="dietary_restrictions"
              value={form.dietary_restrictions}
              onChange={handleAddChange}
              placeholder="Dietary Restrictions"
            />
            <button type="submit">Add Guest</button>
          </form>

          <h3>Current Guest List ({guests.length})</h3>
          <table className="guest-list-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedGuests.length === guests.length}
                    onChange={() =>
                      setSelectedGuests(
                        selectedGuests.length === guests.length
                          ? []
                          : sortedGuests.map((g) => g.id),
                      )
                    }
                  />
                </th>
                <th onClick={() => handleSort("first_name")}>
                  Name{" "}
                  {sortKey === "first_name" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("party_id")}>
                  Party ID{" "}
                  {sortKey === "party_id" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("attending")}>
                  Attending{" "}
                  {sortKey === "attending" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th>Dietary Restrictions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGuests.map((guest) => (
                <tr key={guest.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedGuests.includes(guest.id)}
                      onChange={() => handleCheckboxChange(guest.id)}
                    />
                  </td>
                  <td>
                    {guest.first_name} {guest.last_name}
                  </td>
                  <td>{guest.party_id}</td>
                  <td>{guest.attending ? "Yes" : "No"}</td>
                  <td>{guest.dietary_restrictions || "None"}</td>
                  <td>
                    <button onClick={() => handleEdit(guest)}>Edit</button>
                    <button onClick={() => handleDelete(guest.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editingGuest && (
            <div className="edit-guest-form-container">
              <h3>
                Edit Guest: {editingGuest.first_name} {editingGuest.last_name}
              </h3>
              <form className="edit-guest-form">
                <input
                  name="first_name"
                  value={editingGuest.first_name}
                  onChange={handleEditChange}
                  placeholder="First Name"
                />
                <input
                  name="last_name"
                  value={editingGuest.last_name}
                  onChange={handleEditChange}
                  placeholder="Last Name"
                />
                <input
                  name="party_id"
                  value={editingGuest.party_id}
                  onChange={handleEditChange}
                  placeholder="Party ID"
                />
                <label>
                  <input
                    type="checkbox"
                    name="attending"
                    checked={editingGuest.attending}
                    onChange={handleEditChange}
                  />{" "}
                  Attending
                </label>
                <input
                  name="dietary_restrictions"
                  value={editingGuest.dietary_restrictions}
                  onChange={handleEditChange}
                  placeholder="Dietary Restrictions"
                />
                <div className="edit-form-buttons">
                  <button type="button" onClick={handleEditSave}>
                    Save
                  </button>
                  <button type="button" onClick={handleEditCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
      {currentView === "registry" && (
        <div className="registry-admin-section">
          <AdminRegistryManager onRegistryUpdate={fetchRegistryItems} />

          <h3>Current Registry Items ({registryItems.length})</h3>
          <table className="guest-list-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Needed</th>
                <th>Claimed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registryItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.quantityNeeded}</td>
                  <td>{item.quantityClaimed}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleUpdateItemStatus(item.id, "FULFILLED")
                      }
                      disabled={item.status === "FULFILLED"}
                    >
                      Fulfill
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateItemStatus(item.id, "AVAILABLE")
                      }
                      disabled={item.status === "AVAILABLE"}
                    >
                      Re-list
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      style={{ backgroundColor: "red" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
