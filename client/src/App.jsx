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
            <div className="homepage-container">
              <div
                className="homepage-background"
                style={{
                  backgroundImage: "url(https://via.placeholder.com/1920x1080)",
                }}
              >
                <h1 className="homepage-title">Welcome to Our Wedding!</h1>
              </div>
              <div className="homepage-content">
                <About />
                <Timeline />
              </div>
            </div>
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
