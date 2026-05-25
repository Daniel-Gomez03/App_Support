// ============================================
// COMPONENT: HISTORIAL EDIT MODAL
// Modal de edición de tickets en estados finales (4–8).
// Permite reasignar técnicos, cambiar prioridad,
// fecha máxima y observaciones.
//
// FLUJO DE DOS PASOS:
//   1. Formulario (handlePreSubmit) → valida + activa confirmAction
//   2. Confirmación (handleFinalSubmit) → llama updateHistorialTicket
//      y dispara onSuccess con mensaje para el toast del padre
//
// PROPS:
//   ticket    — objeto de ticket con assignedUsers, customer,
//               category, product, productModel, warranty
//   onClose   — cierra sin guardar
//   onSuccess — fn(msg); el padre cierra + muestra toast
//
// DROPDOWN DE TÉCNICOS:
//   availableTechnicians = técnicos activos (estado=1)
//   que aún no están en assignedUsers. Se calcula antes
//   del return para no ejecutar filter() dos veces en el JSX.
//   handleClickOutside cierra el dropdown al hacer clic fuera.
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import styles from './HistorialEditModal.module.less';
import {
    FiX, FiCheckCircle, FiAlertCircle, FiXCircle, FiChevronDown
} from 'react-icons/fi';
import { LuTag, LuBox } from 'react-icons/lu';
import { FaQuestion } from 'react-icons/fa';
import { getUsers } from '../../../services/Userservice';
import { updateHistorialTicket } from '../../../services/Ticketservice';

const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

const HistorialEditModal = ({ ticket, onClose, onSuccess }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        assignedUsers: ticket.assignedUsers?.map(u => u.user_id) ?? [],
        ticket_priority: ticket.ticket_priority || '',
        ticket_due_date: ticket.ticket_due_date ? ticket.ticket_due_date.split('T')[0] : '',
        assignment_remarks: ticket.assignment_remarks || ''
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setTechnicians(data.filter(u => u.estado === 1));
            } catch {
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = e => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        const sanitized = name === 'assignment_remarks' ? value.trimStart() : value;
        setFormData(prev => ({ ...prev, [name]: sanitized }));
    };

    const handleAddUser = user => {
        if (!formData.assignedUsers.includes(user.user_id)) {
            setFormData(prev => ({ ...prev, assignedUsers: [...prev.assignedUsers, user.user_id] }));
        }
        setIsDropdownOpen(false);
    };

    const handleRemoveUser = (id, e) => {
        e.stopPropagation();
        setFormData(prev => ({
            ...prev,
            assignedUsers: prev.assignedUsers.filter(uid => uid !== id)
        }));
    };

    const isFormValid =
        formData.assignedUsers.length > 0 &&
        formData.ticket_priority !== '' &&
        formData.ticket_due_date !== '';

    const handlePreSubmit = e => {
        e.preventDefault();
        if (!isFormValid) return;
        setConfirmAction(true);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            await updateHistorialTicket(ticket.ticket_id, {
                ...formData,
                assignment_remarks: formData.assignment_remarks.trim()
            });
            onSuccess('Los cambios del ticket han sido guardados correctamente.');
        } catch (err) {
            alert('Error al actualizar: ' + err.message);
            setConfirmAction(false);
        } finally {
            setLoading(false);
        }
    };

    const company = ticket.customer?.customer_company || '';
    const clientName = `${ticket.customer?.customer_first_name || ''} ${ticket.customer?.customer_last_name || ''}`.trim();
    const availableTechnicians = technicians.filter(t => !formData.assignedUsers.includes(t.user_id));

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                <div className={styles.topHeader}>
                    <div className={styles.ticketBadge}>
                        <h2>Editar Ticket <span>{formatID(ticket.ticket_id)}</span></h2>
                    </div>
                    <p>Reasigna técnicos, cambia la prioridad o actualiza la fecha máxima.</p>
                    <button className={styles.closeBtn} onClick={onClose} disabled={loading}><FiX /></button>
                </div>

                <div className={styles.mainLayout}>

                    <div className={styles.summaryColumn}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryHeader}>
                                <h3>RESUMEN DEL CASO</h3>
                                <LuBox />
                            </div>
                            <div className={styles.summaryBody}>

                                <div className={styles.clientInfo}>
                                    <span className={styles.miniLabel}>CLIENTE</span>
                                    <h4>{clientName || '—'}</h4>
                                    <p>{company}</p>
                                </div>

                                <div className={styles.tagsRow}>
                                    <span className={`${styles.tagBadge} ${styles.cat}`}>
                                        <LuTag /> {ticket.category?.category_name || 'N/A'}
                                    </span>
                                    <span className={`${styles.tagBadge} ${styles.prod}`}>
                                        <LuBox /> {ticket.product?.product_name || 'N/A'}
                                    </span>
                                    {ticket.productModel?.product_model_name && (
                                        <span className={`${styles.tagBadge} ${styles.mod}`}>
                                            {ticket.productModel.product_model_name}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.serialWarranty}>
                                    <div>
                                        <span className={styles.miniLabel}>NO. DE SERIE</span>
                                        <p>{ticket.ticket_serial_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        {!ticket.warranty ? (
                                            <span className={styles.warrantyLabelError}><FiXCircle /> No encontrada</span>
                                        ) : ticket.warranty.is_expired ? (
                                            <span className={styles.warrantyLabelExpired}><FiAlertCircle /> Vencida</span>
                                        ) : (
                                            <span className={styles.warrantyLabelOk}><FiCheckCircle /> En garantía</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.descriptionSection}>
                                    <span className={styles.miniLabel}>DESCRIPCIÓN</span>
                                    <div className={styles.descBox}>
                                        <p>{ticket.ticket_description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formColumn}>
                        <form onSubmit={handlePreSubmit}>
                            <div className={styles.formHeader}>
                                <h3>Actualizar Asignación</h3>
                                <p>Modifica el equipo, prioridad, fecha o las observaciones</p>
                            </div>

                            <div className={styles.inputGroup} ref={dropdownRef}>
                                <label>Técnicos asignados <span className={styles.required}>*</span></label>
                                <div
                                    className={`${styles.customSelectBox} ${isDropdownOpen ? styles.active : ''} ${confirmAction ? styles.disabled : ''}`}
                                    onClick={() => !confirmAction && setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <div className={styles.tagsContainer}>
                                        {formData.assignedUsers.length === 0 && (
                                            <span className={styles.placeholder}>Selecciona a los Devsupport...</span>
                                        )}
                                        {formData.assignedUsers.map(id => {
                                            const tech = technicians.find(t => t.user_id === id);
                                            return tech ? (
                                                <span key={id} className={styles.chip}>
                                                    {tech.nombre_completo}
                                                    <button
                                                        type="button"
                                                        onClick={e => handleRemoveUser(id, e)}
                                                        disabled={confirmAction}
                                                    >
                                                        <FiX />
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                    <FiChevronDown className={styles.dropdownIcon} />
                                </div>
                                {isDropdownOpen && !confirmAction && (
                                    <ul className={styles.dropdownMenu}>
                                        {availableTechnicians.length === 0 ? (
                                            <li className={styles.emptyOption}>Todos los técnicos han sido seleccionados</li>
                                        ) : (
                                            availableTechnicians.map(t => (
                                                <li key={t.user_id} onClick={() => handleAddUser(t)}>
                                                    {t.nombre_completo}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                )}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <label>Prioridad <span className={styles.required}>*</span></label>
                                    <select
                                        name="ticket_priority"
                                        value={formData.ticket_priority}
                                        onChange={handleChange}
                                        required
                                        disabled={confirmAction}
                                    >
                                        <option value="" disabled hidden>Seleccione la prioridad</option>
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Fecha Máxima <span className={styles.required}>*</span></label>
                                    <input
                                        type="date"
                                        name="ticket_due_date"
                                        value={formData.ticket_due_date}
                                        onChange={handleChange}
                                        required
                                        disabled={confirmAction}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Observaciones</label>
                                <textarea
                                    name="assignment_remarks"
                                    placeholder="Instrucciones o notas para el Devsupport..."
                                    value={formData.assignment_remarks}
                                    onChange={handleChange}
                                    disabled={confirmAction}
                                />
                            </div>

                            {confirmAction ? (
                                <div className={styles.confirmZone}>
                                    <FaQuestion className={styles.questionIcon} />
                                    <span className={styles.warningText}>
                                        ¿Confirmas los cambios en el ticket {formatID(ticket.ticket_id)}?
                                    </span>
                                    <div className={styles.confirmBtns}>
                                        <button
                                            type="button"
                                            className={styles.cancelBtn}
                                            onClick={() => setConfirmAction(false)}
                                            disabled={loading}
                                        >
                                            No, regresar
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.successBtn}
                                            onClick={handleFinalSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? 'Guardando...' : 'Sí, Confirmar'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.btnSecondary} onClick={onClose}>
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.btnPrimary}
                                        disabled={loading || !isFormValid}
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorialEditModal;