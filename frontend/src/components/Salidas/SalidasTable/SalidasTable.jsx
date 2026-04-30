import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import styles from './SalidasTable.module.less';
import { FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const formatID    = (id) => `T-${id.toString().padStart(4, '0')}`;
const formatDate  = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const formatTime  = (t) => t ? t.slice(0, 5) : '—';

const STATUS_MAP = {
    0: { label: 'Pendiente', cls: styles.pendiente },
    1: { label: 'Aprobada',  cls: styles.aprobada  },
    2: { label: 'Rechazada', cls: styles.rechazada  },
};

const UserCell = ({ row }) => {
    const [imgOk, setImgOk] = useState(true);
    const hasImg = row.foto && row.foto !== 'default.jpg' && imgOk;
    const initial = (row.nombre_completo || '?').charAt(0).toUpperCase();
    return (
        <div className={styles.userCell}>
            <div className={styles.avatar}>
                {hasImg
                    ? <img src={`http://localhost:8000/uploads/profiles/${row.foto}`} alt={row.nombre_completo} onError={() => setImgOk(false)} />
                    : initial
                }
            </div>
            <div>
                <p className={styles.userName}>{row.nombre_completo}</p>
                <p className={styles.userRole}>{row.cargo || row.rol}</p>
            </div>
        </div>
    );
};

const SalidasTable = ({ data, onView, onApprove, onReject, isAdmin }) => {
    const columns = [
        {
            name: 'ID',
            selector: row => row.salida_id,
            sortable: true,
            width: '70px',
            cell: row => <span className={styles.idCell}>#{row.salida_id}</span>,
        },
        {
            name: 'Solicitante',
            selector: row => row.nombre_completo,
            sortable: true,
            minWidth: '180px',
            cell: row => <UserCell row={row} />,
        },
        {
            name: 'Ticket',
            selector: row => row.ticket_id,
            sortable: true,
            minWidth: '160px',
            cell: row => (
                <div className={styles.ticketCell}>
                    <span className={styles.ticketId}>{formatID(row.ticket_id)}</span>
                    <span className={styles.ticketSubject}>{row.ticket_subject}</span>
                </div>
            ),
        },
        {
            name: 'Destino',
            selector: row => row.salida_destination,
            sortable: true,
            minWidth: '140px',
            cell: row => <span className={styles.destination}>{row.salida_destination}</span>,
        },
        {
            name: 'Fecha y Hora',
            selector: row => row.salida_date,
            sortable: true,
            width: '140px',
            cell: row => (
                <div className={styles.dateCell}>
                    <span>{formatDate(row.salida_date)}</span>
                    <span className={styles.time}>{formatTime(row.salida_time)}</span>
                </div>
            ),
        },
        {
            name: 'Fecha Creación',
            selector: row => row.created_at,
            sortable: true,
            width: '140px',
            cell: row => <span>{formatDate(row.created_at)}</span>,
        },
        {
            name: 'Estado',
            selector: row => row.salida_status,
            sortable: true,
            width: '120px',
            cell: row => {
                const s = STATUS_MAP[row.salida_status] || STATUS_MAP[0];
                return <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>;
            },
        },
        {
            name: 'Acciones',
            width: '120px',
            cell: row => (
                <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Ver detalle" onClick={() => onView(row)}>
                        <FiEye />
                    </button>
                    {isAdmin && row.salida_status === 0 && (
                        <>
                            <button className={`${styles.actionBtn} ${styles.approveBtn}`} title="Aprobar" onClick={() => onApprove(row)}>
                                <FiCheckCircle />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.rejectBtn}`} title="Rechazar" onClick={() => onReject(row)}>
                                <FiXCircle />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '12px',
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        cells: {
            style: {
                fontSize: '13px',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        rows: {
            style: {
                borderBottom: '1px solid #f3f4f6',
                '&:hover': { backgroundColor: '#fafafa' },
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #f3f4f6',
                fontSize: '13px',
                color: '#6b7280',
            },
        },
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            paginationComponentOptions={{
                rowsPerPageText: 'Filas por página:',
                rangeSeparatorText: 'de',
            }}
            noDataComponent={<div className={styles.emptyState}>No se encontraron salidas.</div>}
            customStyles={customStyles}
            highlightOnHover
            responsive
        />
    );
};

export default SalidasTable;