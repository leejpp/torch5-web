import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import AdminAuth from './components/admin/AdminAuth';

// Layouts (항상 필요하므로 직접 import)
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import TalantLayout from './layouts/TalantLayout';
import MainAdminLayout from './layouts/MainAdminLayout';
import SimpleLayout from './layouts/SimpleLayout'; // [NEW] Simple Layout

// Lazy Loading으로 페이지들 최적화
const MainLanding = React.lazy(() => import('./pages/MainLanding'));
const ScriptureMemory = React.lazy(() => import('./pages/user/ScriptureMemory')); // [NEW] Scripture Memory Page
const AllBirthdays = React.lazy(() => import('./pages/user/AllBirthdays')); // Root Level
const Home = React.lazy(() => import('./pages/user/Home'));
const Notice = React.lazy(() => import('./pages/user/Notice'));
// AllBirthdays moved up
const PrayerRequests = React.lazy(() => import('./pages/user/PrayerRequests'));

const Feedback = React.lazy(() => import('./pages/user/Feedback'));
const Sermons = React.lazy(() => import('./pages/user/Sermons')); // [NEW] User Sermons

const Calendar = React.lazy(() => import('./pages/user/Calendar'));
const ChurchSchedule = React.lazy(() => import('./pages/user/ChurchSchedule')); // [NEW] Global Schedule

// Admin Pages
const AdminPortal = React.lazy(() => import('./pages/admin/AdminPortal'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const PrayerAdmin = React.lazy(() => import('./pages/admin/Prayer'));
const FeedbackAdmin = React.lazy(() => import('./pages/admin/Feedback'));
const YearlyThemes = React.lazy(() => import('./pages/admin/YearlyThemes'));
const CellReorganization = React.lazy(() => import('./pages/admin/CellReorganization'));

// Talant Pages (Lazy Loading 최적화)
const TalantDashboard = React.lazy(() => import('./pages/talant/Dashboard'));
const TalantInput = React.lazy(() => import('./pages/talant/Input'));
const TalantHistory = React.lazy(() => import('./pages/talant/History'));
const TalantBoard = React.lazy(() => import('./pages/talant/Board'));
const TalantRank = React.lazy(() => import('./pages/talant/Rank'));
const TalantStudents = React.lazy(() => import('./pages/talant/Students'));

// Main Admin Pages
const MainMembers = React.lazy(() => import('./pages/admin/main/Members'));
const MainSchedule = React.lazy(() => import('./pages/admin/main/Schedule')); // [NEW] Admin Schedule
const MainDashboard = React.lazy(() => import('./pages/admin/main/Dashboard')); // [NEW] Admin Dashboard

const NoticeAdmin = React.lazy(() => import('./pages/admin/Notice')); // [NEW] Notice Admin
const SermonsAdmin = React.lazy(() => import('./pages/admin/Sermons')); // [NEW] Sermons Admin
const ScriptureAdmin = React.lazy(() => import('./pages/admin/main/ScriptureAdmin')); // [NEW] Scripture Admin

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${theme.typography.fontFamily.body};
    line-height: 1.5;
    color: ${theme.colors.neutral[1]};
    background-color: ${theme.colors.background};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.typography.fontFamily.heading};
    font-weight: 700;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

// Loading 컴포넌트
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    <div>⏳ 페이지를 불러오는 중...</div>
  </div>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router
        basename=""
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* 1. Global Landing Page (Standalone) */}
            <Route path="/" element={<MainLanding />} />

            {/* 2. Global Public Pages (Simple Layout - Clean Header) */}
            <Route element={<SimpleLayout />}>
              <Route path="/scripture" element={<ScriptureMemory />} />
              <Route path="/sermons" element={<Sermons />} />
              <Route path="/notice" element={<Notice />} />
              <Route path="/schedule" element={<ChurchSchedule />} />
              <Route path="/birthdays" element={<AllBirthdays />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/prayer" element={<PrayerRequests />} /> {/* Global Prayer Request? Check if this should be Togy specific */}
            </Route>

            {/* 3. Youth (TOGY) Pages (User Layout - Youth Header) */}
            <Route path="/togy" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="prayer" element={<PrayerRequests />} /> {/* Togy Prayer */}
            </Route>

            {/* Admin Routes - Protected by AdminAuth */}
            <Route element={<AdminAuth />}>
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/admin/feedback" element={<FeedbackAdmin />} /> {/* [NEW] Global Feedback Admin */}

              {/* TOGY Admin Routes (Nested under /admin/togy) */}
              <Route path="/admin/togy" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="prayer" element={<PrayerAdmin />} />

                <Route path="yearlythemes" element={<YearlyThemes />} />
                <Route path="cells" element={<CellReorganization />} />
              </Route>

              {/* Main Admin Routes (Nested under /admin/main) */}
              <Route path="/admin/main" element={<MainAdminLayout />}>
                <Route index element={<MainDashboard />} /> {/* Dashboard as index */}
                <Route path="members" element={<MainMembers />} />
                <Route path="schedule" element={<MainSchedule />} /> {/* New Schedule Route */}
                <Route path="notice" element={<NoticeAdmin />} /> {/* New Notice Admin Route */}
                <Route path="sermons" element={<SermonsAdmin />} /> {/* New Sermons Admin Route */}
                <Route path="scripture" element={<ScriptureAdmin />} /> {/* New Scripture Admin Route */}
              </Route>

              {/* Talant Routes (Nested under /admin/talant) */}
              <Route path="/admin/talant" element={<TalantLayout />}>
                <Route index element={<TalantDashboard />} />
                <Route path="input" element={<TalantInput />} />
                <Route path="history" element={<TalantHistory />} />
                <Route path="board" element={<TalantBoard />} />
                <Route path="students" element={<TalantStudents />} />
              </Route>
            </Route>

            {/* Public Talant Routes */}
            <Route path="/talant-rank" element={<TalantRank />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider >
  );
};

export default App;