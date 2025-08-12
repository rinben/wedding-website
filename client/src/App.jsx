// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import About from './components/About';
import Timeline from './components/Timeline';
import Rsvp from './components/Rsvp';
import Photos from './components/Photos';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={
          <>
            <h1>Welcome to Our Wedding!</h1>
            <About />
            <Timeline />
          </>
        } />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/photos" element={<Photos />} />
      </Routes>
    </>
  );
}

export default App;
