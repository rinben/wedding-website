// src/components/Rsvp.jsx
import React, { useState } from 'react';

function Rsvp() {
  // Use state to manage the form data
  const [formData, setFormData] = useState({
    name: '',
    attending: '',
    plusOne: 0,
    dietaryRestrictions: '',
  });

  // Handle changes to the form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    console.log('Form submitted:', formData);
    // This is where we will eventually send the data to our backend
  };

  return (
    <div>
      <h2>RSVP</h2>
      <p>Please let us know if you can make it and tell us about any dietary needs you may have.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <p>Will you be attending?</p>
          <label>
            <input
              type="radio"
              name="attending"
              value="Yes"
              checked={formData.attending === 'Yes'}
              onChange={handleChange}
              required
            />{' '}
            Yes, with pleasure!
          </label>
          <label>
            <input
              type="radio"
              name="attending"
              value="No"
              checked={formData.attending === 'No'}
              onChange={handleChange}
            />{' '}
            No, with regret.
          </label>
        </div>

        <div>
          <label htmlFor="plusOne">Number of Additional Guests:</label>
          <input
            type="number"
            id="plusOne"
            name="plusOne"
            value={formData.plusOne}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div>
          <label htmlFor="dietaryRestrictions">Dietary Restrictions or Allergies:</label>
          <textarea
            id="dietaryRestrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit">Submit RSVP</button>
      </form>
    </div>
  );
}

export default Rsvp;
