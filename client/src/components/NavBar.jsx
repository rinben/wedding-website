// src/components/NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Countdown from "./Countdown";
import "./NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <ul className="navbar-links">
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
            <Link to="/photos">Photos</Link>
          </li>
          <li>
            <Link to="/registry">Registry</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        <Countdown />
        {user && user.isLoggedIn && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}
export default NavBar;
