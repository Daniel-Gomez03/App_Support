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
            fontSize: '12px',
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
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
};

const paginationOptions = {
    rowsPerPageText: 'Filas por página',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
};

const EmptyState = () => (
    <div className={styles.emptyState}>
        <p>No hay casos pendientes en este momento.</p>
    </div>
);

const TablesCases = ({ data }) => {

    const columns = [
        {
            name: 'USUARIOS',
            selector: row => row.usuario,
            sortable: true,
            $grow: 2,
            cell: row => (
                <div className={styles.userCell}>
                    <span className={styles.userName}>{row.usuario}</span>
                </div>
            ),
        },
        {
            name: 'NUEVO',
            selector: row => row.nuevo,
            $center: "true",
            cell: row => (
                <span className={row.nuevo === 0 ? styles.faded : ''}>{row.nuevo}</span>
            )
        },
        {
            name: 'EN PROCESO',
            selector: row => row.enProceso,
            $center: "true",
            cell: row => <span className={row.enProceso === 0 ? styles.faded : ''}>{row.enProceso}</span>
        },
        {
            name: 'PENDIENTE INFO',
            selector: row => row.pendienteInfo,
            $center: "true",
            cell: row => <span className={row.pendienteInfo === 0 ? styles.faded : ''}>{row.pendienteInfo}</span>
        },
        {
            name: 'ESCALADO',
            selector: row => row.escalado,
            $center: "true",
            cell: row => <span className={row.escalado === 0 ? styles.faded : ''}>{row.escalado}</span>
        },
        {
            name: 'RESUELTO',
            selector: row => row.resuelto,
            $center: "true",
            cell: row => <span className={styles.boldNumber}>{row.resuelto}</span>
        },
    ];

    return (
        <div className={styles.tableCard}>

            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.title}>Casos Pendientes de Usuarios</h3>
                    <p className={styles.subtitle}>Pendientes por estatus/ubicación en el tablero</p>
                </div>
            </div>

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
    );
};

export default TablesCases;