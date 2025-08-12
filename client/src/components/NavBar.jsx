// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/rsvp">RSVP</Link>
        </li>
        <li>
          <Link to="/photos">Photos</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
