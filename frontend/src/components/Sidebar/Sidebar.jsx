import React from 'react';
import {
    FaThLarge,
    FaTicketAlt,
    FaHistory,
    FaUsers,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { IoIosHelpCircleOutline } from "react-icons/io";
import logoImg from '../../assets/tboxsa.png';
import styles from './Sidebar.module.less';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>

            <div className={styles.logoArea}>
                <img src={logoImg} alt="TBOXSA Logo" className={styles.logo} />
            </div>

            <nav className={styles.nav}>
                <ul className={styles.menuList}>

                    <li className={`${styles.menuItem} ${styles.active}`}>
                        <FaThLarge className={styles.icon} />
                        <span>Dashboard</span>
                    </li>

                    <li className={styles.menuItem}>
                        <FaTicketAlt className={styles.icon} />
                        <span>Tickets</span>
                    </li>

                    <li className={styles.menuItem}>
                        <FaHistory className={styles.icon} />
                        <span>Historial</span>
                    </li>

                    <li className={styles.menuItem}>
                        <FaUsers className={styles.icon} />
                        <span>Usuarios</span>
                    </li>

                    <li className={styles.menuItem}>
                        <FaMapMarkerAlt className={styles.icon} />
                        <span>Salidas</span>
                    </li>
                    <li className={styles.menuItem}>
                        <IoIosHelpCircleOutline className={styles.icon} />
                        <span>Q&A</span>
                    </li>
                </ul>
            </nav>

            <div className={styles.profileSection}>
                <img
                    src="https://i.pravatar.cc/150?img=11"
                    alt="User Profile"
                    className={styles.avatar}
                />
                <div className={styles.userInfo}>
                    <p className={styles.userName}>Usuario</p>
                    <span className={styles.userEmail}>Usuario@tboxsa.com</span>
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;