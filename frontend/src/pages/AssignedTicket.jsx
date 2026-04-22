import React, { useEffect, useState } from "react";
import styles from "./AssignedTicket.module.less";
import { FiPlus } from "react-icons/fi";
import { LuCheck, LuX, LuCircleAlert } from "react-icons/lu"; // Íconos para el Toast
import { useNavigate } from "react-router-dom";

// Componentes y Servicios
import { getAllTickets } from "../services/Ticketservice";
import { useAuth } from "../context/AuthContext";
import TicketsTabs from "../components/Asignar Tickets/TicketsTabs/TicketsTabs";
import TicketCard from "../components/Asignar Tickets/TicketCard/TicketCard";
import AssignTicketModal from "../components/Asignar Tickets/AssignTicketModal/AssignTicketModal";
import TicketDetailModal from "../components/Asignar Tickets/TicketDetailModal/TicketDetailModal";

const AssignedTicket = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const canRead = user?.Permissions?.some(p => p.Seccion?.module_name === "Asignar Tickets" && p.permissions_read === 1);
    const canEdit = user?.Permissions?.some(p => p.Seccion?.module_name === "Asignar Tickets" && p.permissions_edit === 1);
    const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === "Asignar Tickets" && p.permissions_write === 1);

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(1);

    // Estados para Modales
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // NUEVO: Estado para el Toast (Mensaje de éxito/error)
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
                // Ordenamos por fecha (más antiguos primero o según prefieras)
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

    // Función para mostrar el Toast
    const showToast = (title, message, type = "success") => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
    };

    const handleActionSuccess = (mensaje) => {
        // En lugar de alert, usamos nuestro nuevo showToast
        showToast("¡El Ticket se ha movido exitosamente!", mensaje, "success");
        loadTickets(); 
    };

    // Filtrado de tickets
    const nuevosTickets = tickets.filter(t => t.ticket_status_id === 1 || t.ticket_status_id === 2);
    const backlogTickets = tickets.filter(t => t.ticket_status_id === 3);
    const ticketsToShow = activeTab === 1 ? nuevosTickets : backlogTickets;

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

            <TicketsTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                nuevosCount={nuevosTickets.length}
                backlogCount={backlogTickets.length}
            />

            <div className={styles.ticketList}>
                {loading ? (
                    <div className={styles.loading}>Cargando tickets...</div>
                ) : ticketsToShow.length === 0 ? (
                    <div className={styles.emptyState}>No hay tickets en esta sección.</div>
                ) : (
                    <div className={styles.cardsGrid}>
                        {ticketsToShow.map(ticket => (
                            <TicketCard
                                key={ticket.ticket_id}
                                ticket={ticket}
                                activeTab={activeTab}
                                onViewDetail={handleViewDetail}
                                onAssign={handleOpenAssignModal}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
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

            {/* TOAST NOTIFICATION (Igual al de CreateTicket) */}
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