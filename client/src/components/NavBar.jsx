import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><a href="#about-us">About Us</a></li>
        <li><Link to="/rsvp">RSVP</Link></li>
        <li><Link to="/travel">Travel</Link></li>
        <li><Link to="/registry">Registry</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;
