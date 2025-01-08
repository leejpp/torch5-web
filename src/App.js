import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrayerRequests from './pages/PrayerRequests';
import Voices from './pages/Voices';
import VoicesAdmin from './pages/VoicesAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prayers" element={<PrayerRequests />} />
        <Route path="/voices" element={<Voices />} />
        <Route path="/voices/admin" element={<VoicesAdmin />} />
      </Routes>
    </Router>
  );
}

export default App; 