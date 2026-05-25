// ============================================
// PAGE: HISTORIAL
// Bitácora completa de tickets cerrados/archivados.
// Permite buscar, filtrar por estado/prioridad/fecha,
// visualizar el detalle de un ticket y editar
// tickets en estados finales (4–8).
//
// PERMISOS:
//   canRead — necesario para ver la tabla
//   canEdit — habilita acciones de edición
//
// FLUJO DE EDICIÓN (handleEdit):
//   ticket_status_id ≤ 3  → redirige a AssignedTicket
//     con highlightTicketId (aún está activo)
//   ticket_status_id 4–8  → abre HistorialEditModal
//
// filteredTickets: derivado con useMemo de tickets +
//   searchTerm + appliedFilters. Filtra por número de
//   ticket, asunto, cliente, empresa, estado, prioridad
//   y rango de fechas.
//
// dateRange: useMemo que extrae min/max de created_at
//   para pasarlos al HistorialFilterModal como límites
//   del date picker.
//
// Socket: se suscribe a 'ticket_updated' y
//   'new_ticket_created' para recargar la lista en
//   tiempo real cuando canRead es true.
// ============================================

import React, { useState, useEffect, useMemo } from "react";
import styles from "./Historial.module.less";
import lensIcon from "../assets/icons/Lens-icon.svg";
import { MdFilterListAlt } from "react-icons/md";
import { LuCheck, LuX, LuCircleAlert } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getHistorialTickets, socket } from "../services/Ticketservice";
import HistorialTable from "../components/HIstorial/HistorialTable/HistorialTable";
import HistorialViewModal from "../components/HIstorial/HistorialViewModal/HistorialViewModal";
import HistorialEditModal from "../components/HIstorial/HistorialEditModal/HistorialEditModal";
import HistorialFilterModal from "../components/HIstorial/HistorialFilterModal/HistorialFilterModal";

const Historial = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const canRead = user?.Permissions?.some(p =>
        p.Seccion?.module_name === "Historial" && p.permissions_read === 1
    );
    const canEdit = user?.Permissions?.some(p =>
        p.Seccion?.module_name === "Historial" && p.permissions_edit === 1
    );

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "", type: "success" });

    const [viewTicket, setViewTicket] = useState(null);
    const [editTicket, setEditTicket] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [appliedFilters, setAppliedFilters] = useState({
        status: '',
        priority: '',
        dateFrom: '',
        dateTo: ''
    });

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await getHistorialTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Soporte | Historial";
        if (canRead) loadTickets();
        else setLoading(false);
    }, [canRead]);

    useEffect(() => {
        if (!canRead) return;
        socket.on('ticket_updated', loadTickets);
        socket.on('new_ticket_created', loadTickets);
        return () => {
            socket.off('ticket_updated', loadTickets);
            socket.off('new_ticket_created', loadTickets);
        };
    }, [canRead]);

    const dateRange = useMemo(() => {
        if (tickets.length === 0) return { min: '', max: '' };
        const dates = tickets.map(t => t.created_at?.split('T')[0]).filter(Boolean).sort();
        return { min: dates[0], max: dates[dates.length - 1] };
    }, [tickets]);

    const hasActiveFilters = appliedFilters.status || appliedFilters.priority || appliedFilters.dateFrom || appliedFilters.dateTo;

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const searchLower = searchTerm.toLowerCase();
            const ticketNum = `T-${t.ticket_id?.toString().padStart(4, '0')}`;
            const clientName = `${t.customer?.customer_first_name || ''} ${t.customer?.customer_last_name || ''}`.toLowerCase();
            const company = (t.customer?.customer_company || '').toLowerCase();

            const matchesSearch = !searchTerm || (
                ticketNum.toLowerCase().includes(searchLower) ||
                (t.ticket_subject || '').toLowerCase().includes(searchLower) ||
                clientName.includes(searchLower) ||
                company.includes(searchLower)
            );

            const matchesStatus = !appliedFilters.status ||
                t.ticket_status_id === parseInt(appliedFilters.status);

            const matchesPriority = !appliedFilters.priority ||
                t.ticket_priority === appliedFilters.priority;

            const ticketDate = t.created_at ? t.created_at.split('T')[0] : '';
            const matchesDateFrom = !appliedFilters.dateFrom || ticketDate >= appliedFilters.dateFrom;
            const matchesDateTo = !appliedFilters.dateTo || ticketDate <= appliedFilters.dateTo;

            return matchesSearch && matchesStatus && matchesPriority && matchesDateFrom && matchesDateTo;
        });
    }, [tickets, searchTerm, appliedFilters]);

    const showToast = (title, message, type = "success") => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
    };

    const handleEdit = (t) => {
        if (t.ticket_status_id <= 3) {
            navigate('/tickets/assignedTicket', { state: { highlightTicketId: t.ticket_id } });
        } else {
            setEditTicket(t);
        }
    };

    const handleEditSuccess = (msg) => {
        setEditTicket(null);
        showToast('¡Actualización Exitosa!', msg, 'success');
        loadTickets();
    };

    if (!canRead) {
        return (
            <div className={styles.historialContainer}>
                <div className={styles.errorInfo}>No tienes permisos para visualizar el historial.</div>
            </div>
        );
    }

    return (
        <div className={styles.historialContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Historial</h1>
                    <p className={styles.subtitle}>Bitácora completa de movimientos y cambios en los tickets.</p>
                </div>
            </div>

            <div className={styles.controlsWrapper}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <img src={lensIcon} alt="Buscar" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por No., asunto, cliente o empresa..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        <div className={styles.iconGroup}>
                            <button
                                className={`${styles.filterBtn} ${hasActiveFilters ? styles.activeFilter : ''}`}
                                onClick={() => setShowFilterModal(true)}
                                title="Filtrar"
                            >
                                <MdFilterListAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingState}>Cargando historial...</div>
                ) : (
                    <HistorialTable
                        data={filteredTickets}
                        onView={setViewTicket}
                        onEdit={handleEdit}
                        canEdit={canEdit}
                    />
                )}
            </div>

            {viewTicket && (
                <HistorialViewModal
                    ticket={viewTicket}
                    onClose={() => setViewTicket(null)}
                />
            )}

            {editTicket && canEdit && editTicket.ticket_status_id >= 4 && editTicket.ticket_status_id <= 8 && (
                <HistorialEditModal
                    ticket={editTicket}
                    onClose={() => setEditTicket(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <HistorialFilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                currentFilters={appliedFilters}
                onApply={setAppliedFilters}
                minDate={dateRange.min}
                maxDate={dateRange.max}
            />

            {toastConfig.show && (
                <div className={`${styles.successToast} ${toastConfig.type === 'error' ? styles.errorToast : ''}`}>
                    <div className={styles.toastIconContainer}>
                        {toastConfig.type === 'success'
                            ? <LuCheck className={styles.checkIcon} />
                            : <LuCircleAlert className={styles.checkIcon} />
                        }
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

export default Historial;