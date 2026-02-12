import React from 'react';
import logoImg from '../../assets/imgs/v199_29.png';
import dashboardIcon from '../../assets/icons/Dashboard-icon.svg';
import ticketIcon from '../../assets/icons/Tickets-icon.svg';
import historyIcon from '../../assets/icons/History-icon.svg';
import usersIcon from '../../assets/icons/Users-icon.svg';
import locationIcon from '../../assets/icons/Departures-icon.svg';
import qaIcon from '../../assets/icons/QA-icon.svg';
import arrorIcon from '../../assets/icons/Arrow-icon.svg';
import styles from './Sidebar.module.less';

const Sidebar = () => {
    const [isTicketsOpen, setIsTicketsOpen] = useState(true);
    return (
        <aside className={styles.sidebar}>

            {/* 1. Logo */}
            <div className={styles.logoArea}>
                <img src={logoImg} alt="TBOXSA" className={styles.logo} />
            </div>

            {/* 2. Menú de Navegación */}
            <nav className={styles.nav}>
                <ul className={styles.menuList}>

                    {/* ITEM: DASHBOARD */}
                    <li className={`${styles.menuItem} ${styles.active}`}> {/* Clase active manual por ahora */}
                        <img src={dashboardIcon} alt="Dashboard" className={styles.icon} />
                        <span className={styles.text}>Dashboard</span>
                    </li>

                    {/* GRUPO: TICKETS (Desplegable) */}
                    <li className={styles.menuGroup}>
                        <div
                            className={styles.menuHeader}
                            onClick={() => setIsTicketsOpen(!isTicketsOpen)}
                        >
                            <div className={styles.leftContent}>
                                <img src={ticketIcon} alt="Tickets" className={styles.icon} />
                                <span className={styles.text}>Tickets</span>
                            </div>
                            {/* Flecha indicadora */}
                            <img src={arrorIcon} alt="Flecha" className={styles.icon} />
                        </div>

                        {/* Submenú */}
                        {isTicketsOpen && (
                            <ul className={styles.subMenu}>
                                <li className={styles.subItem}>
                                    <span className={styles.subText}>Crear Ticket</span>
                                </li>

                                <li className={styles.subItem}>
                                    <div className={styles.spaceBetween}>
                                        <span className={styles.subText}>Asignar Tickets</span>
                                        <span className={styles.badge}>4</span>
                                    </div>
                                </li>

                                <li className={styles.subItem}>
                                    <div className={styles.spaceBetween}>
                                        <span className={styles.subText}>Tickets Activos</span>
                                        <span className={styles.badge}>12</span>
                                    </div>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* ITEM: HISTORIAL */}
                    <li className={styles.menuItem}>
                        <img src={historyIcon} alt="Historial" className={styles.icon} />
                        <span className={styles.text}>Historial</span>
                    </li>

                    {/* ITEM: USUARIOS */}
                    <li className={styles.menuItem}>
                        <img src={usersIcon} alt="Usuarios" className={styles.icon} />
                        <span className={styles.text}>Usuarios</span>
                    </li>

                    {/* ITEM: SALIDAS */}
                    <li className={styles.menuItem}>
                        <img src={locationIcon} alt="Salidas" className={styles.icon} />
                        <span className={styles.text}>Salidas</span>
                    </li>

                    {/* ITEM: Q&A */}
                    <li className={styles.menuItem}>
                        <img src={qaIcon} alt="Q&A" className={styles.icon} />
                        <span className={styles.text}>Q&A</span>
                    </li>

                </ul>
            </nav>

            {/* 3. Perfil de Usuario */}
            <div className={styles.profileSection}>
                <div className={styles.profileCard}>
                    <img
                        src="https://i.pravatar.cc/150?u=alex"
                        alt="Alex"
                        className={styles.avatar}
                    />
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>Alex</p>
                        <span className={styles.userEmail}>Alex@tboxsa.com</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;