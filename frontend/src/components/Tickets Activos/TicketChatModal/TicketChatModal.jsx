import React, { useEffect, useState, useRef } from 'react';
import styles from './TicketChatModal.module.less';
import {
    FiArrowLeft, FiX, FiSend, FiPaperclip,
    FiCheckCircle, FiAlertCircle, FiXCircle,
    FiChevronLeft, FiChevronRight, FiUpload, FiLock, FiShield
} from 'react-icons/fi';
import { LuTag, LuBox, LuMessageSquare } from 'react-icons/lu';
import { FaQuestion } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import {
    getTicketComments, addTicketComment,
    updateTicketStatus, socket
} from '../../../services/Ticketservice';
import "flag-icons/css/flag-icons.min.css";

const STATUS_LABELS = {
    4: 'Asignado', 5: 'En Proceso', 6: 'Pendiente Info',
    7: 'Escalado', 8: 'Sol. Cancelación', 9: 'Finalizado', 10: 'Cancelado'
};

const getDueDateUrgency = (dueDate) => {
    if (!dueDate) return null;
    const diffDays = (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'overdue';
    if (diffDays < 1) return 'critical';
    if (diffDays <= 3) return 'warning';
    return 'ok';
};

const getMediaType = (filePath = '') => {
    const ext = filePath.split('.').pop().toLowerCase().split('?')[0];
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    return 'file';
};

const TicketChatModal = ({ ticket, onClose, onSuccess, canWrite = false, canEdit = false, canDelete = false }) => {
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [comments, setComments] = useState([]);
    const [clientMsg, setClientMsg] = useState('');
    const [pendingFiles, setPendingFiles] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [sending, setSending] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null); // { url, type: 'image'|'video' }
    const [evidenceStart, setEvidenceStart] = useState(0);
    const [interventionConfirmed, setInterventionConfirmed] = useState(false);
    const [interventionStep, setInterventionStep] = useState(0); // 0=none 1=primera confirm 2=segunda confirm

    const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;
    const formatDate = (d) => !d ? 'Sin fecha' : new Date(d).toLocaleDateString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const formatTime = (d) => new Date(d).toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const isAdmin = user?.rol === 'Admin';
    const currentStatusId = ticket.ticket_status_id;
    const isAsignado = currentStatusId === 4;
    const isEnProceso = currentStatusId === 5;
    const isTerminado = currentStatusId === 9 || currentStatusId === 10;
    const noInteraction = isEnProceso && comments.length === 0 && canWrite;
    const evidences = ticket.evidences || [];

    const isAssigned = ticket.assignedUsers?.some(
        u => parseInt(u.user_id) === parseInt(user?.user_id)
    );
    const isAdminIntervening = isAdmin && !isAssigned && !isTerminado && canWrite;
    const chatLocked = isAsignado || isTerminado || !canWrite || (isAdminIntervening && !interventionConfirmed);

    const msgError = clientMsg.length > 0 && clientMsg !== clientMsg.trimStart()
        ? 'El mensaje no puede iniciar con espacios'
        : null;
    const canSend = !chatLocked && !sending && !msgError &&
        (clientMsg.trim().length > 0 || pendingFiles.length > 0);
    const visibleEvidences = evidences.slice(evidenceStart, evidenceStart + 3);

    useEffect(() => { loadComments(); }, [ticket.ticket_id]);

    useEffect(() => {
        const onNewComment = (data) => {
            if (parseInt(data.ticket_id) === ticket.ticket_id) {
                setComments(prev => [...prev, data.comment]);
            }
        };
        const onDeleteComment = (data) => {
            if (parseInt(data.ticket_id) === ticket.ticket_id) {
                setComments(prev => prev.filter(c => c.comment_id !== data.comment_id));
            }
        };
        socket.on('new_comment', onNewComment);
        socket.on('comment_deleted', onDeleteComment);
        // Mensajes enviados desde la app móvil por el cliente
        socket.on(`ticket_comment_${ticket.ticket_id}`, (comment) => {
            setComments(prev => {
                if (prev.some(c => c.comment_id === comment.comment_id)) return prev;
                return [...prev, comment];
            });
        });
        return () => {
            socket.off('new_comment', onNewComment);
            socket.off('comment_deleted', onDeleteComment);
            socket.off(`ticket_comment_${ticket.ticket_id}`);
        };
    }, [ticket.ticket_id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments.length]);

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const data = await getTicketComments(ticket.ticket_id);
            setComments(Array.isArray(data) ? data : []);
        } catch {
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSendClient = async () => {
        if (!canSend) return;
        setSending(true);
        try {
            const fd = new FormData();
            fd.append('comment_text', clientMsg.trim() || '📎 Archivo adjunto');
            pendingFiles.forEach(f => fd.append('attachments', f));
            await addTicketComment(ticket.ticket_id, fd);
            setClientMsg('');
            setPendingFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (e) {
            alert('Error al enviar: ' + e.message);
        } finally {
            setSending(false);
        }
    };

    const handleAdvanceToEnProceso = async () => {
        try {
            await updateTicketStatus(ticket.ticket_id, 5);
            onSuccess('Ticket avanzado a "En Proceso".');
            onClose();
        } catch (e) {
            alert('Error: ' + e.message);
            setConfirmAction(null);
        }
    };

    const handleFinalize = async () => {
        try {
            await updateTicketStatus(ticket.ticket_id, 9);
            onSuccess('El ticket ha sido finalizado correctamente.');
            onClose();
        } catch (e) {
            alert('Error: ' + e.message);
            setConfirmAction(null);
        }
    };

    const handleEscalate = async () => {
        try {
            await updateTicketStatus(ticket.ticket_id, 7);
            onSuccess('El ticket ha sido escalado.');
            onClose();
        } catch (e) {
            alert('Error: ' + e.message);
            setConfirmAction(null);
        }
    };

    const handleForceClose = async () => {
        try {
            await updateTicketStatus(ticket.ticket_id, 10);
            onSuccess('El ticket ha sido cancelado y cerrado.');
            onClose();
        } catch (e) {
            alert('Error: ' + e.message);
            setConfirmAction(null);
        }
    };

    const warrantyInfo = ticket.warranty;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                {/* ── HEADER ── */}
                <div className={styles.topHeader}>
                    <button className={styles.backBtn} onClick={onClose}><FiArrowLeft /></button>
                    <div className={styles.headerInfo}>
                        <span className={styles.ticketId}>{formatID(ticket.ticket_id)}</span>
                        {ticket.ticket_priority && (
                            <span className={`${styles.priorityBadge} ${styles[`priority${ticket.ticket_priority}`]}`}>
                                {ticket.ticket_priority}
                            </span>
                        )}
                        <span className={styles.statusBadge}>{STATUS_LABELS[currentStatusId] || 'Activo'}</span>
                    </div>
                    {ticket.ticket_due_date && (() => {
                        const urgency = getDueDateUrgency(ticket.ticket_due_date);
                        const badgeClass = urgency === 'warning' ? styles.dueDateWarning
                            : (urgency === 'critical' || urgency === 'overdue') ? styles.dueDateCritical
                                : '';
                        return (
                            <span className={`${styles.dueDateBadge} ${badgeClass}`}>
                                {urgency === 'overdue' && <FiAlertCircle />}
                                {urgency === 'critical' && <FiAlertCircle />}
                                {urgency === 'warning' && <FiAlertCircle />}
                                {urgency === 'overdue' ? 'Vencido'
                                    : urgency === 'critical' ? '¡Vence hoy!'
                                        : `Fecha Máx: ${formatDate(ticket.ticket_due_date)}`}
                            </span>
                        );
                    })()}
                </div>

                {/* ── MAIN ── */}
                <div className={styles.mainLayout}>

                    {/* LEFT — Resumen del caso */}
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
                                    <span className={`${styles.tagBadge} ${styles.cat}`}><LuTag /> {ticket.category?.category_name}</span>
                                    <span className={`${styles.tagBadge} ${styles.prod}`}><LuBox /> {ticket.product?.product_name}</span>
                                    <span className={`${styles.tagBadge} ${styles.mod}`}>{ticket.productModel?.product_model_name || 'N/A'}</span>
                                </div>

                                <div className={styles.serialWarranty}>
                                    <div className={styles.serialItem}>
                                        <span className={styles.miniLabel}>NO. DE SERIE</span>
                                        <p>{ticket.ticket_serial_number || 'N/A'}</p>
                                    </div>
                                    <div className={styles.warrantyItem}>
                                        {!warrantyInfo ? (
                                            <span className={styles.warrantyLabelError}><FiXCircle /> No encontrada</span>
                                        ) : warrantyInfo.is_expired ? (
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

                                {ticket.assignment_remarks && (
                                    <div className={styles.descriptionSection}>
                                        <span className={styles.miniLabel}>OBSERVACIONES DE ASIGNACIÓN</span>
                                        <div className={styles.remarksBox}>
                                            <p>{ticket.assignment_remarks}</p>
                                        </div>
                                    </div>
                                )}

                                {evidences.length > 0 && (
                                    <div className={styles.evidenceSection}>
                                        <span className={styles.miniLabel}>EVIDENCIA ADJUNTA</span>
                                        <div className={styles.miniGallery}>
                                            <FiChevronLeft
                                                className={`${styles.navIcon} ${evidenceStart === 0 ? styles.navDisabled : ''}`}
                                                onClick={() => setEvidenceStart(Math.max(0, evidenceStart - 1))}
                                            />
                                            <div className={styles.imgWrapper}>
                                                {visibleEvidences.map(ev => (
                                                    <img
                                                        key={ev.ticket_evidence_id}
                                                        src={ev.ticket_evidence_path}
                                                        alt="Evidencia"
                                                        onClick={() => setSelectedMedia({ url: ev.ticket_evidence_path, type: 'image' })}
                                                    />
                                                ))}
                                            </div>
                                            <FiChevronRight
                                                className={`${styles.navIcon} ${evidenceStart + 3 >= evidences.length ? styles.navDisabled : ''}`}
                                                onClick={() => setEvidenceStart(Math.min(evidences.length - 3, evidenceStart + 1))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Chat */}
                    <div className={styles.chatColumn}>

                        {/* Banners de estado */}
                        {isAsignado && (
                            <div className={styles.lockedBanner}>
                                <FiLock className={styles.lockIcon} />
                                <div>
                                    <p className={styles.lockTitle}>Chat bloqueado</p>
                                    <p className={styles.lockSub}>Avanza el ticket a <strong>En Proceso</strong> para poder escribir mensajes.</p>
                                </div>
                            </div>
                        )}

                        {isAdminIntervening && interventionConfirmed && (
                            <div className={styles.interventionActiveBanner}>
                                <FiShield className={styles.shieldIcon} />
                                <p>Interviniendo como Administrador en este ticket.</p>
                            </div>
                        )}

                        {/* Comentarios */}
                        <div className={`${styles.commentsSection} ${isAsignado ? styles.commentsFaded : ''}`}>
                            <div className={styles.sectionLabel}><LuMessageSquare /> Comentarios</div>

                            <div className={styles.messageList}>
                                {loadingComments ? (
                                    <p className={styles.emptyChat}>Cargando...</p>
                                ) : comments.length === 0 ? (
                                    <p className={styles.emptyChat}>Aún no hay mensajes. Inicia la conversación.</p>
                                ) : (
                                    comments.map(comment => {
                                        const isMe = parseInt(comment.author?.user_id) === parseInt(user?.user_id);
                                        const isCustomerMsg = !comment.user_id && !!comment.customer_id;
                                        const hasFoto = isCustomerMsg
                                            ? !!comment.customerAuthor?.customer_image
                                            : !!(comment.author?.foto && comment.author.foto !== 'default.jpg');
                                        const myFoto = user?.foto && user.foto !== 'default.jpg';
                                        const authorIsAdmin = comment.author?.rol === 'Admin';
                                        const displayName = isCustomerMsg
                                            ? `${comment.customerAuthor?.customer_first_name ?? ''} ${comment.customerAuthor?.customer_last_name ?? ''}`.trim() || 'Cliente'
                                            : comment.author?.nombre_completo ?? 'Usuario';
                                        const displayFoto = isCustomerMsg
                                            ? comment.customerAuthor?.customer_image
                                            : comment.author?.foto;
                                        const displayInitial = displayName.charAt(0).toUpperCase();
                                        return (
                                            <div key={comment.comment_id} className={`${styles.messageRow} ${isMe ? styles.rowRight : styles.rowLeft}`}>
                                                {!isMe && (
                                                    <div className={styles.avatarSmall}>
                                                        {hasFoto
                                                            ? <img src={displayFoto} alt={displayName} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            : null
                                                        }
                                                        <span style={{ display: hasFoto ? 'none' : 'flex' }}>
                                                            {displayInitial}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`${styles.bubble} ${isMe ? styles.bubbleRight : styles.bubbleLeft}`}>
                                                    <div className={styles.bubbleMeta}>
                                                        <span className={styles.bubbleAuthor}>{displayName}</span>
                                                        {authorIsAdmin && (
                                                            <span className={styles.adminBadge}><FiShield /> Admin</span>
                                                        )}
                                                        <span className={styles.bubbleTime}>{formatTime(comment.created_at)}</span>
                                                    </div>
                                                    <p className={styles.bubbleText}>{comment.comment_text}</p>
                                                    {comment.attachments?.length > 0 && (
                                                        <div className={styles.attachmentList}>
                                                            {comment.attachments.map(a => {
                                                                const mediaType = getMediaType(a.file_path);
                                                                if (mediaType === 'image') {
                                                                    return (
                                                                        <img
                                                                            key={a.attachment_id}
                                                                            src={a.file_path}
                                                                            alt={a.file_name}
                                                                            className={styles.attachMedia}
                                                                            onClick={() => setSelectedMedia({ url: a.file_path, type: 'image' })}
                                                                        />
                                                                    );
                                                                }
                                                                if (mediaType === 'video') {
                                                                    return (
                                                                        <video
                                                                            key={a.attachment_id}
                                                                            src={a.file_path}
                                                                            className={styles.attachMedia}
                                                                            onClick={() => setSelectedMedia({ url: a.file_path, type: 'video' })}
                                                                        />
                                                                    );
                                                                }
                                                                return (
                                                                    <a key={a.attachment_id} href={a.file_path} target="_blank" rel="noreferrer" className={styles.attachmentChip}>
                                                                        <FiPaperclip /> {a.file_name}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                {isMe && (
                                                    <div className={styles.avatarSmall}>
                                                        {myFoto
                                                            ? <img src={user.foto} alt={user.nombre_completo} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            : null
                                                        }
                                                        <span style={{ display: myFoto ? 'none' : 'flex' }}>
                                                            {user?.nombre_completo?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {isTerminado ? (
                                <div className={styles.closedInputBanner}>
                                    <FiLock className={styles.closedLockIcon} />
                                    <p>
                                        {currentStatusId === 9
                                            ? 'Este ticket ha sido finalizado. No se pueden enviar más mensajes.'
                                            : 'Este ticket fue cancelado. No se pueden enviar más mensajes.'
                                        }
                                    </p>
                                </div>
                            ) : !canWrite ? (
                                <div className={styles.closedInputBanner}>
                                    <FiLock className={styles.closedLockIcon} />
                                    <p>Solo tienes permisos de lectura en este módulo.</p>
                                </div>
                            ) : isAdminIntervening && !interventionConfirmed ? (
                                <div className={styles.interventionGate}>
                                    <FiShield className={styles.gateIcon} />
                                    <p>No estás asignado a este ticket. Para enviar mensajes debes confirmar tu intervención como Administrador.</p>
                                    <button className={styles.interventionBtn} onClick={() => setInterventionStep(1)}>
                                        Intervenir en este ticket
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.messageInputArea}>
                                    <div className={styles.textareaWrapper}>
                                        <textarea
                                            className={`${styles.msgTextarea} ${msgError ? styles.msgTextareaError : ''}`}
                                            value={clientMsg}
                                            onChange={e => setClientMsg(e.target.value)}
                                            placeholder={chatLocked ? 'No disponible...' : 'Escribe un mensaje para el cliente...'}
                                            rows={2}
                                            disabled={chatLocked}
                                        />
                                        {msgError && (
                                            <span className={styles.msgErrorHint}>{msgError}</span>
                                        )}
                                    </div>
                                    <button
                                        className={styles.sendBtn}
                                        onClick={handleSendClient}
                                        disabled={!canSend}
                                    >
                                        <FiSend />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Archivos adjuntos — oculto cuando el ticket está terminado o sin permiso escritura */}
                        {!isTerminado && canWrite && (
                            <div className={`${styles.attachmentsSection} ${chatLocked ? styles.commentsFaded : ''}`}>
                                <div className={styles.sectionLabel}><FiPaperclip /> Archivos Adjuntos</div>
                                {pendingFiles.length > 0 && (
                                    <div className={styles.pendingFiles}>
                                        {pendingFiles.map((f, i) => (
                                            <span key={i} className={styles.pendingChip}>
                                                {f.name}
                                                <button onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}><FiX /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <button
                                    className={styles.attachFilesBtn}
                                    onClick={() => !chatLocked && fileInputRef.current?.click()}
                                    disabled={chatLocked}
                                >
                                    <FiUpload /> Adjuntar Archivos
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    hidden
                                    onChange={e => setPendingFiles(prev => [...prev, ...Array.from(e.target.files)])}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className={styles.modalFooter}>
                    {/* ── Ticket terminado: solo badge informativo ── */}
                    {isTerminado && (
                        <div className={styles.closedFooter}>
                            <span className={`${styles.closedBadge} ${currentStatusId === 9 ? styles.badgeFinalizado : styles.badgeCancelado}`}>
                                {currentStatusId === 9 ? '✓ Ticket Finalizado' : '✗ Ticket Cancelado'}
                            </span>
                            <p className={styles.closedFooterNote}>Este ticket ya no puede ser modificado.</p>
                        </div>
                    )}

                    {!isTerminado && isAsignado && canEdit && !confirmAction && (
                        <div className={styles.actionZone}>
                            <button className={styles.successBtn} onClick={() => setConfirmAction('advance')}>
                                Avanzar a En Proceso
                            </button>
                        </div>
                    )}
                    {!isTerminado && isAsignado && canEdit && confirmAction === 'advance' && (
                        <div className={styles.confirmZone}>
                            <FaQuestion className={styles.questionIcon} />
                            <span className={styles.warningText}>¿Avanzar el ticket a <strong>"En Proceso"</strong>?</span>
                            <div className={styles.confirmBtns}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)}>No, regresar</button>
                                <button className={styles.successBtn} onClick={handleAdvanceToEnProceso}>Sí, Avanzar</button>
                            </div>
                        </div>
                    )}

                    {/* ── Status 5+ (En Proceso o superior): botones según rol y permisos ── */}
                    {!isTerminado && !isAsignado && (canEdit || canDelete) && !confirmAction && (
                        <div className={styles.actionZoneCol}>
                            <div className={styles.actionZone}>
                                {isAdmin ? (
                                    <>
                                        {canDelete && <button className={styles.dangerBtn} onClick={() => setConfirmAction('close')}>Forzar Cierre</button>}
                                        {canEdit && <button className={styles.escalateBtn} onClick={() => setConfirmAction('escalate')} disabled={noInteraction}>Escalar Ticket</button>}
                                        {canEdit && <button className={styles.successBtn} onClick={() => setConfirmAction('finalize')} disabled={noInteraction}>Finalizar Ticket</button>}
                                    </>
                                ) : isEnProceso && canEdit ? (
                                    <>
                                        <button className={styles.escalateBtn} onClick={() => setConfirmAction('escalate')} disabled={noInteraction}>Escalar Ticket</button>
                                        <button className={styles.successBtn} onClick={() => setConfirmAction('finalize')} disabled={noInteraction}>Finalizar Ticket</button>
                                    </>
                                ) : null}
                            </div>
                            {noInteraction && (
                                <p className={styles.noInteractionHint}>
                                    Debes enviar al menos un mensaje al cliente antes de escalar o finalizar el ticket.
                                </p>
                            )}
                        </div>
                    )}

                    {confirmAction === 'finalize' && (
                        <div className={styles.confirmZone}>
                            <FaQuestion className={styles.questionIcon} />
                            <span className={styles.warningText}>¿Finalizar este ticket?</span>
                            <div className={styles.confirmBtns}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)}>No, regresar</button>
                                <button className={styles.successBtn} onClick={handleFinalize}>Sí, Finalizar</button>
                            </div>
                        </div>
                    )}

                    {confirmAction === 'escalate' && (
                        <div className={styles.confirmZone}>
                            <FiAlertCircle className={styles.escalateIcon} />
                            <span className={styles.warningText}>¿Escalar este ticket al siguiente nivel de soporte?</span>
                            <div className={styles.confirmBtns}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)}>No, regresar</button>
                                <button className={styles.escalateBtn} onClick={handleEscalate}>Sí, Escalar</button>
                            </div>
                        </div>
                    )}

                    {confirmAction === 'close' && (
                        <div className={styles.confirmZone}>
                            <FiAlertCircle className={styles.dangerIcon} />
                            <span className={styles.warningText}>¿Cancelar y cerrar este ticket definitivamente?</span>
                            <div className={styles.confirmBtns}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)}>No, regresar</button>
                                <button className={styles.dangerBtn} onClick={handleForceClose}>Sí, Forzar Cierre</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── DOBLE CONFIRMACIÓN DE INTERVENCIÓN ── */}
                {interventionStep > 0 && (
                    <div className={styles.interventionOverlay}>
                        <div className={styles.interventionConfirm}>
                            <FiShield className={styles.interventionIcon} />
                            {interventionStep === 1 && (
                                <>
                                    <h4>¿Intervenir en este ticket?</h4>
                                    <p>No estás asignado a este ticket. Al intervenir podrás enviar mensajes como Administrador y tu participación quedará visible en el historial del chat.</p>
                                    <div className={styles.interventionBtns}>
                                        <button className={styles.cancelBtn} onClick={() => setInterventionStep(0)}>Cancelar</button>
                                        <button className={styles.interventionConfirmBtn} onClick={() => setInterventionStep(2)}>Sí, continuar</button>
                                    </div>
                                </>
                            )}
                            {interventionStep === 2 && (
                                <>
                                    <h4>¿Confirmar intervención?</h4>
                                    <p>¿Estás seguro de que deseas intervenir en este ticket? Una vez confirmado podrás enviar mensajes.</p>
                                    <div className={styles.interventionBtns}>
                                        <button className={styles.cancelBtn} onClick={() => setInterventionStep(1)}>Regresar</button>
                                        <button className={styles.interventionConfirmBtn} onClick={() => { setInterventionConfirmed(true); setInterventionStep(0); }}>
                                            Sí, Confirmar Intervención
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {selectedMedia && (
                    <div className={styles.imageOverlay} onClick={() => setSelectedMedia(null)}>
                        <button className={styles.closeLightbox} onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}><FiX /></button>
                        {selectedMedia.type === 'video' ? (
                            <video
                                src={selectedMedia.url}
                                className={styles.largeImage}
                                controls
                                autoPlay
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <img src={selectedMedia.url} alt="Media" className={styles.largeImage} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketChatModal;