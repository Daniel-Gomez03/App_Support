// ============================================
// COMPONENT: PENDING CASES TABLE (Dashboard)
// Tabla horizontal que muestra el conteo de
// tickets agrupados por cada estado del sistema.
// Recibe un array de un único objeto con las
// claves de estado como propiedades numéricas.
//
// CONSTANTES (fuera del árbol):
//   customStyles  — estilos inline para react-data-table
//   STATUS_STYLES — map estado → { bg, color } del badge
//   COLUMNS       — definición de columnas (key + label)
//   columns       — config final para DataTable; derivada
//                   de COLUMNS + NumCell (sin deps de props)
//
// NumCell: celda que renderiza 0 con estilo
//   atenuado (.faded) o un badge coloreado para
//   valores > 0. Acepta string '0' y number 0.
// ============================================

import React from "react";
import styles from './PendingTables.module.less';
import DataTable from 'react-data-table-component';

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

const STATUS_STYLES = {
    nuevo: { bg: '#eff6ff', color: '#1d4ed8' },
    revisionGarantia: { bg: '#f0fdf4', color: '#15803d' },
    porAsignar: { bg: '#faf5ff', color: '#7e22ce' },
    asignado: { bg: '#ecfdf5', color: '#059669' },
    enProceso: { bg: '#fff7ed', color: '#c2410c' },
    pendienteInfo: { bg: '#fffbeb', color: '#b45309' },
    escalado: { bg: '#fef2f2', color: '#b91c1c' },
    solCancelacion: { bg: '#fdf4ff', color: '#a21caf' },
    finalizado: { bg: '#f0fdf4', color: '#166534' },
    cancelado: { bg: '#f9fafb', color: '#6b7280' },
};

const NumCell = ({ value, field }) => {
    const st = STATUS_STYLES[field] || {};
    if (value === 0 || value === '0') {
        return <span className={styles.faded}>0</span>;
    }
    return (
        <span
            className={styles.badge}
            style={{ backgroundColor: st.bg, color: st.color }}
        >
            {value}
        </span>
    );
};

const COLUMNS = [
    { key: 'nuevo', label: 'Nuevo' },
    { key: 'revisionGarantia', label: 'Rev. Garantía' },
    { key: 'porAsignar', label: 'Por Asignar' },
    { key: 'asignado', label: 'Asignado' },
    { key: 'enProceso', label: 'En Proceso' },
    { key: 'pendienteInfo', label: 'Pend. Info' },
    { key: 'escalado', label: 'Escalado' },
    { key: 'solCancelacion', label: 'Sol. Cancel.' },
    { key: 'finalizado', label: 'Finalizado' },
    { key: 'cancelado', label: 'Cancelado' },
];

const columns = COLUMNS.map(col => ({
    name: col.label,
    selector: row => row[col.key] ?? 0,
    center: true,
    cell: row => <NumCell value={row[col.key] ?? 0} field={col.key} />,
}));

const EmptyState = () => (
    <div className={styles.emptyState}>
        <p>No hay datos disponibles.</p>
    </div>
);

const PendingCasesTable = ({ data }) => (
    <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
            <div>
                <h3 className={styles.title}>Casos Pendientes</h3>
                <p className={styles.subtitle}>Distribución de tickets por estado en el tablero</p>
            </div>
        </div>
        <div className={styles.tableWrapper}>
            <DataTable
                columns={columns}
                data={data}
                customStyles={customStyles}
                noDataComponent={<EmptyState />}
            />
        </div>
    </div>
);

export default PendingCasesTable;