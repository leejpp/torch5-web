import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './UserLayout.module.css'; // Import CSS module

function UserLayout() {
  // Remove inline styles
  // const navStyle = { ... };
  // const linkStyle = { ... };
  // const activeLinkStyle = { ... };

  return (
    // Apply class for content padding
    <div className={styles.contentArea}>
      <main>
        <Outlet />
      </main>
      {/* Apply class for the nav container */}
      <nav className={styles.bottomNav}>
        <NavLink 
          to="/" 
          // Use className to apply styles, check for active state
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          end
        >
          홈
        </NavLink>
        <NavLink 
          to="/prayers" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          중보기도
        </NavLink>
        <NavLink 
          to="/cheering" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          응원메시지
        </NavLink>
      </nav>
    </div>
  );
}

export default UserLayout; 