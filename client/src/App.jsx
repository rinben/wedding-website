import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import About from "./components/About";
import Timeline from "./components/Timeline";
import Rsvp from "./components/Rsvp";
import Travel from "./components/Travel";
import Photos from "./components/Photos";
import Registry from "./components/Registry";
import AdminDashboard from "./components/AdminDashboard";
import LoginPage from "./components/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./HomePage.css"; // Import the new CSS file

function App() {
  return (
    <AuthProvider>
      <NavBar />
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
              </section>
              <section className="content-section">
                <About />
                <Timeline />
              </section>
            </>
          }
        />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/registry" element={<Registry />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
