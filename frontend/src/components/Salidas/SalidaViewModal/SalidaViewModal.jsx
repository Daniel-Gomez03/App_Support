// ============================================
// COMPONENT: SALIDA VIEW MODAL
// Modal de solo lectura con el detalle completo de una salida.
//
// PROPS:
//   salida  — objeto salida a visualizar; null → retorna null
//   onClose — fn(); cierra el modal
//
// MÓDULO SCOPE:
//   formatID / formatDate / formatTime — helpers de formato
//   STATUS_MAP — label + clase CSS por salida_status (0/1/2)
//   Avatar     — sub-componente con fallback a inicial cuando la
//                imagen no carga o es 'default.jpg'
//
// SECCIONES:
//   Técnico solicitante — Avatar + nombre + cargo
//   Ticket relacionado  — ID formateado + asunto + empresa
//   Destino / Fecha / Hora / Fecha de solicitud — grid 2x2
//   Procesada por       — visible si approvedBy.nombre_completo existe
//   Razón de rechazo    — visible si salida_status === 2 y hay reason
// ============================================

import React, { useState } from 'react';
import styles from './SalidaViewModal.module.less';
import { FiX, FiMapPin, FiCalendar, FiClock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { LuTicket } from 'react-icons/lu';

const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;
const formatDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
const formatTime = (t) => t ? t.slice(0, 5) : '—';

const STATUS_MAP = {
    0: { label: 'Pendiente', cls: styles.pendiente },
    1: { label: 'Aprobada', cls: styles.aprobada },
    2: { label: 'Rechazada', cls: styles.rechazada },
};

const Avatar = ({ src, name, size = 44 }) => {
    const [imgOk, setImgOk] = useState(true);
    const hasImg = src && src !== 'default.jpg' && imgOk;
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
        <div className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {hasImg
                ? <img src={`http://localhost:8000/uploads/profiles/${src}`} alt={name} onError={() => setImgOk(false)} />
                : initial
            }
        </div>
    );
};

const SalidaViewModal = ({ salida, onClose }) => {
    if (!salida) return null;

    const status = STATUS_MAP[salida.salida_status] ?? STATUS_MAP[0];

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.salidaId}>Salida #{salida.salida_id}</span>
                        <span className={`${styles.statusBadge} ${status.cls}`}>{status.label}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                <div className={styles.body}>
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}><FiUser /> Técnico Solicitante</p>
                        <div className={styles.userRow}>
                            <Avatar src={salida.user?.foto} name={salida.user?.nombre_completo} />
                            <div>
                                <p className={styles.userName}>{salida.user?.nombre_completo}</p>
                                <p className={styles.userSub}>{salida.user?.cargo || salida.user?.rol}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <p className={styles.sectionLabel}><LuTicket /> Ticket Relacionado</p>
                        <div className={styles.infoCard}>
                            <span className={styles.ticketId}>{formatID(salida.ticket_id)}</span>
                            <span className={styles.ticketSubject}>{salida.ticket?.ticket_subject}</span>
                            <span className={styles.ticketCompany}>{salida.ticket?.customer?.customer_company}</span>
                        </div>
                    </div>

                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <p className={styles.sectionLabel}><FiMapPin /> Destino</p>
                            <p className={styles.detailValue}>{salida.salida_destination}</p>
                        </div>
                        <div className={styles.detailItem}>
                            <p className={styles.sectionLabel}><FiCalendar /> Fecha</p>
                            <p className={styles.detailValue}>{formatDate(salida.salida_date)}</p>
                        </div>
                        <div className={styles.detailItem}>
                            <p className={styles.sectionLabel}><FiClock /> Hora</p>
                            <p className={styles.detailValue}>{formatTime(salida.salida_time)}</p>
                        </div>
                        <div className={styles.detailItem}>
                            <p className={styles.sectionLabel}><FiCalendar /> Fecha de solicitud</p>
                            <p className={styles.detailValue}>{formatDate(salida.created_at)}</p>
                        </div>
                    </div>

                    {salida.approvedBy?.nombre_completo && (
                        <div className={styles.section}>
                            <p className={styles.sectionLabel}>
                                {salida.salida_status === 1 ? 'Aprobada por' : 'Rechazada por'}
                            </p>
                            <p className={styles.detailValue}>{salida.approvedBy.nombre_completo}</p>
                        </div>
                    )}

                    {salida.salida_status === 2 && salida.rejection_reason && (
                        <div className={styles.rejectionBox}>
                            <p className={styles.rejectionTitle}><FiAlertCircle /> Razón del rechazo</p>
                            <p className={styles.rejectionText}>{salida.rejection_reason}</p>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.closeFooterBtn} onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default SalidaViewModal;