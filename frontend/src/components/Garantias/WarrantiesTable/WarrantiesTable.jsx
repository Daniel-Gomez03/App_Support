// ============================================
// COMPONENT: WARRANTIES TABLE (Garantías)
// Tabla principal de garantías con paginación.
//
// PROPS:
//   data    — array de garantías
//   onEdit  — fn(row); abre el modal de edición
//   canEdit — muestra el botón de edición por fila
//
// Columnas: No. de Serie, No. Factura, Fecha Compra,
//   Vencimiento, Vigencia/Estado, Acciones.
//
// rawDate: normaliza fechas ISO (con 'T' o espacio
//   como separador) tomando solo la parte YYYY-MM-DD.
//
// StyleSheetManager + isPropValid: suprime warnings de
//   styled-components por props no válidas de HTML que
//   genera react-data-table-component internamente.
// ============================================

import React from 'react';
import DataTable from 'react-data-table-component';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { FiEdit } from 'react-icons/fi';
import { TbPointFilled } from "react-icons/tb";
import styles from './WarrantiesTable.module.less';

const rawDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('T')[0].split(' ')[0];
};

const customStyles = {
    headCells: {
        style: {
            fontWeight: '600',
            color: '#666',
            fontSize: '13px',
            borderBottom: '1px solid #eee',
            textTransform: 'uppercase',
        },
    },
    cells: {
        style: {
            fontSize: '14px',
            color: '#333',
            padding: '12px 16px',
        },
    },
};

const WarrantiesTable = ({ data, onEdit, canEdit }) => {

    const columns = [
        {
            name: 'No. de Serie',
            selector: row => row.warranty_serial_number,
            sortable: true,
            cell: row => (
                <span className={styles.serialText}>{row.warranty_serial_number}</span>
            ),
            minWidth: '200px',
        },
        {
            name: 'No. Factura',
            selector: row => row.warranty_invoice_number,
            sortable: true,
            cell: row => (
                <span className={styles.invoiceBadge}>{row.warranty_invoice_number}</span>
            ),
        },
        {
            name: 'Fecha Compra',
            selector: row => row.warranty_purchase_date,
            sortable: true,
            cell: row => <span>{rawDate(row.warranty_purchase_date)}</span>
        },
        {
            name: 'Vencimiento',
            selector: row => row.warranty_expiry_date,
            sortable: true,
            cell: row => (
                <div className={styles.expiryCell}>
                    <span className={row.is_expired ? styles.dateExpired : styles.dateValid}>
                        {rawDate(row.warranty_expiry_date)}
                    </span>
                </div>
            )
        },
        {
            name: 'Vigencia / Estado',
            cell: row => (
                <div className={styles.statusWrapper}>
                    <span className={row.is_expired ? styles.badgeExpired : styles.badgeValid}>
                        <TbPointFilled className={styles.statusDot} />
                        {row.is_expired ? "Expirada / Inactiva" : "Vigente / Activa"}
                    </span>
                </div>
            ),
            sortable: true,
            minWidth: '180px',
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className={styles.actions}>
                    {canEdit && (
                        <button
                            onClick={() => onEdit(row)}
                            className={styles.iconBtn}
                            title="Editar información"
                        >
                            <FiEdit />
                        </button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '100px',
        }
    ];

    return (
        <div className={styles.tableWrapper}>
            <StyleSheetManager shouldForwardProp={isPropValid}>
                <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    customStyles={customStyles}
                    highlightOnHover
                    noDataComponent={<div className={styles.noData}>No hay registros de garantías para mostrar.</div>}
                />
            </StyleSheetManager>
        </div>
    );
};

export default WarrantiesTable;