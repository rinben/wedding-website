// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    if (token) {
      fetchGuests();
    }
  }, [token]);

  const fetchGuests = async () => {
    try {
      const response = await fetch("https://api.ben-and-sara.com/api/guests", {
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
    } finally {
      setLoading(false);
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
      const response = await fetch("https://api.ben-and-sara.com/api/guests", {
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
      const response = await fetch(
        `https://api.ben-and-sara.com/api/guests/${guestId}`,
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
      const response = await fetch(
        "https://api.ben-and-sara.com/api/guests/mass-delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedGuests }),
        },
      );

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
      const response = await fetch(
        "https://api.ben-and-sara.com/api/export-guests",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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
          await fetch("https://api.ben-and-sara.com/api/party/update-id", {
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
        `https://api.ben-and-sara.com/api/guests/${editingGuest.id}`,
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

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>

      <div className="admin-actions">
        <button onClick={handleExport}>Export Guest List</button>
        {selectedGuests.length > 0 && (
          <button onClick={handleMassDelete}>
            Delete Selected ({selectedGuests.length})
          </button>
        )}
        <button onClick={fetchGuests}>Refresh</button>
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
              {sortKey === "party_id" && (sortDirection === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("attending")}>
              Attending{" "}
              {sortKey === "attending" && (sortDirection === "asc" ? "▲" : "▼")}
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
                <button onClick={() => handleDelete(guest.id)}>Delete</button>
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
    </div>
  );
}

export default AdminDashboard;
