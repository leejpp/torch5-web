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

// Lazy Loading으로 페이지들 최적화
const MainLanding = React.lazy(() => import('./pages/MainLanding'));
const AllBirthdays = React.lazy(() => import('./pages/user/AllBirthdays')); // Root Level
const Home = React.lazy(() => import('./pages/user/Home'));
const Notice = React.lazy(() => import('./pages/user/Notice'));
// AllBirthdays moved up
const PrayerRequests = React.lazy(() => import('./pages/user/PrayerRequests'));
const Voices = React.lazy(() => import('./pages/user/Voices'));
const Calendar = React.lazy(() => import('./pages/user/Calendar'));

// Admin Pages
const AdminPortal = React.lazy(() => import('./pages/admin/AdminPortal'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const PrayerAdmin = React.lazy(() => import('./pages/admin/Prayer'));
const VoicesAdmin = React.lazy(() => import('./pages/admin/Voices'));
const CalendarAdmin = React.lazy(() => import('./pages/admin/Calendar'));
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
            {/* Main Landing Route */}
            <Route path="/" element={<MainLanding />} />

            {/* User Routes (Moved to /togy) */}
            <Route path="/birthdays" element={<AllBirthdays />} />
            <Route path="/togy" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="notice" element={<Notice />} />
              <Route path="prayer" element={<PrayerRequests />} />
              <Route path="voices" element={<Voices />} />
              <Route path="calendar" element={<Calendar />} />
            </Route>

            {/* Admin Routes - Protected by AdminAuth */}
            <Route element={<AdminAuth />}>
              <Route path="/admin" element={<AdminPortal />} />

              {/* TOGY Admin Routes (Nested under /admin/togy) */}
              <Route path="/admin/togy" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="prayer" element={<PrayerAdmin />} />
                <Route path="voices" element={<VoicesAdmin />} />
                <Route path="calendar" element={<CalendarAdmin />} />
                <Route path="yearlythemes" element={<YearlyThemes />} />
                <Route path="cells" element={<CellReorganization />} />
              </Route>

              {/* Main Admin Routes (Nested under /admin/main) */}
              <Route path="/admin/main" element={<MainAdminLayout />}>
                <Route index element={<MainMembers />} /> {/* Default to Members page for now */}
                <Route path="members" element={<MainMembers />} />
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
    </ThemeProvider>
  );
};

export default App;