import React, { useEffect } from "react";
import styles from "./AssignedTicket.module.less";
import clockIcon from '../assets/icons/Clock-icon.svg';
import { FiEye } from "react-icons/fi";
import assignedTicketIcon from '../assets/icons/Assigned-icon.svg';

const assignedTicket = () => {

    useEffect(() => {
        document.title = "Soporte | Asignar Tickets";
    }, []);

    return (
        <div className={styles.assignedTicketContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.title}>Asignar Tickets</h1>
                <p className={styles.subtitle}>Gestiona la carga de trabajo del equipo</p>
            </div>
        </div>
    );
};

export default assignedTicket;