// src/components/Rsvp.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Rsvp.css";

function Rsvp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [partyGuests, setPartyGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This effect fetches search results as the user types
  useEffect(() => {
    const fetchGuests = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/search-guest?name=${searchQuery}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch guest list.");
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const debounceTimeout = setTimeout(fetchGuests, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // This function is called when a user selects a guest
  const handleGuestSelect = async (guest) => {
    setSelectedGuest(guest);
    // Fetch all guests in the same party
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/party-members?party_id=${guest.party_id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch party members.");
      }
      const data = await response.json();
      setPartyGuests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpChange = (guestId, field, value) => {
    setPartyGuests((prevGuests) =>
      prevGuests.map((guest) => {
        let finalValue = value;

        // Convert string "true"/"false" from radio buttons to actual booleans
        if (field === "attending" || field === "welcome_party") {
          finalValue = value === "true";
        }

        return guest.id === guestId ? { ...guest, [field]: finalValue } : guest;
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatePromises = partyGuests.map((guest) =>
        fetch(`${API_BASE_URL}/api/public-rsvp/${guest.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attending: guest.attending,
            welcome_party: guest.welcome_party, // Includes the new field
            dietary_restrictions: guest.dietary_restrictions,
          }),
        }),
      );

      // Wait for all promises to resolve
      const responses = await Promise.all(updatePromises);
      for (const response of responses) {
        if (!response.ok) {
          throw new Error("One or more RSVP updates failed.");
        }
      }

      alert("Thank you for your RSVP!");
      setSelectedGuest(null);
      setPartyGuests([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      alert("An error occurred while submitting your RSVP. Please try again.");
    }
  };

  // Render the search bar and results
  if (!selectedGuest) {
    return (
      <div className="rsvp-container">
        <h2>Find Your RSVP</h2>
        <p>Please enter your first and last name to find your invitation.</p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="First and last name"
        />
        {loading && <p>Searching...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((guest) => (
              <li key={guest.id} onClick={() => handleGuestSelect(guest)}>
                {guest.first_name} {guest.last_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Render the RSVP form for the selected party
  return (
    <div className="rsvp-container">
      <h2>Hello, {selectedGuest.first_name}!</h2>
      <p>Please confirm your attendance for each member of your party.</p>
      <form onSubmit={handleSubmit}>
        {partyGuests.map((guest) => (
          <div key={guest.id} className="guest-rsvp-section">
            <h4
              style={{ borderBottom: "1px solid #ccc", paddingBottom: "5px" }}
            >
              {guest.first_name} {guest.last_name}
            </h4>

            {/* Wedding Ceremony Question */}
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                Attending the Wedding Ceremony & Reception?
              </p>
              <label>
                <input
                  type="radio"
                  name={`attending-${guest.id}`}
                  value="true"
                  checked={guest.attending === true}
                  onChange={() =>
                    handleRsvpChange(guest.id, "attending", "true")
                  }
                />
                Yes, with pleasure!
              </label>
              <label>
                <input
                  type="radio"
                  name={`attending-${guest.id}`}
                  value="false"
                  checked={guest.attending === false}
                  onChange={() =>
                    handleRsvpChange(guest.id, "attending", "false")
                  }
                />
                No, with regret.
              </label>
            </div>

            {/* Friday Welcome Party Question */}
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                Attending the Friday Welcome Party?
              </p>
              <label>
                <input
                  type="radio"
                  name={`welcome-${guest.id}`}
                  value="true"
                  checked={guest.welcome_party === true}
                  onChange={() =>
                    handleRsvpChange(guest.id, "welcome_party", "true")
                  }
                />
                Yes!
              </label>
              <label>
                <input
                  type="radio"
                  name={`welcome-${guest.id}`}
                  value="false"
                  checked={guest.welcome_party === false}
                  onChange={() =>
                    handleRsvpChange(guest.id, "welcome_party", "false")
                  }
                />
                No.
              </label>
            </div>

            {/* Dietary Restrictions (Only shows if attending the wedding) */}
            {guest.attending && (
              <div style={{ marginBottom: "15px" }}>
                <label
                  htmlFor={`dietary-${guest.id}`}
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Dietary Restrictions:
                </label>
                <textarea
                  id={`dietary-${guest.id}`}
                  value={guest.dietary_restrictions}
                  onChange={(e) =>
                    handleRsvpChange(
                      guest.id,
                      "dietary_restrictions",
                      e.target.value,
                    )
                  }
                  style={{ width: "100%", minHeight: "60px" }}
                />
              </div>
            )}
          </div>
        ))}
        <button type="submit" style={{ marginTop: "20px" }}>
          Submit RSVP
        </button>
      </form>
    </div>
  );
}

export default Rsvp;
