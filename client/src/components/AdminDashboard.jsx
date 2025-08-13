// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";

function AdminDashboard() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRsvps = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rsvps");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRsvps(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRsvps();
  }, []); // The empty array ensures this effect runs only once, on component mount

  if (loading) return <div>Loading RSVPs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Submitted RSVPs ({rsvps.length})</h3>
      {rsvps.length > 0 ? (
        <ul>
          {rsvps.map((rsvp) => (
            <li key={rsvp.id}>
              <h4>
                {rsvp.name} - {rsvp.attending}
              </h4>
              <p>Guests: {rsvp.plusOne}</p>
              <p>Dietary Restrictions: {rsvp.dietaryRestrictions || "None"}</p>
              {rsvp.additionalGuests && rsvp.additionalGuests.length > 0 && (
                <div>
                  <h5>Additional Guests:</h5>
                  <ul>
                    {rsvp.additionalGuests.map((guest) => (
                      <li key={guest.id}>
                        {guest.guestName} (
                        {guest.guestDietaryRestrictions || "None"})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No RSVPs submitted yet.</p>
      )}
    </div>
  );
}

export default AdminDashboard;
