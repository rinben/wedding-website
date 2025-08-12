import React, { useState } from 'react';

function Rsvp() {
  const [formData, setFormData] = useState({
    name: '',
    attending: '',
    plusOne: 0,
    dietaryRestrictions: '',
  });

  const [guestList, setGuestList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Reset plusOne and guestList if the user selects 'No'
    if (name === 'attending' && value === 'No') {
      setFormData((prevData) => ({
        ...prevData,
        plusOne: 0,
        dietaryRestrictions: '',
      }));
      setGuestList([]);
    }
  };

  const handlePlusOneChange = (e) => {
    const numGuests = Number(e.target.value);
    setFormData((prevData) => ({
      ...prevData,
      plusOne: numGuests,
    }));

    // Create an array of guests based on the number entered
    const newGuestList = Array.from({ length: numGuests }, (_, index) => {
      // Keep existing guest data if it exists
      return guestList[index] || { guestName: '', guestDietaryRestrictions: '' };
    });
    setGuestList(newGuestList);
  };

  const handleGuestInfoChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGuestList = [...guestList];
    updatedGuestList[index][name] = value;
    setGuestList(updatedGuestList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Main Guest Data:', formData);
    console.log('Additional Guest Data:', guestList);
    // Here is where we'll send all this data to our backend
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

        {/* Conditionally render this section if attending is 'Yes' */}
        {formData.attending === 'Yes' && (
          <>
            <div>
              <label htmlFor="plusOne">Number of Additional Guests:</label>
              <input
                type="number"
                id="plusOne"
                name="plusOne"
                value={formData.plusOne}
                onChange={handlePlusOneChange}
                min="0"
              />
            </div>

            <div>
              <label htmlFor="dietaryRestrictions">Your Dietary Restrictions or Allergies:</label>
              <textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Conditionally render guest info fields */}
            {guestList.length > 0 && (
              <div>
                <h3>Additional Guests Information</h3>
                {guestList.map((guest, index) => (
                  <div key={index}>
                    <h4>Guest #{index + 1}</h4>
                    <label htmlFor={`guestName-${index}`}>Full Name:</label>
                    <input
                      type="text"
                      id={`guestName-${index}`}
                      name="guestName"
                      value={guest.guestName}
                      onChange={(e) => handleGuestInfoChange(index, e)}
                      required
                    />
                    <label htmlFor={`guestDietaryRestrictions-${index}`}>Dietary Restrictions:</label>
                    <textarea
                      id={`guestDietaryRestrictions-${index}`}
                      name="guestDietaryRestrictions"
                      value={guest.guestDietaryRestrictions}
                      onChange={(e) => handleGuestInfoChange(index, e)}
                    ></textarea>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <button type="submit">Submit RSVP</button>
      </form>
    </div>
  );
}

export default Rsvp;
