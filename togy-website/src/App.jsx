import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import HomePage from './pages/HomePage'; // Assuming HomePage is now in its own file
import PrayersPage from './pages/PrayersPage';
import CheeringPage from './pages/CheeringPage'; // Import the new page
// import PhotosPage from './pages/PhotosPage'; // REMOVED

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPrayersPage from './pages/AdminPrayersPage';
// import AdminBoardPage from './pages/AdminBoardPage'; // REMOVED
import AdminMembersPage from './pages/AdminMembersPage';
// import PostFormPage from './pages/PostFormPage'; // REMOVED
// import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCheeringPage from './pages/AdminCheeringPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Facing Routes with UserLayout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/prayers" element={<PrayersPage />} />
          <Route path="/cheering" element={<CheeringPage />} /> {/* Add route for CheeringPage */}
          {/* <Route path="/photos" element={<PhotosPage />} /> */}{/* REMOVED */}
        </Route>

        {/* Admin Login Route (no layout) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes with AdminLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Redirect /admin to /admin/prayers by default */}
            <Route index element={<Navigate to="/admin/prayers" replace />} />
            <Route path="prayers" element={<AdminPrayersPage />} />
            <Route path="cheering" element={<AdminCheeringPage />} />
            {/* <Route path="board" element={<AdminBoardPage />} /> */}{/* REMOVED */}
            {/* <Route path="board/new" element={<PostFormPage />} /> */}{/* REMOVED */}
            {/* <Route path="board/edit/:postId" element={<PostFormPage />} /> */}{/* REMOVED */}
            <Route path="members" element={<AdminMembersPage />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
