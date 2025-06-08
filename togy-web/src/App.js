import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// Pages
import Home from './pages/user/Home';
import Notice from './pages/user/Notice';
import PrayerRequests from './pages/user/PrayerRequests';
import Voices from './pages/user/Voices';
import Calendar from './pages/user/Calendar';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import PrayerAdmin from './pages/admin/Prayer';
import VoicesAdmin from './pages/admin/Voices';
import CalendarAdmin from './pages/admin/Calendar';
import YearlyThemes from './pages/admin/YearlyThemes';
import CellReorganization from './pages/admin/CellReorganization';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

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
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;