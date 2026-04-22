import React, { useState, useEffect, useRef } from 'react';
import styles from './AssignTicketModal.module.less';
import { FiX, FiCheckCircle, FiAlertCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiChevronDown } from "react-icons/fi";
import { LuTag, LuBox, LuUser, LuCalendar, LuMessageSquare } from "react-icons/lu";
import { FaQuestion } from "react-icons/fa";
import { getUsers } from '../../../services/Userservice';
import { assignTicket } from '../../../services/Ticketservice';
import "flag-icons/css/flag-icons.min.css";

const AssignTicketModal = ({ ticket, onClose, onSuccess }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado para la doble confirmación ('assign' o null)
    const [confirmAction, setConfirmAction] = useState(null);

    // Estado para el visor de imagen
    const [selectedImg, setSelectedImg] = useState(null);

    // Estados para el Dropdown personalizado
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        user_id: '',
        assignedUsers: [],
        ticket_priority: '', // <-- Cambio: Inicia vacío
        ticket_due_date: '',
        assignment_remarks: ''
    });

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setTechnicians(data.filter(u => u.estado === 1));
            } catch (error) {
                console.error("Error al cargar técnicos:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Evitar que las observaciones empiecen con espacios en blanco o sean puros espacios
        const sanitizedValue = name === 'assignment_remarks' ? value.trimStart() : value;

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    };

    const handleAddUser = (user) => {
        if (!formData.assignedUsers.includes(user.user_id)) {
            const newAssigned = [...formData.assignedUsers, user.user_id];
            setFormData(prev => ({
                ...prev,
                assignedUsers: newAssigned,
                user_id: newAssigned.length === 1 ? user.user_id : prev.user_id
            }));
        }
        setIsDropdownOpen(false);
    };

    const handleRemoveUser = (idToRemove, e) => {
        e.stopPropagation();
        const newAssigned = formData.assignedUsers.filter(id => id !== idToRemove);
        setFormData(prev => ({
            ...prev,
            assignedUsers: newAssigned,
            user_id: newAssigned.length > 0 ? newAssigned[0] : ''
        }));
    };

    // Validación para habilitar el botón principal
    const isFormValid =
        formData.assignedUsers.length > 0 &&
        formData.ticket_priority !== '' &&
        formData.ticket_due_date !== '';

    // Paso 1: Validar el formulario y pedir confirmación
    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
        }
        // Si todo está bien, mostramos la doble confirmación
        setConfirmAction('assign');
    };

    // Paso 2: Ejecutar la asignación real tras confirmar
    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            // Limpiamos los espacios finales de los remarks antes de enviar a la BD
            const finalData = {
                ...formData,
                assignment_remarks: formData.assignment_remarks.trim()
            };

            await assignTicket(ticket.ticket_id, finalData);
            onSuccess(`Ve a Tickets Activos para poder verlo e interactuar con el`);
            onClose();
        } catch (error) {
            alert("Error al asignar: " + error.message);
            setConfirmAction(null); // Ocultar confirmación si hay error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                {/* Header Superior */}
                <div className={styles.topHeader}>
                    <div className={styles.ticketBadge}>
                        <h2>Asignar Ticket <span>T-{ticket.ticket_id}</span></h2>
                    </div>
                    <p>Seleccione el personal y la prioridad del caso.</p>
                    <button className={styles.closeBtn} onClick={onClose} disabled={loading}><FiX /></button>
                </div>

                <div className={styles.mainLayout}>

                    {/* COLUMNA IZQUIERDA: RESUMEN */}
                    <div className={styles.summaryColumn}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryHeader}>
                                <h3>RESUMEN DEL CASO</h3>
                                <LuBox />
                            </div>

                            <div className={styles.summaryBody}>
                                <div className={styles.clientInfo}>
                                    <span className={styles.miniLabel}>CLIENTE</span>
                                    <h4>{ticket.customer?.customer_first_name} {ticket.customer?.customer_last_name}</h4>
                                    <p>{ticket.customer?.customer_company}</p>
                                </div>

                                <div className={styles.tagsRow}>
                                    <span className={`${styles.tagBadge} ${styles.cat}`}>
                                        <LuTag /> {ticket.category?.category_name}
                                    </span>
                                    <span className={`${styles.tagBadge} ${styles.prod}`}>
                                        <LuBox /> {ticket.product?.product_name}
                                    </span>
                                    <span className={`${styles.tagBadge} ${styles.mod}`}>
                                        {ticket.productModel?.product_model_name || 'N/A'}
                                    </span>
                                </div>

                                <div className={styles.serialWarranty}>
                                    <div className={styles.serialItem}>
                                        <span className={styles.miniLabel}>NO. DE SERIE</span>
                                        <p>{ticket.ticket_serial_number || 'N/A'}</p>
                                    </div>
                                    <div className={styles.warrantyItem}>
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

                                {/* Galería Miniatura */}
                                {ticket.evidences?.length > 0 && (
                                    <div className={styles.evidenceSection}>
                                        <span className={styles.miniLabel}>EVIDENCIA ADJUNTA</span>
                                        <div className={styles.miniGallery}>
                                            <FiChevronLeft className={styles.navIcon} />
                                            <div className={styles.imgWrapper}>
                                                {ticket.evidences.slice(0, 3).map(ev => (
                                                    <img
                                                        key={ev.ticket_evidence_id}
                                                        src={ev.ticket_evidence_path}
                                                        alt="Evidence"
                                                        onClick={() => setSelectedImg(ev.ticket_evidence_path)}
                                                    />
                                                ))}
                                            </div>
                                            <FiChevronRight className={styles.navIcon} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO */}
                    <div className={styles.formColumn}>
                        <form onSubmit={handlePreSubmit}>
                            <div className={styles.formHeader}>
                                <h3>Asignar Personal</h3>
                                <p>Seleccione el personal necesario para este ticket</p>
                            </div>

                            <div className={styles.inputGroup} ref={dropdownRef}>
                                <label>Asignar a <span className={styles.required}>*</span></label>

                                <div
                                    className={`${styles.customSelectBox} ${isDropdownOpen ? styles.active : ''} ${confirmAction ? styles.disabled : ''}`}
                                    onClick={() => !confirmAction && setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <div className={styles.tagsContainer}>
                                        {formData.assignedUsers.length === 0 && (
                                            <span className={styles.placeholder}>Selecciona el personal...</span>
                                        )}
                                        {formData.assignedUsers.map(id => {
                                            const tech = technicians.find(t => t.user_id === id);
                                            return tech ? (
                                                <span key={id} className={styles.chip}>
                                                    {tech.nombre_completo}
                                                    <button type="button" onClick={(e) => handleRemoveUser(id, e)} disabled={confirmAction}>
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
                                        {technicians.filter(t => !formData.assignedUsers.includes(t.user_id)).length === 0 ? (
                                            <li className={styles.emptyOption}>Todos los técnicos han sido seleccionados</li>
                                        ) : (
                                            technicians
                                                .filter(tech => !formData.assignedUsers.includes(tech.user_id))
                                                .map(tech => (
                                                    <li key={tech.user_id} onClick={() => handleAddUser(tech)}>
                                                        {tech.nombre_completo}
                                                    </li>
                                                ))
                                        )}
                                    </ul>
                                )}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <label>Prioridad <span className={styles.required}>*</span></label>
                                    <select name="ticket_priority" value={formData.ticket_priority} onChange={handleChange} required disabled={confirmAction}>
                                        <option value="" disabled hidden>Seleccione...</option>
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
                                        min={today}
                                        required
                                        disabled={confirmAction}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Observaciones</label>
                                <textarea
                                    name="assignment_remarks"
                                    placeholder="Agrega instrucciones..."
                                    value={formData.assignment_remarks}
                                    onChange={handleChange}
                                    disabled={confirmAction}
                                />
                            </div>

                            {/* ZONA DE ACCIONES / DOBLE CONFIRMACIÓN */}
                            {confirmAction === 'assign' ? (
                                <div className={styles.confirmZone}>
                                    <FaQuestion className={styles.questionIcon} />
                                    <span className={styles.warningText}>
                                        ¿Estás seguro de asignar este ticket a {formData.assignedUsers.length} técnico(s)?
                                    </span>
                                    <div className={styles.confirmBtns}>
                                        <button type="button" className={styles.cancelBtn} onClick={() => setConfirmAction(null)} disabled={loading}>
                                            No, regresar
                                        </button>
                                        <button type="button" className={styles.successBtn} onClick={handleFinalSubmit} disabled={loading}>
                                            {loading ? "Asignando..." : "Sí, Confirmar"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
                                    <button
                                        type="submit"
                                        className={styles.btnPrimary}
                                        disabled={loading || !isFormValid} /* <-- BLOQUEO ROBUSTO */
                                    >
                                        Asignar Ticket
                                    </button>
                                </div>
                            )}

                        </form>
                    </div>
                </div>

                {/* VISOR DE IMAGEN GRANDE */}
                {selectedImg && (
                    <div className={styles.imageOverlay} onClick={() => setSelectedImg(null)}>
                        <button className={styles.closeLightbox} onClick={() => setSelectedImg(null)}><FiX /></button>
                        <img src={selectedImg} alt="Enlarged" className={styles.largeImage} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default AssignTicketModal;