// ============================================
// PAGE: ACTIVE TICKET
// Tablero kanban de seguimiento en tiempo real.
// Cada columna representa un estado del flujo
// y se actualiza vía Socket.io sin recargar.
//
// COLUMNAS POR ROL:
//   Admin ve las 10 columnas (statusId 1-10).
//   Otros roles solo ven desde statusId 4 en
//   adelante (estados ya asignados); los estados
//   iniciales los gestiona el área de soporte.
//
// DOS MODALES SEGÚN ESTADO:
//   statusId ≤ 3 → TicketDetailModal en modo
//   readOnly: el ticket aún no está asignado,
//   solo se puede ver para redirigir a asignación.
//   statusId > 3 → TicketChatModal: el ticket
//   está activo y se puede gestionar desde aquí.
//
// SINCRONIZACIÓN DEL CHAT ABIERTO:
//   onTicketUpdated actualiza también chatTicket
//   si el ticket modificado es el que está abierto,
//   para evitar datos obsoletos en el modal
//   mientras llegan eventos de Socket.
// ============================================

import React, { useEffect, useState, useMemo } from "react";
import styles from "./ActiveTIcket.module.less";
import { LuCheck, LuX, LuCircleAlert, LuFilter, LuUser, LuCalendar, LuArrowUpDown, LuTag } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getActiveTicketsList, socket } from "../services/Ticketservice";
import ActiveTicketCard from "../components/Tickets Activos/ActiveTicketCard/ActiveTicketCard";
import TicketDetailModal from "../components/Asignar Tickets/TicketDetailModal/TicketDetailModal";
import TicketChatModal from "../components/Tickets Activos/TicketChatModal/TicketChatModal";

// Definición estática del tablero. El orden determina
// el orden visual de las columnas de izquierda a derecha.
const COLUMNS = [
    { statusId: 1, label: 'Nuevo', dotClass: 'dotNuevo' },
    { statusId: 2, label: 'Revisión Garantía', dotClass: 'dotRevision' },
    { statusId: 3, label: 'Por Asignar', dotClass: 'dotPorAsignar' },
    { statusId: 4, label: 'Asignado', dotClass: 'dotAsignado' },
    { statusId: 5, label: 'En Proceso', dotClass: 'dotEnProceso' },
    { statusId: 6, label: 'Pendiente Info', dotClass: 'dotPendiente' },
    { statusId: 7, label: 'Escalado', dotClass: 'dotEscalado' },
    { statusId: 8, label: 'Sol. Cancelación', dotClass: 'dotSolCancel' },
    { statusId: 9, label: 'Finalizado', dotClass: 'dotFinalizado' },
    { statusId: 10, label: 'Cancelado', dotClass: 'dotCancelado' },
];

const ActiveTicket = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const canRead = user?.Permissions?.some(p => p.Seccion?.module_name === "Tickets Activos" && p.permissions_read === 1);
    const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === "Tickets Activos" && p.permissions_write === 1);
    const canEdit = user?.Permissions?.some(p => p.Seccion?.module_name === "Tickets Activos" && p.permissions_edit === 1);

    // Los no-Admin solo gestionan tickets ya asignados (statusId ≥ 4).
    const columns = useMemo(
        () => user?.rol === 'Admin' ? COLUMNS : COLUMNS.filter(c => c.statusId >= 4),
        [user?.rol]
    );

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "", type: "success" });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [chatTicket, setChatTicket] = useState(null);

    const [filterUser, setFilterUser] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        document.title = "Soporte | Tickets Activos";
        if (canRead) loadTickets();
        else setLoading(false);
    }, [canRead]);

    useEffect(() => {
        if (!canRead) return;

        const refresh = () => loadTickets();

        const onTicketUpdated = (updatedTicket) => {
            refresh();
            // Si el modal de chat está abierto con este ticket, sincroniza
            // los datos para que el header del modal no muestre estado obsoleto.
            if (updatedTicket?.ticket_id) {
                setChatTicket(prev =>
                    prev?.ticket_id === updatedTicket.ticket_id
                        ? { ...prev, ...updatedTicket }
                        : prev
                );
            }
        };

        socket.on('new_ticket_created', refresh);
        socket.on('ticket_updated', onTicketUpdated);
        socket.on('ticket_status_changed', refresh);

        return () => {
            socket.off('new_ticket_created', refresh);
            socket.off('ticket_updated', onTicketUpdated);
            socket.off('ticket_status_changed', refresh);
        };
    }, [canRead]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await getActiveTicketsList();
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    // Opciones de filtro construidas desde los tickets cargados
    // para mostrar solo usuarios y categorías que realmente aparecen.
    const userOptions = useMemo(() => {
        const seen = new Set();
        const opts = [];
        tickets.forEach(t => {
            (t.assignedUsers || []).forEach(u => {
                if (!seen.has(u.user_id)) { seen.add(u.user_id); opts.push(u); }
            });
        });
        return opts;
    }, [tickets]);

    const categoryOptions = useMemo(() => {
        const seen = new Set();
        const opts = [];
        tickets.forEach(t => {
            if (t.category && !seen.has(t.category.category_id)) {
                seen.add(t.category.category_id);
                opts.push(t.category);
            }
        });
        return opts;
    }, [tickets]);

    const filteredTickets = useMemo(() => tickets.filter(t => {
        if (filterUser && !t.assignedUsers?.some(u => u.user_id === parseInt(filterUser))) return false;
        if (filterDate && !t.created_at?.startsWith(filterDate)) return false;
        if (filterPriority && t.ticket_priority !== filterPriority) return false;
        if (filterCategory && t.category?.category_id !== parseInt(filterCategory)) return false;
        return true;
    }), [tickets, filterUser, filterDate, filterPriority, filterCategory]);

    const clearFilters = () => {
        setFilterUser('');
        setFilterDate('');
        setFilterPriority('');
        setFilterCategory('');
    };

    const hasActiveFilters = filterUser || filterDate || filterPriority || filterCategory;

    const showToast = (title, message, type = "success") => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
    };

    if (!canRead) {
        return (
            <div className={styles.activeTicketContainer}>
                <div className={styles.errorInfo}>No tienes permisos para ver esta sección.</div>
            </div>
        );
    }

    return (
        <div className={styles.activeTicketContainer}>

            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Tickets Activos</h1>
                    <p className={styles.subtitle}>Seguimiento en tiempo real del estado de los casos.</p>
                </div>

                <div className={styles.filtersBar}>
                    <div className={styles.filterLabel}>
                        <LuFilter />
                        <span>Filtros:</span>
                    </div>

                    <div className={styles.filterGroup}>
                        <LuUser className={styles.filterIcon} />
                        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className={styles.filterSelect}>
                            <option value="">Usuario</option>
                            {userOptions.map(u => (
                                <option key={u.user_id} value={u.user_id}>{u.nombre_completo}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <LuCalendar className={styles.filterIcon} />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className={styles.filterDate}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <LuArrowUpDown className={styles.filterIcon} />
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={styles.filterSelect}>
                            <option value="">Prioridad</option>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <LuTag className={styles.filterIcon} />
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={styles.filterSelect}>
                            <option value="">Categoría</option>
                            {categoryOptions.map(c => (
                                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button className={styles.clearFilters} onClick={clearFilters}>
                            Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.boardWrapper}>
                <div
                    className={styles.boardLayout}
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}
                >
                    {columns.map(col => {
                        const colTickets = filteredTickets.filter(t => t.ticket_status_id === col.statusId);
                        return (
                            <div key={col.statusId} className={styles.columnContainer}>
                                <div className={styles.columnHeader}>
                                    <span className={`${styles.dot} ${styles[col.dotClass]}`} />
                                    <h3>{col.label}</h3>
                                    <span className={styles.countBadge}>{colTickets.length}</span>
                                </div>
                                <div className={styles.columnBody}>
                                    {loading ? (
                                        <div className={styles.emptyState}>Cargando...</div>
                                    ) : colTickets.length === 0 ? (
                                        <div className={styles.emptyState}>No tickets</div>
                                    ) : (
                                        colTickets.map(ticket => (
                                            <ActiveTicketCard
                                                key={ticket.ticket_id}
                                                ticket={ticket}
                                                statusId={col.statusId}
                                                onClick={
                                                    // ≤3: aún sin asignar, solo vista previa que redirige
                                                    // >3: activo, se gestiona desde el chat modal
                                                    col.statusId <= 3
                                                        ? (t) => setSelectedTicket(t)
                                                        : (t) => setChatTicket(t)
                                                }
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {chatTicket && (
                <TicketChatModal
                    ticket={chatTicket}
                    onClose={() => setChatTicket(null)}
                    onSuccess={(msg) => {
                        setChatTicket(null);
                        showToast('¡Acción Exitosa!', msg, 'success');
                        loadTickets();
                    }}
                    canWrite={canWrite}
                    canEdit={canEdit}
                />
            )}

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    readOnly
                    onManage={() => {
                        setSelectedTicket(null);
                        navigate('/tickets/assignedTicket', { state: { highlightTicketId: selectedTicket.ticket_id } });
                    }}
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

export default ActiveTicket;