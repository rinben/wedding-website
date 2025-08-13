// src/components/NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to homepage
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <a href="#about-us">About Us</a>
        </li>
        <li>
          <Link to="/rsvp">RSVP</Link>
        </li>
        <li>
          <Link to="/travel">Travel</Link>
        </li>
        <li>
          <Link to="/registry">Registry</Link>
        </li>
        {user && user.isLoggedIn && (
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
