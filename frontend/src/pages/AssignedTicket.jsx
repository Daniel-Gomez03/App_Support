import React, { useEffect } from "react";
import styles from "./AssignedTicket.module.less";
import clockIcon from '../assets/icons/Clock-icon.svg';
import { FiEye, FiPlus, FiClock } from "react-icons/fi";
import assignedTicketIcon from '../assets/icons/Assigned-icon.svg';
import { useNavigate } from "react-router-dom";
import { LuTag, LuBox } from "react-icons/lu";

const assignedTicket = () => {

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
        </div>
    );
};

export default assignedTicket;