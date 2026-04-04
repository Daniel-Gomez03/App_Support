import React, { useEffect } from "react";
import styles from "./AssignedTicket.module.less";
import clockIcon from '../assets/icons/Clock-icon.svg';
import { FiEye, FiPlus, FiClock } from "react-icons/fi";
import assignedTicketIcon from '../assets/icons/Assigned-icon.svg';
import { useNavigate } from "react-router-dom";
import { useTicketContext } from "../context/TicketContext";
import { LuTag, LuBox } from "react-icons/lu";

const assignedTicket = () => {

    const { tickets } = useTicketContext();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Soporte | Asignar Tickets";
    }, []);

    const formatID = (id) => `T-${id.toString().slice(-4)}`;

    return (
        <div className={styles.assignedTicketContainer}>

            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Asignar Tickets</h1>
                    <p className={styles.subtitle}>Gestiona la carga de trabajo del equipo.</p>
                </div>
                <button className={styles.createBtn} onClick={() => navigate('/tickets/createTicket')}>
                    <FiPlus /> Crear Ticket
                </button>
            </div>

            <div className={styles.mainGrid}>

                <div className={styles.leftColumn}>
                    <h3 className={styles.columnTitle}>
                        <span className={styles.greenDot}></span> Tickets Nuevos (Entrantes)
                    </h3>

                    <div className={styles.ticketsList}>
                        {tickets.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No hay tickets nuevos por ahora.</p>
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <div key={ticket.ticket_id} className={styles.ticketCard}>

                                    <div className={styles.cardTopRow}>
                                        <span className={styles.ticketId}>{formatID(ticket.ticket_id)}</span>
                                        <div className={styles.timeWrapper}>
                                            <FiClock />
                                            <span>10 min</span>
                                        </div>
                                    </div>

                                    <div className={styles.cardContent}>
                                        <h4 className={styles.clientName}>{ticket.company}</h4>
                                        <p className={styles.ticketIssue}>{ticket.subject}</p>
                                    </div>

                                    <div className={styles.tagRow}>
                                        <span className={`${styles.tag} ${styles.tagBlue}`}>
                                            <LuTag className={styles.tagIcon} /> {ticket.category}
                                        </span>
                                        <span className={`${styles.tag} ${styles.tagOrange}`}>
                                            <LuBox className={styles.tagIcon} /> {ticket.deviceType}
                                        </span>
                                    </div>

                                    <button className={styles.btnDetails}>
                                        <FiEye /> Ver Detalles
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={`${styles.columnWrapper} ${styles.grayColumn}`}>
                    <h3 className={styles.columnTitle}>
                        <span className={styles.greenDot}></span> Backlog de Asignación
                    </h3>

                    <div className={styles.emptyBacklogHint}>
                        <p>No hay más tickets pendientes de asignación.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default assignedTicket;