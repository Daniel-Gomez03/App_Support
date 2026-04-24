import React from 'react';
import DataTable from 'react-data-table-component';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { FiEdit, FiEye, FiArrowRight } from 'react-icons/fi';
import styles from './HistorialTable.module.less';

const STATUS_MAP = {
    1: { label: 'Nuevo', bg: '#f3f4f6', color: '#374151' },
    2: { label: 'Revisión Garantía', bg: '#f5f3ff', color: '#7c3aed' },
    3: { label: 'Por Asignar', bg: '#fffbeb', color: '#d97706' },
    4: { label: 'Asignado', bg: '#eff6ff', color: '#2563eb' },
    5: { label: 'En Proceso', bg: '#ecfeff', color: '#0e7490' },
    6: { label: 'Pendiente Info', bg: '#fff7ed', color: '#ea580c' },
    7: { label: 'Escalado', bg: '#fef2f2', color: '#dc2626' },
    8: { label: 'Sol. Cancelación', bg: '#fdf4ff', color: '#a21caf' },
    9: { label: 'Finalizado', bg: '#f0fdf4', color: '#16a34a' },
    10: { label: 'Cancelado', bg: '#fef2f2', color: '#991b1b' },
};

const PRIORITY_MAP = {
    Alta: { bg: '#fef2f2', color: '#dc2626' },
    Media: { bg: '#fffbeb', color: '#d97706' },
    Baja: { bg: '#f0fdf4', color: '#16a34a' },
};

const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
};

const AvatarStack = ({ users }) => {
    if (!users || users.length === 0) return <span className={styles.noAssigned}>—</span>;
    const visible = users.slice(0, 3);
    const extra = users.length - 3;
    return (
        <div className={styles.avatarStack}>
            {visible.map((u, i) => {
                const hasFoto = u.foto && u.foto !== 'default.jpg';
                return (
                    <div
                        key={u.user_id}
                        className={styles.avatarItem}
                        style={{ zIndex: users.length - i }}
                        title={u.nombre_completo}
                    >
                        {hasFoto ? (
                            <img
                                src={u.foto}
                                alt={u.nombre_completo}
                                className={styles.avatarImg}
                                onError={e => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={styles.avatarFallback}
                            style={{ display: !hasFoto ? 'flex' : 'none' }}
                        >
                            {u.nombre_completo?.charAt(0)?.toUpperCase()}
                        </div>
                    </div>
                );
            })}
            {extra > 0 && (
                <div className={styles.avatarMore} style={{ zIndex: 0 }}>+{extra}</div>
            )}
        </div>
    );
};

const ClientCell = ({ customer }) => {
    const firstName = customer?.customer_first_name || '';
    const lastName = customer?.customer_last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Sin nombre';
    const initial = fullName.charAt(0).toUpperCase();
    const hasFoto = customer?.customer_image && customer.customer_image !== 'default.jpg';

    return (
        <div className={styles.clientCell}>
            <div className={styles.clientAvatar}>
                {hasFoto ? (
                    <img
                        src={customer.customer_image}
                        alt={fullName}
                        onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className={styles.clientFallback}
                    style={{ display: !hasFoto ? 'flex' : 'none' }}
                >
                    {initial}
                </div>
            </div>
            <span className={styles.clientName}>{fullName}</span>
        </div>
    );
};

const HistorialTable = ({ data, onView, onEdit, canEdit }) => {
    const columns = [
        {
            name: 'No. de Ticket',
            selector: row => row.ticket_id,
            sortable: true,
            width: '130px',
            cell: row => (
                <span className={styles.ticketId}>{formatID(row.ticket_id)}</span>
            ),
        },
        {
            name: 'Asunto',
            selector: row => row.ticket_subject,
            sortable: true,
            minWidth: '160px',
            cell: row => (
                <span className={styles.subject} title={row.ticket_subject}>
                    {row.ticket_subject}
                </span>
            ),
        },
        {
            name: 'Cliente',
            selector: row => row.customer?.customer_first_name,
            sortable: true,
            minWidth: '160px',
            cell: row => <ClientCell customer={row.customer} />,
        },
        {
            name: 'Empresa',
            selector: row => row.customer?.customer_company,
            sortable: true,
            minWidth: '140px',
            cell: row => (
                <span className={styles.company}>
                    {row.customer?.customer_company || '—'}
                </span>
            ),
        },
        {
            name: 'Técnico Asignado',
            minWidth: '130px',
            cell: row => <AvatarStack users={row.assignedUsers} />,
        },
        {
            name: 'Prioridad',
            selector: row => row.ticket_priority,
            sortable: true,
            width: '110px',
            cell: row => {
                const cfg = PRIORITY_MAP[row.ticket_priority];
                if (!cfg) return <span className={styles.noPriority}>—</span>;
                return (
                    <span
                        className={styles.priorityBadge}
                        style={{ background: cfg.bg, color: cfg.color }}
                    >
                        {row.ticket_priority}
                    </span>
                );
            },
        },
        {
            name: 'Posición',
            selector: row => row.ticket_status_id,
            sortable: true,
            minWidth: '150px',
            cell: row => {
                const st = STATUS_MAP[row.ticket_status_id] || { label: 'Desconocido', bg: '#f3f4f6', color: '#6b7280' };
                return (
                    <span
                        className={styles.statusBadge}
                        style={{ background: st.bg, color: st.color }}
                    >
                        {st.label}
                    </span>
                );
            },
        },
        {
            name: 'Fecha',
            selector: row => row.created_at,
            sortable: true,
            width: '110px',
            cell: row => <span className={styles.date}>{formatDate(row.created_at)}</span>,
        },
        {
            name: 'Acciones',
            cell: row => {
                const s = row.ticket_status_id;
                const isClosed = s === 9 || s === 10;
                const isPending = s <= 3;
                return (
                    <div className={styles.actions}>
                        <button
                            className={styles.iconBtn}
                            onClick={() => onView(row)}
                            title="Ver detalle e historial del chat"
                        >
                            <FiEye />
                        </button>
                        {canEdit && !isClosed && (
                            isPending ? (
                                <button
                                    className={`${styles.iconBtn} ${styles.manageBtn}`}
                                    onClick={() => onEdit(row)}
                                    title="Gestionar ticket en Asignar Tickets"
                                >
                                    <FiArrowRight />
                                </button>
                            ) : (
                                <button
                                    className={`${styles.iconBtn} ${styles.editBtn}`}
                                    onClick={() => onEdit(row)}
                                    title="Editar técnico, prioridad o fecha"
                                >
                                    <FiEdit />
                                </button>
                            )
                        )}
                    </div>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '100px',
        }
    ];

    const customStyles = {
        headCells: {
            style: {
                fontWeight: '600',
                color: '#666',
                fontSize: '13px',
                borderBottom: '1px solid #eee',
                textTransform: 'uppercase',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        cells: {
            style: {
                fontSize: '14px',
                color: '#333',
                padding: '12px 16px',
            },
        },
        rows: {
            style: {
                '&:hover': {
                    backgroundColor: '#f9fafb',
                }
            }
        }
    };

    return (
        <div className={styles.tableWrapper}>
            <StyleSheetManager shouldForwardProp={prop => isPropValid(prop)}>
                <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50]}
                    customStyles={customStyles}
                    highlightOnHover
                    noDataComponent={
                        <div className={styles.noData}>No hay registros en el historial para mostrar.</div>
                    }
                />
            </StyleSheetManager>
        </div>
    );
};

export default HistorialTable;