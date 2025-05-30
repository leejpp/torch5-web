import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Correct path to useAuth hook
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Key inline styles to force styling
  const sidebarStyle = {
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #dee2e6',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.03)'
  };

  const headerStyle = {
    color: '#B22222', // Jesus' blood red
    fontFamily: "'Noto Serif KR', serif",
    fontSize: '22px',
    borderBottom: '2px solid #F5F5DC' // Beige
  };

  const activeNavStyle = {
    backgroundColor: '#B22222', // Jesus' blood red
    color: 'white',
    fontWeight: '600'
  };

  const logoutButtonStyle = {
    backgroundColor: 'white',
    color: '#B22222',
    border: '1px solid #B22222',
    borderRadius: '8px',
    fontWeight: '600'
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar} style={sidebarStyle}>
        <h2 style={headerStyle}>관리자 패널</h2>
        <nav>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink
                to="dashboard"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                style={({ isActive }) => isActive ? activeNavStyle : undefined}
              >
                대시보드
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="prayers"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                style={({ isActive }) => isActive ? activeNavStyle : undefined}
              >
                중보기도 관리
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="cheering"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                style={({ isActive }) => isActive ? activeNavStyle : undefined}
              >
                응원메시지 관리
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="members"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                style={({ isActive }) => isActive ? activeNavStyle : undefined}
              >
                멤버 관리
              </NavLink>
            </li>
            {/* Add other admin links here */}
          </ul>
        </nav>
        <button 
          onClick={handleLogout} 
          className={`${styles.button} ${styles.logoutButton}`}
          style={logoutButtonStyle}
        >
          로그아웃
        </button>
      </aside>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout; 