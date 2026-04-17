import React from 'react';
import { FaFire } from "react-icons/fa";
import search from '../../assets/icons/Lens-icon.svg';
import logOut from '../../assets/icons/Log-out-icon.svg';
import styles from './Header.module.less';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      localStorage.removeItem('user');
      window.location.href = "http://localhost/PortalAplicativos/public/inicio";
    }
  };

  const streakCount = user?.racha_actual || 0;
  const lostStreak = user?.racha_perdida || 0;

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </button>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <img src={search} alt="Buscar" className={styles.searchIcon} />
          <input type="text" placeholder="Search task" className={styles.searchInput} />
          <div className={styles.shortcutBadge}>⌘F</div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={`${styles.streakContainer} ${streakCount > 0 ? styles.activeStreak : ''}`}>
          <FaFire className={styles.fireIcon} />
          <span className={styles.streakNumber}>{streakCount}</span>

          {streakCount === 0 && lostStreak > 0 && (
            <span className={styles.lostStreakMessage}>
              <span className={styles.hideOnMobile}>RACHA PERDIDA: </span>
              {lostStreak} DÍAS
            </span>
          )}
        </div>

        <div className={styles.logoutContainer} onClick={handleLogout}>
          <img src={logOut} alt="Logout" className={styles.logoutIcon} />
          <span className={styles.logoutText}>Cerrar Sesión</span>
        </div>
      </div>
    </header>
  );
};

export default Header;