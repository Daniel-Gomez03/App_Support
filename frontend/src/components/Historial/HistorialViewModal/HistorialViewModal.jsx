import React, { useEffect, useState, useRef } from 'react';
import styles from './HistorialViewModal.module.less';
import {
    FiX, FiCheckCircle, FiAlertCircle, FiXCircle,
    FiLock, FiPaperclip, FiShield
} from 'react-icons/fi';
import { LuTag, LuBox, LuMessageSquare } from 'react-icons/lu';
import { getTicketComments } from '../../../services/Ticketservice';

const STATUS_MAP = {
    1: 'Nuevo', 2: 'Revisión Garantía', 3: 'Por Asignar',
    4: 'Asignado', 5: 'En Proceso', 6: 'Pendiente Info',
    7: 'Escalado', 8: 'Sol. Cancelación', 9: 'Finalizado', 10: 'Cancelado'
};

const getMediaType = (filePath = '') => {
    const ext = filePath.split('.').pop().toLowerCase().split('?')[0];
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    return 'file';
};

const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

const formatTime = (d) => !d ? '—' : new Date(d).toLocaleString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
});

const HistorialViewModal = ({ ticket, onClose }) => {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null); // { url, type }
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getTicketComments(ticket.ticket_id);
                setComments(Array.isArray(data) ? data : []);
            } catch {
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        };
        load();
    }, [ticket.ticket_id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments.length, loadingComments]);

    const company = ticket.customer?.customer_company || '—';
    const clientName = `${ticket.customer?.customer_first_name || ''} ${ticket.customer?.customer_last_name || ''}`.trim();
    const statusLabel = STATUS_MAP[ticket.ticket_status_id] || 'Desconocido';
    const evidences = ticket.evidences || [];

    return (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent}>

                {/* ── HEADER ── */}
                <div className={styles.topHeader}>
                    <div className={styles.ticketBadge}>
                        <h2>Historial del Ticket <span>{formatID(ticket.ticket_id)}</span></h2>
                    </div>
                    <p>Vista de solo lectura · Estado actual: <strong>{statusLabel}</strong></p>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                {/* ── MAIN ── */}
                <div className={styles.mainLayout}>

                    {/* Panel izquierdo: Resumen del caso */}
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

                                {ticket.ticket_priority && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.miniLabel}>PRIORIDAD</span>
                                        <p>{ticket.ticket_priority}</p>
                                    </div>
                                )}

                                {ticket.ticket_due_date && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.miniLabel}>FECHA MÁXIMA</span>
                                        <p>{new Date(ticket.ticket_due_date).toLocaleDateString('es-ES', {
                                            year: 'numeric', month: '2-digit', day: '2-digit'
                                        })}</p>
                                    </div>
                                )}

                                {ticket.assignedUsers?.length > 0 && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.miniLabel}>TÉCNICOS ASIGNADOS</span>
                                        <div className={styles.techList}>
                                            {ticket.assignedUsers.map(u => (
                                                <span key={u.user_id} className={styles.techChip}>{u.nombre_completo}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.descriptionSection}>
                                    <span className={styles.miniLabel}>DESCRIPCIÓN</span>
                                    <div className={styles.descBox}>
                                        <p>{ticket.ticket_description}</p>
                                    </div>
                                </div>

                                {ticket.assignment_remarks && (
                                    <div className={styles.descriptionSection} style={{ marginTop: 16 }}>
                                        <span className={styles.miniLabel}>OBSERVACIONES</span>
                                        <div className={styles.remarksBox}>
                                            <p>{ticket.assignment_remarks}</p>
                                        </div>
                                    </div>
                                )}

                                {evidences.length > 0 && (
                                    <div className={styles.evidenceSection}>
                                        <span className={styles.miniLabel}>EVIDENCIA ADJUNTA</span>
                                        <div className={styles.evidenceGrid}>
                                            {evidences.map(ev => (
                                                <img
                                                    key={ev.ticket_evidence_id}
                                                    src={ev.ticket_evidence_path}
                                                    alt="Evidencia"
                                                    className={styles.evidenceThumb}
                                                    onClick={() => setSelectedMedia({ url: ev.ticket_evidence_path, type: 'image' })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel derecho: Chat */}
                    <div className={styles.chatColumn}>
                        <div className={styles.chatHeader}>
                            <LuMessageSquare />
                            <h3>HISTORIAL DEL CHAT</h3>
                            <span className={styles.lockedBadge}><FiLock /> Solo lectura</span>
                        </div>

                        <div className={styles.messageList}>
                            {loadingComments ? (
                                <p className={styles.emptyChat}>Cargando mensajes...</p>
                            ) : comments.length === 0 ? (
                                <p className={styles.emptyChat}>No hubo interacción en este ticket.</p>
                            ) : (
                                comments.map(comment => {
                                    const isSystemMsg = comment.comment_text?.startsWith('🔴');

                                    if (isSystemMsg) {
                                        const displayText = comment.comment_text.replace(/^🔴\s*/, '');
                                        return (
                                            <div key={comment.comment_id} className={styles.sysMsg}>
                                                <span className={styles.sysMsgHeader}>
                                                    <FiAlertCircle size={12} /> Sistema
                                                </span>
                                                <p className={styles.sysMsgText}>{displayText}</p>
                                            </div>
                                        );
                                    }

                                    const isUser = !!comment.author;
                                    const authorName = isUser
                                        ? (comment.author?.nombre_completo || 'Técnico')
                                        : (`${comment.customerAuthor?.customer_first_name || ''} ${comment.customerAuthor?.customer_last_name || ''}`.trim() || 'Cliente');

                                    const foto = isUser
                                        ? comment.author?.foto
                                        : comment.customerAuthor?.customer_image;
                                    const hasFoto = foto && foto !== 'default.jpg';
                                    const initial = authorName.charAt(0).toUpperCase();
                                    const isAdmin = isUser && comment.author?.rol === 'Admin';

                                    return (
                                        <div
                                            key={comment.comment_id}
                                            className={`${styles.messageRow} ${isUser ? styles.rowRight : styles.rowLeft}`}
                                        >
                                            {/* Avatar izquierdo (cliente)*/}
                                            {!isUser && (
                                                <div className={styles.avatarSmall}>
                                                    {hasFoto
                                                        ? <img
                                                            src={foto}
                                                            alt={authorName}
                                                            onError={e => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        : null
                                                    }
                                                    <span style={{ display: hasFoto ? 'none' : 'flex' }}>
                                                        {initial}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Burbuja */}
                                            <div className={`${styles.bubble} ${isUser ? styles.bubbleRight : styles.bubbleLeft}`}>
                                                <div className={styles.bubbleMeta}>
                                                    <span className={styles.bubbleAuthor}>{authorName}</span>
                                                    {isAdmin && (
                                                        <span className={styles.adminBadge}><FiShield /> Admin</span>
                                                    )}
                                                    <span className={styles.bubbleTime}>{formatTime(comment.created_at)}</span>
                                                </div>
                                                <p className={styles.bubbleText}>{comment.comment_text}</p>

                                                {comment.attachments?.length > 0 && (
                                                    <div className={styles.attachmentList}>
                                                        {comment.attachments.map(att => {
                                                            const mType = getMediaType(att.file_path);
                                                            if (mType === 'image') return (
                                                                <img
                                                                    key={att.attachment_id}
                                                                    src={att.file_path}
                                                                    alt={att.file_name}
                                                                    className={styles.attachMedia}
                                                                    onClick={() => setSelectedMedia({ url: att.file_path, type: 'image' })}
                                                                />
                                                            );
                                                            if (mType === 'video') return (
                                                                <video
                                                                    key={att.attachment_id}
                                                                    src={att.file_path}
                                                                    className={styles.attachMedia}
                                                                    onClick={() => setSelectedMedia({ url: att.file_path, type: 'video' })}
                                                                />
                                                            );
                                                            return (
                                                                <a
                                                                    key={att.attachment_id}
                                                                    href={att.file_path}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={styles.attachmentChip}
                                                                >
                                                                    <FiPaperclip /> {att.file_name || 'Archivo adjunto'}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Avatar derecho (técnico) */}
                                            {isUser && (
                                                <div className={styles.avatarSmall}>
                                                    {hasFoto
                                                        ? <img
                                                            src={foto}
                                                            alt={authorName}
                                                            onError={e => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        : null
                                                    }
                                                    <span style={{ display: hasFoto ? 'none' : 'flex' }}>
                                                        {initial}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* ── LIGHTBOX ── */}
                {selectedMedia && (
                    <div className={styles.lightbox} onClick={() => setSelectedMedia(null)}>
                        <button className={styles.closeLightbox} onClick={() => setSelectedMedia(null)}><FiX /></button>
                        {selectedMedia.type === 'image'
                            ? <img src={selectedMedia.url} alt="Vista previa" onClick={e => e.stopPropagation()} />
                            : <video src={selectedMedia.url} controls onClick={e => e.stopPropagation()} />
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialViewModal;