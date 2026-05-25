// ============================================
// COMPONENT: TABLES CASES (Dashboard)
// Tabla paginada de tickets activos agrupados
// por técnico (estados 4-10: asignado → cancelado).
// Muestra una fila por usuario con conteos
// coloreados por estado.
//
// CONSTANTES (fuera del árbol):
//   customStyles      — estilos inline para react-data-table
//   paginationOptions — textos de paginación en español
//   STATUS_STYLES     — map estado → { bg, color } del badge
//   COLUMNS           — definición de columnas de estado
//   columns           — config final para DataTable; derivada
//                       de COLUMNS + NumCell (sin deps de props)
//
// NumCell: celda que muestra 0 atenuado (.faded)
//   o un badge coloreado para valores > 0.
//   Usa parseInt para normalizar strings del API.
// ============================================

import React from "react";
import DataTable from 'react-data-table-component';
import styles from './TablesCases.module.less';

const customStyles = {
    headRow: {
        style: {
            borderBottomWidth: '1px',
            borderBottomColor: '#F3F4F6',
            backgroundColor: '#ffffff',
            minHeight: '40px',
        },
    },
    headCells: {
        style: {
            fontSize: '10px',
            fontWeight: '700',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            paddingLeft: '12px',
            paddingRight: '12px',
            whiteSpace: 'nowrap',
        },
    },
    rows: {
        style: {
            minHeight: '56px',
            fontSize: '14px',
            color: '#374151',
            borderBottomColor: '#F3F4F6',
        },
    },
    cells: {
        style: {
            paddingLeft: '12px',
            paddingRight: '12px',
        },
    },
};

const paginationOptions = {
    rowsPerPageText: 'Filas por página',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
};

const STATUS_STYLES = {
    asignado: { bg: '#ecfdf5', color: '#059669' },
    enProceso: { bg: '#fff7ed', color: '#c2410c' },
    pendienteInfo: { bg: '#fffbeb', color: '#b45309' },
    escalado: { bg: '#fef2f2', color: '#b91c1c' },
    solCancelacion: { bg: '#fdf4ff', color: '#a21caf' },
    finalizado: { bg: '#f0fdf4', color: '#166534' },
    cancelado: { bg: '#f9fafb', color: '#6b7280' },
};

const NumCell = ({ value, field }) => {
    const v = parseInt(value) || 0;
    if (v === 0) return <span className={styles.faded}>0</span>;
    const st = STATUS_STYLES[field] || {};
    return (
        <span className={styles.badge} style={{ backgroundColor: st.bg, color: st.color }}>
            {v}
        </span>
    );
};

const COLUMNS = [
    { key: 'asignado', label: 'Asignado' },
    { key: 'enProceso', label: 'En Proceso' },
    { key: 'pendienteInfo', label: 'Pend. Info' },
    { key: 'escalado', label: 'Escalado' },
    { key: 'solCancelacion', label: 'Sol. Cancel.' },
    { key: 'finalizado', label: 'Finalizado' },
    { key: 'cancelado', label: 'Cancelado' },
];

const columns = [
    {
        name: 'USUARIO',
        selector: row => row.usuario,
        sortable: true,
        minWidth: '140px',
        cell: row => (
            <div className={styles.userCell}>
                <span className={styles.userName}>{row.usuario}</span>
            </div>
        ),
    },
    ...COLUMNS.map(col => ({
        name: col.label,
        selector: row => parseInt(row[col.key]) || 0,
        sortable: true,
        center: true,
        cell: row => <NumCell value={row[col.key]} field={col.key} />,
    })),
];

const EmptyState = () => (
    <div className={styles.emptyState}>
        <p>No hay casos pendientes en este momento.</p>
    </div>
);

const TablesCases = ({ data }) => (
    <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
            <div>
                <h3 className={styles.title}>Casos por Usuario</h3>
                <p className={styles.subtitle}>Tickets asignados del estado 4 al 10 por técnico</p>
            </div>
        </div>
        <div className={styles.tableWrapper}>
            <DataTable
                columns={columns}
                data={data}
                customStyles={customStyles}
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                paginationComponentOptions={paginationOptions}
                noDataComponent={<EmptyState />}
            />
        </div>
    </div>
);

export default TablesCases;