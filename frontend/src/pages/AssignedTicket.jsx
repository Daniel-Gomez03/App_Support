import React, { useEffect, useState, useCallback } from "react";
import styles from "./AssignedTicket.module.less";
import { FiPlus } from "react-icons/fi";
import { LuCheck, LuX, LuCircleAlert } from "react-icons/lu";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllTickets } from "../services/Ticketservice";
import { useAuth } from "../context/AuthContext";
import TicketCard from "../components/Asignar Tickets/TicketCard/TicketCard";
import AssignTicketModal from "../components/Asignar Tickets/AssignTicketModal/AssignTicketModal";
import TicketDetailModal from "../components/Asignar Tickets/TicketDetailModal/TicketDetailModal";

const AssignedTicket = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const highlightTicketId = location.state?.highlightTicketId ?? null;

    const highlightRef = useCallback((node) => {
        if (node) {
            setTimeout(() => node.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
        }
    }, []);

    const canRead = user?.Permissions?.some(p => p.Seccion?.module_name === "Asignar Tickets" && p.permissions_read === 1);
    const canEdit = user?.Permissions?.some(p => p.Seccion?.module_name === "Asignar Tickets" && p.permissions_edit === 1);
    const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === "Asignar Tickets" && p.permissions_write === 1);

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "", type: "success" });

    useEffect(() => {
        document.title = "Soporte | Asignar Tickets";
        if (canRead) {
            loadTickets();
        } else {
            setLoading(false);
        }
    }, [canRead]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await getAllTickets();
            if (Array.isArray(data)) {
                const sortedData = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                setTickets(sortedData);
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error("Error al cargar los tickets:", error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type = "success") => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
    };

    const handleActionSuccess = (mensaje) => {
        showToast("¡Acción Exitosa!", mensaje, "success");
        loadTickets();
    };

    const nuevosTickets = tickets.filter(t => t.ticket_status_id === 1 || t.ticket_status_id === 2);
    const backlogTickets = tickets.filter(t => t.ticket_status_id === 3);

    const handleViewDetail = (ticket) => {
        if (!canEdit) {
            showToast("Acceso Denegado", "No tienes permisos para asignar tickets.", "error");
            return;
        }
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    const handleOpenAssignModal = (ticket) => {
        if (!canEdit) {
            showToast("Acceso Denegado", "No tienes permisos para asignar tickets.", "error");
            return;
        }
        setSelectedTicket(ticket);
        setShowAssignModal(true);
    };

    if (!canRead) {
        return (
            <div className={styles.assignedTicketContainer}>
                <div className={styles.errorInfo}>No tienes permisos para ver esta sección.</div>
            </div>
        );
    }

    return (
        <div className={styles.assignedTicketContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Asignar Tickets</h1>
                    <p className={styles.subtitle}>Gestiona la carga de trabajo del equipo.</p>
                </div>
                {canWrite && (
                    <button className={styles.createBtn} onClick={() => navigate('/tickets/createTicket')}>
                        <FiPlus /> Crear Ticket
                    </button>
                )}
            </div>

            <div className={styles.boardLayout}>

                <div className={styles.columnContainer}>
                    <div className={styles.columnHeader}>
                        <span className={styles.dotNew}></span>
                        <h3>Tickets Nuevos (Entrantes)</h3>
                        <span className={styles.countBadge}>{nuevosTickets.length}</span>
                    </div>

                    <div className={styles.columnBody}>
                        {loading ? (
                            <div className={styles.loadingCol}>Cargando...</div>
                        ) : nuevosTickets.length === 0 ? (
                            <div className={styles.emptyState}>No hay tickets nuevos.</div>
                        ) : (
                            nuevosTickets.map(ticket => (
                                <div key={ticket.ticket_id} ref={ticket.ticket_id === highlightTicketId ? highlightRef : null}>
                                    <TicketCard
                                        ticket={ticket}
                                        highlighted={ticket.ticket_id === highlightTicketId}
                                        showAssignButton={false}
                                        onViewDetail={handleViewDetail}
                                        onAssign={handleOpenAssignModal}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.columnContainer}>
                    <div className={styles.columnHeader}>
                        <span className={styles.dotBacklog}></span>
                        <h3>Backlog de Asignación</h3>
                        <span className={styles.countBadge}>{backlogTickets.length}</span>
                    </div>

                    <div className={styles.columnBody}>
                        {loading ? (
                            <div className={styles.loadingCol}>Cargando...</div>
                        ) : backlogTickets.length === 0 ? (
                            <div className={styles.emptyState}>No hay tickets pendientes de asignación.</div>
                        ) : (
                            backlogTickets.map(ticket => (
                                <div key={ticket.ticket_id} ref={ticket.ticket_id === highlightTicketId ? highlightRef : null}>
                                    <TicketCard
                                        ticket={ticket}
                                        highlighted={ticket.ticket_id === highlightTicketId}
                                        showAssignButton={true}
                                        onViewDetail={handleViewDetail}
                                        onAssign={handleOpenAssignModal}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {showAssignModal && selectedTicket && (
                <AssignTicketModal
                    ticket={selectedTicket}
                    onClose={() => { setShowAssignModal(false); setSelectedTicket(null); }}
                    onSuccess={handleActionSuccess}
                />
            )}

            {showDetailModal && selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => { setShowDetailModal(false); setSelectedTicket(null); }}
                    onSuccess={handleActionSuccess}
                />
            )}

            {toastConfig.show && (
                <div className={`${styles.successToast} ${toastConfig.type === 'error' ? styles.errorToast : ''}`}>
                    <div className={styles.toastIcon}>
                        {toastConfig.type === 'success' ? <LuCheck /> : <LuCircleAlert />}
                    </div>
                    <div className={styles.toastContent}>
                        <h4>{toastConfig.title}</h4>
                        <p>{toastConfig.message}</p>
                    </div>
                    <button onClick={() => setToastConfig(prev => ({ ...prev, show: false }))} className={styles.toastClose}>
                        <LuX />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssignedTicket;