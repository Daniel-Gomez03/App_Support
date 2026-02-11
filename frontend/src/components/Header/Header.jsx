import React from 'react';
import { FaBars, FaSearch, FaFire, FaSignOutAlt } from 'react-icons/fa';
import styles from './Header.module.less';

const Header = () => {
  return (
    <header className={styles.header}>
      
      <div className={styles.leftSection}>
        <button className={styles.menuBtn}>
          <FaBars />
        </button>
        
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search task" 
            className={styles.searchInput} 
          />
          <span className={styles.filterIcon}>⌘F</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        
        <div className={styles.notificationItem}>
            <FaFire className={styles.fireIcon} />
            <span className={styles.badge}>3</span>
        </div>

        <div className={styles.separator}></div>

        <button className={styles.logoutBtn}>
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

export default Header;