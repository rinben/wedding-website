// src/App.jsx
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

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Welcome to Our Wedding!</h1>
              <About />
              <Timeline />
            </>
          }
        />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/photos" element={<Photos />} />\
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
