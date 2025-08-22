import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import About from "./components/About";
import Timeline from "./components/Timeline";
import Rsvp from "./components/Rsvp";
import Travel from "./components/Travel";
import CanadaTravel from "./components/CanadaTravel";
import BuffaloTravel from "./components/BuffaloTravel";
import Photos from "./components/Photos";
import Registry from "./components/Registry";
import AdminDashboard from "./components/AdminDashboard";
import LoginPage from "./components/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./HomePage.css";
import "./components/NavBar.css";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#about-us") {
      const aboutSection = document.getElementById("about-us");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById("about-us");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AuthProvider>
      <NavBar />
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <section
                className="hero-section"
                style={{ backgroundImage: "url(/benandsara_frontpage.jpg)" }}
              >
                <h1 className="hero-title">Ben & Sara's Wedding!</h1>
                <a onClick={handleScrollToAbout} className="scroll-down-arrow">
                  &#x25BC;
                </a>
              </section>
              <section className="content-section">
                <About />
                <Timeline />
              </section>
            </>
          }
        />
        <Route
          path="/rsvp"
          element={
            <div className="other-pages-container">
              <Rsvp />
            </div>
          }
        />
        <Route
          path="/travel"
          element={
            <div className="other-pages-container">
              <Travel />
            </div>
          }
        />
        <Route
          path="/travel/canada"
          element={
            <div className="other-pages-container">
              <CanadaTravel />
            </div>
          }
        />
        <Route
          path="/travel/buffalo"
          element={
            <div className="other-pages-container">
              <BuffaloTravel />
            </div>
          }
        />
        <Route
          path="/registry"
          element={
            <div className="other-pages-container">
              <Registry />
            </div>
          }
        />
        <Route
          path="/photos"
          element={
            <div className="other-pages-container">
              <Photos />
            </div>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <div className="other-pages-container">
                <AdminDashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <div className="other-pages-container">
              <LoginPage />
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
