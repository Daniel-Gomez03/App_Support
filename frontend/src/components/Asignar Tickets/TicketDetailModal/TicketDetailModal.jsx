import React, { useState } from 'react';
import styles from './TicketDetailModal.module.less';
import { FiX, FiCheckCircle, FiAlertCircle, FiXCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi"; // <-- Añadí ChevronLeft y Right
import { LuTag, LuBox, LuUser, LuMail, LuFileText } from "react-icons/lu";
import { FaQuestion } from "react-icons/fa";
import "flag-icons/css/flag-icons.min.css";
import { updateTicketStatus } from '../../../services/Ticketservice';

const countryRules = {
    '+504': { iso: 'hn' },
    '+505': { iso: 'ni' },
    '+503': { iso: 'sv' },
    '+502': { iso: 'gt' },
};

const TicketDetailModal = ({ ticket, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedImg, setSelectedImg] = useState(null);

    const customerName = `${ticket.customer?.customer_first_name || ''} ${ticket.customer?.customer_last_name || ''}`.trim();
    const documentType = ticket.customer?.customer_registration_type || 'Documento';
    const documentValue = ticket.customer?.customer_registration_value || 'N/A';
    const currentFlagIso = countryRules[ticket.customer?.customer_country_code]?.iso || 'hn';

    const handleAdvance = async () => {
        setLoading(true);
        try {
            await updateTicketStatus(ticket.ticket_id, 3);
            onSuccess("¡Excelente! El ticket ha sido movido al Backlog para su asignación.");
            onClose();
        } catch (error) {
            alert("Error al avanzar el ticket: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForceClose = async () => {
        setLoading(true);
        try {
            await updateTicketStatus(ticket.ticket_id, 11);
            onSuccess("El ticket ha sido cancelado y cerrado correctamente.");
            onClose();
        } catch (error) {
            alert("Error al cerrar el ticket: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                <div className={styles.modalHeader}>
                    <div className={styles.headerLeft}>
                        <h2>RESUMEN DEL CASO <LuBox className={styles.headerIcon} /></h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
                        <FiX />
                    </button>
                </div>

                <div className={styles.modalBody}>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</h4>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Nombre del Cliente</span>
                                <span className={styles.value}><LuUser /> {customerName}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Empresa</span>
                                <span className={styles.value}>{ticket.customer?.customer_company}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>{documentType?.toUpperCase()}</span>
                                <span className={styles.value}><LuFileText /> {documentValue}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Correo Electrónico</span>
                                <span className={styles.value}><LuMail /> {ticket.customer?.customer_email}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Teléfono</span>
                                <span className={styles.value}>
                                    <span className={`fi fi-${currentFlagIso} ${styles.flagIcon}`}></span>
                                    {ticket.customer?.customer_country_code} {ticket.customer?.customer_phone}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>DETALLES DEL EQUIPO</h4>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Categoría</span>
                                <span className={`${styles.badge} ${styles.categoryBadge}`}>
                                    <LuTag /> {ticket.category?.category_name}
                                </span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Producto</span>
                                <span className={`${styles.badge} ${styles.productBadge}`}>
                                    <LuBox /> {ticket.product?.product_name}
                                </span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Modelo</span>
                                <span className={`${styles.badge} ${styles.modelBadge}`}>
                                    {ticket.productModel?.product_model_name || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>No. de Serie / Garantía</span>
                                <div className={styles.serialGroup}>
                                    <span className={styles.value}>{ticket.ticket_serial_number || 'Sin Serie'}</span>
                                    {!ticket.warranty ? (
                                        <span className={`${styles.badge} ${styles.warrantyWarnBadge}`}>
                                            <FiXCircle /> No Encontrada
                                        </span>
                                    ) : ticket.warranty.is_expired ? (
                                        <span className={`${styles.badge} ${styles.warrantyExpiredBadge}`}>
                                            <FiAlertCircle /> Vencida ({ticket.warranty.warranty_expiry_date})
                                        </span>
                                    ) : (
                                        <span className={`${styles.badge} ${styles.warrantyOkBadge}`}>
                                            <FiCheckCircle /> Vigente
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>PROBLEMÁTICA</h4>
                        <div className={styles.problemBox}>
                            <h5 className={styles.problemSubject}>{ticket.ticket_subject}</h5>
                            <p className={styles.problemDescription}>{ticket.ticket_description}</p>
                        </div>
                    </div>

                    {ticket.evidences?.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>EVIDENCIA ADJUNTA</h4>
                            <div className={styles.miniGallery}>
                                <FiChevronLeft className={styles.navIcon} />
                                <div className={styles.imgWrapper}>
                                    {ticket.evidences.slice(0, 3).map(ev => (
                                        <img
                                            key={ev.ticket_evidence_id}
                                            src={ev.ticket_evidence_path}
                                            alt="Evidence"
                                            className={styles.evidenceImage}
                                            onClick={() => setSelectedImg(ev.ticket_evidence_path)} // <-- Abre el visor en grande
                                        />
                                    ))}
                                </div>
                                <FiChevronRight className={styles.navIcon} />
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    {confirmAction === 'advance' && (
                        <div className={styles.confirmZone}>
                            <FaQuestion className={styles.questionIcon} />
                            <span className={styles.warningText}>¿Enviar este ticket al Backlog para asignación?</span>
                            <div className={styles.confirmBtns}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)} disabled={loading}>No, regresar</button>
                                <button className={styles.successBtn} onClick={handleAdvance} disabled={loading}>
                                    {loading ? "Procesando..." : "Sí, Avanzar"}
                                </button>
                            </div>
                        </div>
                    )}

                    {confirmAction === 'close' && (
                        <div className={styles.confirmZone}>
                            <FiAlertCircle className={styles.dangerIcon} />
                            <span className={styles.warningText}>¿Seguro que deseas cancelar y cerrar este ticket?</span>
                            <div className={styles.confirmBtns}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)} disabled={loading}>No, regresar</button>
                                <button className={styles.dangerBtn} onClick={handleForceClose} disabled={loading}>
                                    {loading ? "Cerrando..." : "Sí, Cancelar Ticket"}
                                </button>
                            </div>
                        </div>
                    )}

                    {!confirmAction && (
                        <div className={styles.actionZone}>
                            <button className={styles.dangerOutlineBtn} onClick={() => setConfirmAction('close')} disabled={loading}>
                                Forzar Cierre
                            </button>
                            <button className={styles.successBtn} onClick={() => setConfirmAction('advance')} disabled={loading}>
                                Avanzar a Backlog
                            </button>
                        </div>
                    )}
                </div>

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

export default TicketDetailModal;