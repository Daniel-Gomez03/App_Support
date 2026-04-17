import React from 'react';
import DataTable from 'react-data-table-component';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { FiEdit, FiEye } from 'react-icons/fi';
import { TbPointFilled } from "react-icons/tb";
import { LuMailCheck, LuMailWarning } from "react-icons/lu";
import styles from './UsersTable.module.less';

const UsersTable = ({ data, onEdit, onView, onToggleStatus, canEdit, isCustomerTable }) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return localDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const columns = [
        {
            name: 'ID',
            selector: row => isCustomerTable ? Number(row.customer_id) : Number(row.user_id),
            sortable: true,
            width: '80px',
        },
        {
            name: 'Nombre Completo',
            cell: row => {
                const name = isCustomerTable ? row.full_name : row.nombre_completo;
                const foto = isCustomerTable ? row.customer_image : row.foto;
                return (
                    <div className={styles.userProfile}>
                        <div className={styles.avatarContainer}>
                            {foto ? (
                                <img
                                    src={foto}
                                    alt={name}
                                    className={styles.avatar}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={styles.avatarFallback} style={{ display: !foto ? 'flex' : 'none' }}>
                                {name?.charAt(0)}
                            </div>
                        </div>
                        <span className={styles.userName}>{name}</span>
                    </div>
                );
            },
            sortable: true,
            minWidth: '220px',
        },
        ...(!isCustomerTable ? [
            { name: 'Rol', selector: row => row.rol || 'Sin asignar', sortable: true },
            { name: 'Cargo', selector: row => row.cargo || 'Sin asignar', sortable: true },
            { name: 'Área', selector: row => row.area || 'Sin asignar', sortable: true },
        ] : [
            {
                name: 'Email / Verificación',
                cell: row => (
                    <div className={styles.emailContainer}>
                        <span className={styles.emailText}>{row.customer_email}</span>
                        {Number(row.email_verified) === 1 ? (
                            <LuMailCheck className={styles.verifiedIcon} title="Email Verificado" />
                        ) : (
                            <LuMailWarning className={styles.pendingIcon} title="Verificación Pendiente" />
                        )}
                    </div>
                ),
                sortable: true,
                minWidth: '220px'
            },
            { name: 'Teléfono', selector: row => row.full_phone, sortable: true, width: '150px' },
            { name: 'Empresa', selector: row => row.customer_company, sortable: true },
            {
                name: 'Tipo Reg.',
                selector: row => row.customer_registration_type?.toUpperCase() || 'N/A',
                sortable: true,
                width: '110px'
            },
            {
                name: 'Referencia',
                selector: row => row.customer_registration_value || 'N/A',
                sortable: true,
                minWidth: '150px'
            },
        ]),
        {
            name: isCustomerTable ? 'Fecha Registro' : 'Fecha Ingreso',
            selector: row => isCustomerTable ? row.created_at : row.fecha_ingreso_soporte,
            sortable: true,
            width: '160px',
            format: row => formatDate(isCustomerTable ? row.created_at : row.fecha_ingreso_soporte)
        },
        {
            name: 'Estado',
            cell: row => {
                const isActive = isCustomerTable
                    ? Number(row.customer_status) === 1
                    : Number(row.estado) === 1;

                return (
                    <span className={isActive ? styles.statusActive : styles.statusInactive}>
                        <TbPointFilled className={styles.statusDot} />
                        {isActive ? "Activo" : "Inactivo"}
                    </span>
                );
            },
            sortable: true,
            width: '120px',
        },
        {
            name: 'Acciones',
            cell: row => {
                const isActive = isCustomerTable
                    ? Number(row.customer_status) === 1
                    : Number(row.estado) === 1;

                return (
                    <div className={styles.actions}>
                        <button onClick={() => onView(row)} className={styles.iconBtn} title="Ver detalles">
                            <FiEye />
                        </button>
                        {canEdit && (
                            <>
                                <button onClick={() => onEdit(row)} className={styles.iconBtn} title="Editar">
                                    <FiEdit />
                                </button>
                                <div className={styles.toggleContainer} onClick={() => onToggleStatus(row)}>
                                    <input
                                        type="checkbox"
                                        className={styles.toggle}
                                        checked={isActive}
                                        readOnly
                                    />
                                    <label className={styles.toggleLabel}></label>
                                </div>
                            </>
                        )}
                    </div>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px',
        }
    ];

    const customStyles = {
        headCells: {
            style: {
                fontWeight: '600',
                color: '#666',
                fontSize: '13px',
                borderBottom: '1px solid #eee',
                backgroundColor: '#f9f9f9'
            },
        },
        cells: {
            style: {
                fontSize: '13px',
                color: '#333',
                padding: '12px 16px',
            },
        },
    };

    return (
        <div className={styles.tableWrapper}>
            <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
                <DataTable
                    key={isCustomerTable ? 'table-customers' : 'table-internos'}
                    columns={columns}
                    data={data}
                    pagination
                    customStyles={customStyles}
                    highlightOnHover
                    noDataComponent={
                        <div className={styles.noData}>
                            {isCustomerTable ? "No hay clientes registrados." : "No hay usuarios internos registrados."}
                        </div>
                    }
                />
            </StyleSheetManager>
        </div>
    );
};

export default UsersTable;