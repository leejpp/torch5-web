import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// Layouts (항상 필요하므로 직접 import)
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import TalantLayout from './layouts/TalantLayout';

// Lazy Loading으로 페이지들 최적화
const Home = React.lazy(() => import('./pages/user/Home'));
const Notice = React.lazy(() => import('./pages/user/Notice'));
const PrayerRequests = React.lazy(() => import('./pages/user/PrayerRequests'));
const Voices = React.lazy(() => import('./pages/user/Voices'));
const Calendar = React.lazy(() => import('./pages/user/Calendar'));

// Admin Pages
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
    font-family: ${theme.typography.fontFamily};
    line-height: 1.5;
    color: ${theme.colors.neutral[1]};
    background-color: ${theme.colors.background};
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
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="notice" element={<Notice />} />
            <Route path="prayer" element={<PrayerRequests />} />
            <Route path="voices" element={<Voices />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="prayer" element={<PrayerAdmin />} />
            <Route path="voices" element={<VoicesAdmin />} />
            <Route path="calendar" element={<CalendarAdmin />} />
            <Route path="yearlythemes" element={<YearlyThemes />} />
            <Route path="cells" element={<CellReorganization />} />
          </Route>

          {/* Talant Routes */}
          <Route path="/talant" element={<TalantLayout />}>
            <Route index element={<TalantDashboard />} />
            <Route path="input" element={<TalantInput />} />
            <Route path="history" element={<TalantHistory />} />
            <Route path="board" element={<TalantBoard />} />
            <Route path="rank" element={<TalantRank />} />
            <Route path="students" element={<TalantStudents />} />
          </Route>
        </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;