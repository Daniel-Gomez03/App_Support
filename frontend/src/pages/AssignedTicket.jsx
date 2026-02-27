import React, { useEffect } from "react";
import styles from "./AssignedTicket.module.less";
import clockIcon from '../assets/icons/Clock-icon.svg';
import { FiEye, FiPlus } from "react-icons/fi";
import assignedTicketIcon from '../assets/icons/Assigned-icon.svg';

const assignedTicket = () => {

    useEffect(() => {
        document.title = "Soporte | Asignar Tickets";
    }, []);

return (
        <div className={styles.assignedTicketContainer}>
            
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Asignar Tickets</h1>
                    <p className={styles.subtitle}>Gestiona la carga de trabajo del equipo.</p>
                </div>
                <button className={styles.createBtn}>
                    <FiPlus /> Crear Ticket
                </button>
            </div>

            <div className={styles.mainGrid}>

                <div className={styles.leftColumn}>
                    <h3 className={styles.columnTitle}>
                        <span className={styles.greenDot}></span> Tickets Nuevos (Entrantes)
                    </h3>

                    <div className={styles.ticketCard}>
                        
                        <div className={styles.cardTopRow}>
                            <span className={styles.ticketId}>T-204</span>
                            <div className={styles.timeWrapper}>
                                <img src={clockIcon} alt="clock" />
                                <span>10 min</span>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <h4 className={styles.clientName}>Supermercado La Colonia</h4>
                            <p className={styles.ticketIssue}>Error en facturación POS 4</p>
                        </div>

                        {/* Tags / Etiquetas */}
                        <div className={styles.tagRow}>
                            <span className={`${styles.tag} ${styles.tagBlue}`}>
                                🏷️ Soluciones
                            </span>
                            <span className={`${styles.tag} ${styles.tagOrange}`}>
                                📦 TBOXSAPOS
                            </span>
                        </div>

                        <button className={styles.btnDetails}>
                            <FiEye /> Ver Detalles
                        </button>
                    </div>

                </div>

                <div className={styles.rightColumn}>
                    <h3 className={styles.columnTitle}>
                        <span className={styles.greenDot}></span> Backlog de Asignación
                    </h3>

                    <div className={styles.emptyBacklogHint}>
                        No hay tickets seleccionados.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default assignedTicket;