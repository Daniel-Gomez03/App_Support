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
            fontSize: '11px',
            fontWeight: '600',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    rows: {
        style: {
            minHeight: '60px',
            fontSize: '14px',
            color: '#374151',
            borderBottomColor: '#F3F4F6',
        },
    },
};

const EmptyState = () => (
    <div className={styles.emptyState}>
        <p>No hay datos disponibles.</p>
    </div>
);

const PendingCasesTable = ({ data }) => {

    const columns = [
        {
            name: 'NUEVO',
            selector: row => row.nuevo,
            center: true,
            cell: row => <span className={row.nuevo === 0 ? styles.faded : ''}>{row.nuevo}</span>
        },
        {
            name: 'EN PROCESO',
            selector: row => row.enProceso,
            center: true,
            cell: row => <span className={row.enProceso === 0 ? styles.faded : ''}>{row.enProceso}</span>
        },
        {
            name: 'PENDIENTE DE INFORMACIÓN',
            selector: row => row.pendienteInfo,
            center: true,
            $grow: 2, 
            cell: row => <span className={row.pendienteInfo === 0 ? styles.faded : ''}>{row.pendienteInfo}</span>
        },
        {
            name: 'ESCALADO',
            selector: row => row.escalado,
            center: true,
            cell: row => <span className={row.escalado === 0 ? styles.faded : ''}>{row.escalado}</span>
        },
        {
            name: 'RESUELTO',
            selector: row => row.resuelto,
            center: true,
            cell: row => <span className={styles.boldNumber}>{row.resuelto}</span>
        },
    ];

    return (
        <div className={styles.tableCard}>

            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.title}>Casos Pendientes</h3>
                    <p className={styles.subtitle}>Pendientes por estatus/ubicación en el tablero</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                customStyles={customStyles}
                noDataComponent={<EmptyState />}

            />
        </div>
    );
};

export default PendingCasesTable;