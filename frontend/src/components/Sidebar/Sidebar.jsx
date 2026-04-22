import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/imgs/v199_29.png';
import { CiUser } from "react-icons/ci";
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.less';
import { MdClose } from "react-icons/md";
import { BsPatchCheck } from "react-icons/bs";
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
import commentsIcon from '../../assets/icons/comments-icon.svg';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { unassignedCount } = useTickets();

    const [isTicketsOpen, setIsTicketsOpen] = useState(false);
    const isActive = (path) => location.pathname === path;

    const canRead = (moduleName) => {
        if (!user || !user.Permissions) return false;

        const perm = user.Permissions.find(p =>
            p.Seccion?.module_name === moduleName
        );

        return perm && perm.permissions_read === 1;
    };

    useEffect(() => {
        if (location.pathname.includes('/tickets/')) {
            setIsTicketsOpen(true);
        }
    }, [location.pathname]);


    return (
        <>
            <div className={`${styles.sidebarOverlay} ${isOpen ? styles.open : ''}`} onClick={toggleSidebar} />
            <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>

                <div className={styles.logoArea}>
                    <img src={logoImg} alt="TBOXSA" className={styles.logo} />
                    <button className={styles.closeBtn} onClick={toggleSidebar}><MdClose /></button>
                </div>

                <nav className={styles.nav}>
                    <ul className={styles.menuList}>

                        {/* DASHBOARD */}
                        {canRead('Dashboard') && (
                            <li className={`${styles.menuItem} ${isActive('/') ? styles.active : ''}`} onClick={() => navigate('/')}>
                                <img src={dashboardIcon} alt="Dashboard" className={styles.icon} />
                                <span className={styles.text}>Dashboard</span>
                            </li>
                        )}

                        {/* GRUPO TICKETS */}
                        {(canRead('Crear Ticket') || canRead('Asignar Tickets') || canRead('Tickets Activos')) && (
                            <li className={`${styles.menuGroup} ${isTicketsOpen ? styles.groupOpen : ''}`}>
                                <div
                                    className={styles.menuHeader}
                                    onClick={() => setIsTicketsOpen(!isTicketsOpen)}
                                >
                                    <div className={styles.leftContent}>
                                        <img src={ticketIcon} alt="Tickets" className={styles.icon} />
                                        <span className={styles.text}>Tickets</span>
                                    </div>
                                    <img
                                        src={arrorIcon}
                                        alt="Flecha"
                                        className={`${styles.arrowIcon} ${isTicketsOpen ? styles.rotated : ''}`}
                                    />
                                </div>

                                <ul className={`${styles.subMenu} ${isTicketsOpen ? styles.show : ''}`}>

                                    {/* 1. CREAR TICKET */}
                                    {canRead('Crear Ticket') && (
                                        <li className={`${styles.subItem} ${isActive('/tickets/createTicket') ? styles.active : ''}`} onClick={() => navigate('/tickets/createTicket')}>
                                            <div className={styles.subItemContent}>
                                                <img src={addTicketIcon} alt="AddTicket" className={styles.icon} />
                                                <span className={styles.subText}>Crear Ticket</span>
                                            </div>
                                        </li>
                                    )}

                                    {/* 2. ASIGNAR TICKETS */}
                                    {canRead('Asignar Tickets') && (
                                        <li className={`${styles.subItem} ${isActive('/tickets/assignedTicket') ? styles.active : ''}`} onClick={() => navigate('/tickets/assignedTicket')}>
                                            <div className={styles.spaceBetween}>
                                                <div className={styles.subItemContent}>
                                                    <img src={assignedTicketIcon} alt="Assigned" className={styles.icon} />
                                                    <span className={styles.subText}>Asignar Tickets</span>
                                                </div>
                                                {unassignedCount > 0 && (
                                                    <span className={styles.badge}>{unassignedCount}</span>
                                                )}
                                            </div>
                                        </li>
                                    )}

                                    {/* 3. TICKETS ACTIVOS */}
                                    {canRead('Tickets Activos') && (
                                        <li className={`${styles.subItem} ${isActive('/tickets/activeTicket') ? styles.active : ''}`} onClick={() => navigate('/tickets/activeTicket')}>
                                            <div className={styles.spaceBetween}>
                                                <div className={styles.subItemContent}>
                                                    <img src={activeTicketIcon} alt="Active" className={styles.icon} />
                                                    <span className={styles.subText}>Tickets Activos</span>
                                                </div>
                                                <span className={styles.badge}>0</span>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </li>
                        )}

                        {canRead('Historial') && (
                            <li className={`${styles.menuItem} ${isActive('/history') ? styles.active : ''}`} onClick={() => navigate('/history')}>
                                <img src={historyIcon} alt="Historial" className={styles.icon} />
                                <span className={styles.text}>Historial</span>
                            </li>
                        )}

                        {canRead('Garantias') && (
                            <li className={`${styles.menuItem} ${isActive('/warranty') ? styles.active : ''}`} onClick={() => navigate('/warranty')}>
                                <BsPatchCheck className={styles.icon} />
                                <span className={styles.text}>Garantías</span>
                            </li>
                        )}

                        {canRead('Usuarios') && (
                            <li className={`${styles.menuItem} ${isActive('/users') ? styles.active : ''}`} onClick={() => navigate('/users')} >
                                <img src={usersIcon} alt="Usuarios" className={styles.icon} />
                                <span className={styles.text}>Usuarios</span>
                            </li>
                        )}

                        {canRead('Salidas') && (
                            <li className={`${styles.menuItem} ${isActive('/departures') ? styles.active : ''}`} onClick={() => navigate('/departures')}>
                                <img src={locationIcon} alt="Salidas" className={styles.icon} />
                                <span className={styles.text}>Salidas</span>
                            </li>
                        )}

                        {canRead('Q&A') && (
                            <li className={`${styles.menuItem} ${isActive('/qa') ? styles.active : ''}`} onClick={() => navigate('/qa')}>
                                <img src={qaIcon} alt="Q&A" className={styles.icon} />
                                <span className={styles.text}>Q&A</span>
                            </li>
                        )}

                        {canRead('Comentarios') && (
                            <li className={`${styles.menuItem} ${isActive('/comments') ? styles.active : ''}`} onClick={() => navigate('/comments')}>
                                <img src={commentsIcon} alt="Comments" className={styles.icon} />
                                <span className={styles.text}>Comentarios</span>
                            </li>
                        )}

                    </ul>
                </nav>

                <div className={styles.profileSection}>
                    <div className={styles.profileCard}>
                        {user?.foto ? (
                            <img
                                src={user.foto}
                                alt="Perfil"
                                className={styles.avatarPlaceholder}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <CiUser className={styles.userIcon} />
                            </div>
                        )}

                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user?.nombre_completo || 'Usuario'}</p>
                            <span className={styles.userEmail}>{user?.correo || 'Sin correo'}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;