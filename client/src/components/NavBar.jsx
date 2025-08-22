// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Countdown from "./Countdown";
import "./NavBar.css";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
        <div className="navbar-title desktop-title">
          <Link to="/" onClick={handleScrollToTop}>
            Ben & Sara's Wedding
          </Link>
        </div>
        <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
          <li className="mobile-title-item">
            <div className="navbar-title">
              <Link to="/" onClick={handleScrollToTop}>
                Ben & Sara's Wedding
              </Link>
            </div>
          </li>
          <li>
            <Link to="/#about-us" onClick={() => setIsOpen(false)}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="/rsvp" onClick={() => setIsOpen(false)}>
              RSVP
            </Link>
          </li>
          <li>
            <Link to="/travel" onClick={() => setIsOpen(false)}>
              Travel
            </Link>
          </li>
          <li>
            <Link to="/registry" onClick={() => setIsOpen(false)}>
              Registry
            </Link>
          </li>
          {user && user.isLoggedIn && (
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          )}
          <li className="countdown-mobile">
            <Countdown />
          </li>
        </ul>
      </div>
      <div className="navbar-right desktop-countdown">
        <Countdown />
      </div>
    </nav>
  );
}
export default NavBar;
