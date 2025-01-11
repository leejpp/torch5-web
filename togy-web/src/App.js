import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrayerRequests from './pages/PrayerRequests';
import Voices from './pages/Voices';
import VoicesAdmin from './pages/VoicesAdmin';
import Contacts from './pages/Contacts';  // 추가

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prayer" element={<PrayerRequests />} />
        <Route path="/voices" element={<Voices />} />
        <Route path="/admin" element={<VoicesAdmin />} />
        <Route path="/contacts" element={<Contacts />} />  {/* 추가 */}
      </Routes>
    </Router>
  );
}

export default App;