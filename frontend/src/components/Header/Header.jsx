import React from 'react';
import { FaFire } from "react-icons/fa";
import search from '../../assets/icons/Lens-icon.svg';
import logOut from '../../assets/icons/Log-out-icon.svg';
import styles from './Header.module.less';

const Header = ({ toggleSidebar }) => {
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
          <input
            type="text"
            placeholder="Search task"
            className={styles.searchInput}
          />
          <div className={styles.shortcutBadge}>⌘F</div>
        </div>
      </div>

      <div className={styles.rightSection}>

        <div className={styles.streakContainer}>
          <FaFire className={styles.fireIcon} />
          <span className={styles.streakNumber}>0</span>
        </div>

        <div className={styles.logoutContainer}>
          <img src={logOut} alt="Logout" className={styles.logoutIcon} />
          <span className={styles.logoutText}>Cerrar Sesión</span>
        </div>

      </div>
    </header>
  );
};

export default Header;