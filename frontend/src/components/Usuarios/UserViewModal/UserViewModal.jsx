import React, { useState, useEffect } from 'react';
import styles from './UserViewModal.module.less';
import { MdClose, MdExpandMore, MdExpandLess, MdOutlineAlternateEmail, MdPhoneIphone, MdVerified, MdPendingActions } from 'react-icons/md';
import { TbPointFilled } from "react-icons/tb";
import { FaFire, FaGhost, FaCheck, FaBuilding, FaIdCard, FaUserTag, FaCalendarAlt } from "react-icons/fa";
import { IoShieldOutline, IoCloseSharp } from "react-icons/io5";
import { RiLoginCircleLine } from "react-icons/ri";

const UserViewModal = ({ user, isOpen, onClose }) => {
    const [showPermissions, setShowPermissions] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowPermissions(false);
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const isCustomer = user && user.customer_id !== undefined;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const getCustomerFullName = () => {
        const parts = [
            user.customer_first_name,
            user.customer_second_name,
            user.customer_last_name,
            user.customer_second_last_name
        ];
        return parts.filter(part => part && part.trim() !== '').join(' ');
    };

    const displayData = {
        name: isCustomer ? getCustomerFullName() : user.nombre_completo,
        email: isCustomer ? user.customer_email : user.correo,
        photo: isCustomer ? user.customer_image : user.foto,
        id: isCustomer ? user.customer_id : user.user_id,
        phone: isCustomer ? `${user.customer_country_code} ${user.customer_phone}` : null,
        company: isCustomer ? user.customer_company : null,
        status: isCustomer ? user.customer_status : user.estado,
        regType: isCustomer ? (user.customer_registration_type || 'N/A') : null,
        regValue: isCustomer ? (user.customer_registration_value || 'N/A') : null,
        isVerified: isCustomer ? user.email_verified : null,
        created: isCustomer ? user.created_at : user.ultima_conexion
    };

    const activePermissions = !isCustomer ? (user.Permissions?.filter(p =>
        p.permissions_read === 1 || p.permissions_write === 1 || p.permissions_edit === 1
    ) || []) : [];

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <h2>{isCustomer ? "Detalles del Cliente" : "Detalles del Usuario Interno"}</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.userInfoCard}>
                        <div className={styles.avatarWrapper}>
                            {displayData.photo ? (
                                <img
                                    src={displayData.photo}
                                    alt="Perfil"
                                    className={styles.avatar}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div className={styles.avatarFallback} style={{ display: !displayData.photo ? 'flex' : 'none' }}>
                                {displayData.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className={styles.userDetails}>
                            <h3>{displayData.name}</h3>
                            <p><FaIdCard className={styles.labelIcon} /> ID: {displayData.id}</p>
                            <p><MdOutlineAlternateEmail className={styles.labelIcon} /> {displayData.email}</p>
                        </div>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoGroup}>
                            <label>Estado de Cuenta</label>
                            <span className={(displayData.status === 1 || displayData.status === 'active') ? styles.statusActive : styles.statusInactive}>
                                <TbPointFilled /> {(displayData.status === 1 || displayData.status === 'active') ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        {isCustomer ? (
                            <>
                                <div className={styles.infoGroup}>
                                    <label>Empresa</label>
                                    <p className={styles.highlight}><FaBuilding className={styles.inlineIcon} /> {displayData.company || 'Personal / Independiente'}</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <label>Teléfono Movil</label>
                                    <p><MdPhoneIphone className={styles.inlineIcon} /> {displayData.phone || 'No registrado'}</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <label>Tipo de Documento</label>
                                    <p className={styles.highlight}><FaUserTag className={styles.inlineIcon} /> {displayData.regType}</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <label>Número de Registro</label>
                                    <p>{displayData.regValue}</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <label>Verificación de Email</label>
                                    {displayData.isVerified ? (
                                        <p className={styles.statusVerified}><MdVerified className={styles.inlineIcon} /> Verificado</p>
                                    ) : (
                                        <p className={styles.statusPending}><MdPendingActions className={styles.inlineIcon} /> Pendiente de Verificación</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.infoGroup}>
                                    <label>Rol asignado</label>
                                    <p className={user.rol ? styles.highlight : styles.unassigned}>
                                        {user.rol || 'Sin rol'}
                                    </p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <label>Cargo Laboral</label>
                                    <p>{user.cargo || 'Sin cargo'}</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <label>Departamento / Área</label>
                                    <p>{user.area || 'No especificada'}</p>
                                </div>
                            </>
                        )}

                        <div className={styles.infoGroup}>
                            <label>{isCustomer ? "Fecha de Registro" : "Última Conexión"}</label>
                            <p><FaCalendarAlt className={styles.inlineIcon} /> {formatDate(displayData.created)}</p>
                        </div>

                        {!isCustomer && (
                            <div className={styles.infoGroup}>
                                <label>Racha de Actividad</label>
                                {user.racha_actual > 0 ? (
                                    <p className={styles.streakActive}>
                                        <FaFire className={styles.fireIcon} /> {user.racha_actual} días consecutivos
                                    </p>
                                ) : (
                                    <p className={styles.streakLost}>
                                        <FaGhost className={styles.ghostIcon} /> Racha interrumpida ({user.racha_perdida || 0} días)
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {!isCustomer && (
                        <div className={styles.permissionsDropdown}>
                            <div className={styles.dropdownHeader} onClick={() => setShowPermissions(!showPermissions)}>
                                <div className={styles.headerInfo}>
                                    <IoShieldOutline className={styles.shieldIcon} />
                                    <h3>Configuración de Permisos</h3>
                                </div>
                                {showPermissions ? <MdExpandLess className={styles.arrow} /> : <MdExpandMore className={styles.arrow} />}
                            </div>

                            {showPermissions && (
                                <div className={styles.tableContainer}>
                                    <div className={styles.tableWrapper}>
                                        <table className={styles.permissionsTable}>
                                            <thead>
                                                <tr>
                                                    <th>MÓDULO DE SISTEMA</th>
                                                    <th>LECTURA</th>
                                                    <th>ESCRITURA</th>
                                                    <th>EDICIÓN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activePermissions.length > 0 ? (
                                                    activePermissions.map((perm) => (
                                                        <tr key={perm.module_id}>
                                                            <td className={styles.moduleNameCell}>
                                                                <RiLoginCircleLine className={styles.moduleIcon} />
                                                                {perm.Seccion?.module_name || perm.module_name || 'Sin Nombre'}
                                                            </td>
                                                            <td>{perm.permissions_read === 1 ? <FaCheck className={styles.checkIcon} /> : <IoCloseSharp className={styles.crossIcon} />}</td>
                                                            <td>{perm.permissions_write === 1 ? <FaCheck className={styles.checkIcon} /> : <IoCloseSharp className={styles.crossIcon} />}</td>
                                                            <td>{perm.permissions_edit === 1 ? <FaCheck className={styles.checkIcon} /> : <IoCloseSharp className={styles.crossIcon} />}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className={styles.noPermsRow}>No se encontraron permisos activos para este usuario</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeActionBtn} onClick={onClose}>
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserViewModal;