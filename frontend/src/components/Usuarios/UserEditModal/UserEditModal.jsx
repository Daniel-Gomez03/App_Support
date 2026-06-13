// ============================================
// COMPONENT: USER EDIT MODAL
// Edición de usuarios internos y clientes externos con flujo de 2 pasos:
//   1. Formulario — datos según tipo (cliente: datos personales + foto;
//                   interno: rol/cargo/área + tabla de permisos)
//   2. Confirmación — resumen antes de llamar a onSave
//
// PROPS:
//   isOpen    — booleano; si false, retorna null y resetea estado
//   user      — objeto; cliente si tiene customer_id, interno en caso contrario
//   secciones — lista de módulos del sistema (solo relevante para internos)
//   onClose   — fn(); cierra el modal
//   onSave    — fn(id, data); recibe id + FormData (cliente) o plain obj (interno)
//
// ESTADO:
//   formData        — campos editables; población inicial desde user en useEffect
//   permisos        — permisos mezclados (secciones + permisos existentes del usuario)
//   showPermissions — visibilidad del panel de permisos (solo internos)
//   imagePreview    — data-URL o URL de foto de perfil
//   imgError        — true cuando falla la carga de imagen (muestra fallback)
//   isConfirming    — true durante el paso de confirmación
//   isLoading       — bloquea botones durante operaciones async
//   emailStatus     — {message, type} para feedback del reenvío de email
//
// FLUJO DE PERMISOS (internos):
//   handlePermissionToggle — no permite desmarcar "read" si "write" o "edit"
//                            están activos; activar "write"/"edit" activa "read"
//                            automáticamente; Dashboard siempre tiene "read"=1
//
// MÓDULO SCOPE:
//   countryRules        — validación de longitud de teléfono por código de país
//   CUSTOMER_NAME_FIELDS — Set de campos que aceptan solo letras con acentos
// ============================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './UserEditModal.module.less';
import { MdClose, MdExpandMore, MdExpandLess, MdCloudUpload } from 'react-icons/md';
import { LuUserCheck, LuLoaderCircle, LuMailCheck } from "react-icons/lu";
import { IoShieldOutline, IoCloseSharp } from "react-icons/io5";
import { FaCheck, FaQuestion } from "react-icons/fa";
import { sendVerificationEmailAdmin } from '../../../services/Customerservice';
import 'flag-icons/css/flag-icons.min.css';

const countryRules = {
    '+504': { name: 'Honduras', iso: 'hn', min: 8, max: 8 },
    '+505': { name: 'Nicaragua', iso: 'ni', min: 8, max: 8 },
    '+503': { name: 'El Salvador', iso: 'sv', min: 8, max: 8 },
    '+502': { name: 'Guatemala', iso: 'gt', min: 8, max: 8 },
};

const CUSTOMER_NAME_FIELDS = new Set([
    'customer_first_name',
    'customer_second_name',
    'customer_last_name',
    'customer_second_last_name',
]);

const UserEditModal = ({ user, isOpen, secciones, onClose, onSave }) => {
    const fileInputRef = useRef(null);
    const isCustomer = user && user.customer_id !== undefined;

    const [formData, setFormData] = useState({
        customer_first_name: '',
        customer_second_name: '',
        customer_last_name: '',
        customer_second_last_name: '',
        customer_email: '',
        customer_phone: '',
        customer_country_code: '+504',
        customer_company: '',
        rol: '',
        cargo: '',
        area: ''
    });

    const [permisos, setPermisos] = useState([]);
    const [showPermissions, setShowPermissions] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState({ message: '', type: '' });

    useEffect(() => {
        if (user && isOpen) {
            setImgError(false);
            if (isCustomer) {
                setFormData({
                    customer_first_name: user.customer_first_name ?? '',
                    customer_second_name: user.customer_second_name ?? '',
                    customer_last_name: user.customer_last_name ?? '',
                    customer_second_last_name: user.customer_second_last_name ?? '',
                    customer_email: user.customer_email ?? '',
                    customer_phone: user.customer_phone ?? '',
                    customer_country_code: user.customer_country_code ?? '+504',
                    customer_company: user.customer_company ?? '',
                    customer_image: null
                });
                setImagePreview(user.customer_image);
            } else {
                setFormData({
                    rol: user.rol ?? '',
                    cargo: user.cargo ?? '',
                    area: user.area ?? ''
                });
                setImagePreview(user.foto);

                if (secciones) {
                    const mergedPermissions = secciones.map(sec => {
                        const existingPerm = user.Permissions?.find(p => p.module_id === sec.module_id);
                        return existingPerm
                            ? { ...existingPerm, module_name: sec.module_name }
                            : {
                                module_id: sec.module_id,
                                module_name: sec.module_name,
                                permissions_read: sec.module_name === 'Dashboard' ? 1 : 0,
                                permissions_write: 0,
                                permissions_edit: 0
                            };
                    });
                    setPermisos(mergedPermissions);
                }
            }
        }

        if (!isOpen) {
            setShowPermissions(false);
            setIsConfirming(false);
            setIsLoading(false);
            setImagePreview(null);
            setImgError(false);
            setEmailStatus({ message: '', type: '' });
        }
    }, [user, isOpen, secciones, isCustomer]);

    const isValid = useMemo(() => {
        if (!isCustomer) return formData.rol && formData.cargo && formData.area;

        const {
            customer_first_name = '',
            customer_last_name = '',
            customer_email = '',
            customer_phone = '',
            customer_country_code = '+504'
        } = formData;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const rules = countryRules[customer_country_code] ?? countryRules['+504'];

        return (
            customer_first_name.length >= 3 &&
            customer_last_name.length >= 3 &&
            emailRegex.test(customer_email) &&
            customer_phone.length === rules.max
        );
    }, [formData, isCustomer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value.startsWith(' ')) return;
        let filteredValue = value;

        if (isCustomer) {
            if (CUSTOMER_NAME_FIELDS.has(name)) filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
            if (name === 'customer_email') filteredValue = value.replace(/\s+/g, '');
            if (name === 'customer_phone') {
                filteredValue = value.replace(/[^0-9]/g, '');
                const maxAllowed = countryRules[formData.customer_country_code]?.max || 8;
                if (filteredValue.length > maxAllowed) return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: filteredValue }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImgError(false);
            setFormData(prev => ({ ...prev, customer_image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleResendEmail = async () => {
        setIsLoading(true);
        try {
            const res = await sendVerificationEmailAdmin(user.customer_id);
            setEmailStatus({ message: res.message, type: 'success' });
        } catch (err) {
            setEmailStatus({ message: err.message || 'Error al enviar email', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionToggle = (moduleId, field) => {
        setPermisos(prev => prev.map(p => {
            if (p.module_id !== moduleId) return p;
            if (p.module_name === 'Dashboard' && field === 'permissions_read') return p;

            const newState = { ...p };
            const isCurrentlyActive = p[field] === 1;
            const newValue = isCurrentlyActive ? 0 : 1;

            if (field === 'permissions_read') {
                if (isCurrentlyActive && (p.permissions_write === 1 || p.permissions_edit === 1)) return p;
                newState.permissions_read = newValue;
            } else {
                newState[field] = newValue;
                if (newValue === 1) newState.permissions_read = 1;
            }
            return newState;
        }));
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;
        setIsConfirming(true);
    };

    const handleFinalSave = async () => {
        setIsLoading(true);
        const id = isCustomer ? user.customer_id : user.user_id;
        let dataToSave;

        if (isCustomer) {
            dataToSave = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    dataToSave.append(key, formData[key]);
                }
            });
        } else {
            dataToSave = { ...formData, permisos: permisos };
        }

        try {
            await onSave(id, dataToSave);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsConfirming(false);
        }
    };

    if (!isOpen || !user) return null;

    const currentRules = countryRules[formData.customer_country_code] ?? countryRules['+504'];

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <LuUserCheck className={styles.headerIcon} />
                        <h2>{isConfirming ? "Confirmar Cambios" : isCustomer ? "Editar Cliente" : "Acceso Interno"}</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} type="button" disabled={isLoading}>
                        <MdClose />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {!isConfirming ? (
                        <>
                            <div className={styles.userInfoCard}>
                                <div className={`${styles.avatarWrapper} ${isCustomer ? styles.editableAvatar : ''}`}
                                    onClick={() => isCustomer && fileInputRef.current.click()}>
                                    {imagePreview && !imgError ? (
                                        <img src={imagePreview} alt="Perfil" className={styles.avatar} onError={() => setImgError(true)} />
                                    ) : (
                                        <div className={styles.avatarFallback}>
                                            {isCustomer
                                                ? (user.customer_first_name?.charAt(0) || 'U').toUpperCase()
                                                : (user.nombre_completo?.charAt(0) || 'U').toUpperCase()}
                                        </div>
                                    )}
                                    {isCustomer && <div className={styles.avatarOverlay}><MdCloudUpload /></div>}
                                </div>
                                <div className={styles.userDetails}>
                                    <h3>{isCustomer ? `${user.customer_first_name} ${user.customer_last_name}` : user.nombre_completo}</h3>
                                    <p>{isCustomer ? user.customer_email : user.correo}</p>
                                    {isCustomer && (
                                        <div className={styles.customerBadges}>
                                            <span className={`${styles.verifyBadge} ${user.email_verified ? styles.active : ''}`}>
                                                {user.email_verified ? "Email Verificado" : "Email Pendiente"}
                                            </span>
                                            {!user.email_verified && (
                                                <button type="button" onClick={handleResendEmail} className={styles.resendBtn} disabled={isLoading}>
                                                    <LuMailCheck /> Reenviar Verificación
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {emailStatus.message && (
                                <div className={`${styles.alert} ${styles[emailStatus.type]}`}>{emailStatus.message}</div>
                            )}

                            <form onSubmit={handlePreSubmit} className={styles.form}>
                                {isCustomer ? (
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Primer Nombre *</label>
                                            <input type="text" name="customer_first_name" value={formData.customer_first_name || ''} onChange={handleChange} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Segundo Nombre</label>
                                            <input type="text" name="customer_second_name" value={formData.customer_second_name || ''} onChange={handleChange} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Primer Apellido *</label>
                                            <input type="text" name="customer_last_name" value={formData.customer_last_name || ''} onChange={handleChange} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Segundo Apellido</label>
                                            <input type="text" name="customer_second_last_name" value={formData.customer_second_last_name || ''} onChange={handleChange} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Correo Electrónico *</label>
                                            <input type="email" name="customer_email" value={formData.customer_email || ''} onChange={handleChange} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Empresa *</label>
                                            <input type="text" name="customer_company" value={formData.customer_company || ''} onChange={handleChange} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Teléfono * ({currentRules.max} dígitos)</label>
                                            <div className={styles.phoneInputContainer}>
                                                <div className={styles.flagSelector}>
                                                    <span className={`fi fi-${currentRules.iso} ${styles.flagIcon}`}></span>
                                                    <select name="customer_country_code" value={formData.customer_country_code || '+504'} onChange={handleChange} className={styles.hiddenSelect}>
                                                        {Object.keys(countryRules).map(code => (
                                                            <option key={code} value={code}>{countryRules[code].name} ({code})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <input type="text" name="customer_phone" value={formData.customer_phone || ''} onChange={handleChange} required placeholder="00000000" />
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                                    </div>
                                ) : (
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Rol de Sistema *</label>
                                            <select name="rol" value={formData.rol || ''} onChange={handleChange} required>
                                                <option value="" disabled>Seleccione un rol</option>
                                                <option value="Admin">Admin</option>
                                                <option value="DevSupport">DevSupport</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Cargo en la Empresa *</label>
                                            <select name="cargo" value={formData.cargo || ''} onChange={handleChange} required>
                                                <option value="" disabled>Seleccione un cargo</option>
                                                <option value="Gerente de TI">Gerente de TI</option>
                                                <option value="Desarrollador">Desarrollador</option>
                                                <option value="UI/UX">UI/UX</option>
                                                <option value="Técnico">Técnico</option>
                                                <option value="QA">QA</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Área *</label>
                                            <select name="area" value={formData.area || ''} onChange={handleChange} required>
                                                <option value="" disabled>Seleccione un área</option>
                                                <option value="Soporte Técnico">Soporte Técnico</option>
                                                <option value="Desarrollo">Desarrollo</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {!isCustomer && (
                                    <div className={styles.permissionsDropdown}>
                                        <div className={styles.dropdownHeader} onClick={() => setShowPermissions(!showPermissions)}>
                                            <div className={styles.headerInfo}>
                                                <IoShieldOutline className={styles.shieldIcon} />
                                                <h3>Permisos de Acceso</h3>
                                            </div>
                                            {showPermissions ? <MdExpandLess /> : <MdExpandMore />}
                                        </div>
                                        {showPermissions && (
                                            <div className={styles.tableWrapper}>
                                                <table className={styles.permissionsTable}>
                                                    <thead>
                                                        <tr>
                                                            <th>MÓDULO</th>
                                                            <th>LEER</th>
                                                            <th>ESCRIBIR</th>
                                                            <th>EDITAR</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {permisos.map((perm) => (
                                                            <tr key={perm.module_id}>
                                                                <td className={styles.moduleNameCell}>{perm.module_name}</td>
                                                                {['permissions_read', 'permissions_write', 'permissions_edit'].map(field => (
                                                                    <td key={field}>
                                                                        <div className={styles.checkboxWrapper}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={perm[field] === 1}
                                                                                onChange={() => handlePermissionToggle(perm.module_id, field)}
                                                                                disabled={field === 'permissions_read' && perm.module_name === 'Dashboard'}
                                                                            />
                                                                            <div className={`${styles.customCheckbox} ${perm[field] === 1 ? styles.active : ''}`}>
                                                                                {perm[field] === 1 ? <FaCheck /> : <IoCloseSharp />}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.modalActions}>
                                    <button type="submit" className={styles.saveBtn} disabled={!isValid}>Guardar Cambios</button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className={styles.confirmationWrapper}>
                            <div className={styles.iconCircle}><FaQuestion /></div>
                            <h3>¿Aplicar cambios?</h3>
                            <p>Se actualizarán los datos de <strong>{isCustomer ? `${formData.customer_first_name} ${formData.customer_last_name}` : user.nombre_completo}</strong>.</p>
                            <div className={styles.confirmButtons}>
                                <button type="button" className={styles.btnSecondary} onClick={() => setIsConfirming(false)} disabled={isLoading}>Regresar</button>
                                <button type="button" className={styles.btnPrimary} onClick={handleFinalSave} disabled={isLoading}>
                                    {isLoading ? <LuLoaderCircle className={styles.spin} /> : "Sí, actualizar"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserEditModal;