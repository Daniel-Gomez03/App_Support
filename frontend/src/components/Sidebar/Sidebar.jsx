import React from 'react';
import logoImg from '../../assets/imgs/v199_29.png';
import { CiUser } from "react-icons/ci";
import dashboardIcon from '../../assets/icons/Dashboard-icon.svg';
import ticketIcon from '../../assets/icons/Tickets-icon.svg';
import addTicketIcon from '../../assets/icons/Add-ticket-icon.svg';
import assignedTicketIcon from '../../assets/icons/Assigned-icon.svg';
import activeTicketIcon from '../../assets/icons/Active-ticket-icon.svg';
import historyIcon from '../../assets/icons/History-icon.svg';
import usersIcon from '../../assets/icons/Users-icon.svg';
import locationIcon from '../../assets/icons/Departures-icon.svg';
import qaIcon from '../../assets/icons/QA-icon.svg';
import arrorIcon from '../../assets/icons/Arrow-icon.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.less';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>

            <div className={styles.logoArea}>
                <img src={logoImg} alt="TBOXSA" className={styles.logo} />
            </div>

            <nav className={styles.nav}>
                <ul className={styles.menuList}>

                    <li className={`${styles.menuItem} ${styles.active}`}>
                        <img src={dashboardIcon} alt="Dashboard" className={styles.icon} />
                        <span className={styles.text}>Dashboard</span>
                    </li>

                    <li className={styles.menuGroup}>
                        <div className={styles.menuHeader}>
                            <div className={styles.leftContent}>
                                <img src={ticketIcon} alt="Tickets" className={styles.icon} />
                                <span className={styles.text}>Tickets</span>
                            </div>
                            <img src={arrorIcon} alt="Flecha" className={styles.arrowIcon} />
                        </div>

                        <ul className={styles.subMenu}>
                            <li className={styles.subItem}>
                                <div className={styles.spaceBetween}>
                                    <div className={styles.subItemContent}>
                                        <img src={addTicketIcon} alt="AddTicket" className={styles.icon} />
                                        <span className={styles.subText}>Crear Ticket</span>
                                    </div>
                                </div>
                            </li>

                            <li className={styles.subItem}>
                                <div className={styles.spaceBetween}>
                                    <div className={styles.subItemContent}>
                                        <img src={assignedTicketIcon} alt="AddTicket" className={styles.icon} />
                                        <span className={styles.subText}>Asignar Tickets</span>
                                    </div>
                                    <span className={styles.badge}>0</span>
                                </div>
                            </li>

                            <li className={styles.subItem}>
                                <div className={styles.spaceBetween}>
                                    <div className={styles.subItemContent}>
                                        <img src={activeTicketIcon} alt="AddTicket" className={styles.icon} />
                                        <span className={styles.subText}>Tickets Activos</span>
                                    </div>
                                    <span className={styles.badge}>0</span>
                                </div>
                            </li>
                        </ul>
                    </li>

                    <li className={styles.menuItem}>
                        <img src={historyIcon} alt="Historial" className={styles.icon} />
                        <span className={styles.text}>Historial</span>
                    </li>


                    <li className={styles.menuItem}>
                        <img src={usersIcon} alt="Usuarios" className={styles.icon} />
                        <span className={styles.text}>Usuarios</span>
                    </li>

                    <li className={styles.menuItem}>
                        <img src={locationIcon} alt="Salidas" className={styles.icon} />
                        <span className={styles.text}>Salidas</span>
                    </li>

                    <li className={styles.menuItem}>
                        <img src={qaIcon} alt="Q&A" className={styles.icon} />
                        <span className={styles.text}>Q&A</span>
                    </li>

                </ul>
            </nav>

            <div className={styles.profileSection}>
                <div className={styles.profileCard}>
                    <div className={styles.avatarPlaceholder}>
                        <CiUser className={styles.userIcon} />
                    </div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>Usuario</p>
                        <span className={styles.userEmail}>usuario@tboxsa.com</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;