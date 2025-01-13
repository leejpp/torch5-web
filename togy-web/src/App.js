import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// 사용자 페이지 import
import Home from './pages/user/Home';
import Notice from './pages/user/Notice';
import Prayer from './pages/user/PrayerRequests';
import Voices from './pages/user/Voices';
import Calendar from './pages/user/Calendar';

// 관리자 페이지 import
import AdminDashboard from './pages/admin/Dashboard';
import AdminNotice from './pages/admin/Notice';
import AdminPrayer from './pages/admin/Prayer';
import AdminVoices from './pages/admin/Voices';
import AdminCalendar from './pages/admin/Calendar';
import AdminMembers from './pages/admin/Members';

// 관리자 인증 컴포넌트 import
import AdminAuth from './components/admin/AdminAuth';

function App() {
  return (
    <Router>
      <Routes>
        {/* 사용자 페이지 라우트 */}
        <Route path="/" element={<Home />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/voices" element={<Voices />} />
        <Route path="/calendar" element={<Calendar />} />

        {/* 관리자 페이지 라우트 */}
        <Route 
          path="/admin" 
          element={<AdminAuth><AdminDashboard /></AdminAuth>} 
        />
        <Route 
          path="/admin/notice" 
          element={<AdminAuth><AdminNotice /></AdminAuth>} 
        />
        <Route 
          path="/admin/prayer" 
          element={<AdminAuth><AdminPrayer /></AdminAuth>} 
        />
        <Route 
          path="/admin/voices" 
          element={<AdminAuth><AdminVoices /></AdminAuth>} 
        />
        <Route 
          path="/admin/calendar" 
          element={<AdminAuth><AdminCalendar /></AdminAuth>} 
        />
        <Route 
          path="/admin/members" 
          element={<AdminAuth><AdminMembers /></AdminAuth>} 
        />
      </Routes>
    </Router>
  );
}

export default App;