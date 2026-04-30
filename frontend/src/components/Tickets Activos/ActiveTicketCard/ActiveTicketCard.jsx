import React from 'react';
import styles from './ActiveTicketCard.module.less';
import { LuCalendar } from 'react-icons/lu';
import { FiAlertCircle, FiMessageCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const priorityConfig = {
    'Alta': { className: 'alta' },
    'Media': { className: 'media' },
    'Baja': { className: 'baja' },
};

const getDueDateUrgency = (dueDate) => {
    if (!dueDate) return null;
    const diffDays = (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'overdue';
    if (diffDays < 1) return 'critical';
    if (diffDays <= 3) return 'warning';
    return 'ok';
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH} h`;
    return `hace ${Math.floor(diffH / 24)} días`;
};

const ActiveTicketCard = ({ ticket, statusId, onClick }) => {
    const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };

    const priority = priorityConfig[ticket.ticket_priority] || null;
    const company = ticket.customer?.customer_company
        || `${ticket.customer?.customer_first_name || ''} ${ticket.customer?.customer_last_name || ''}`.trim()
        || 'Cliente';
    const assignedUsers = ticket.assignedUsers || [];
    const showAvatars = statusId >= 4;
    const isClosed = statusId === 9 || statusId === 10;

    // Due date — only compute urgency for active (non-closed) tickets
    const hasDueDate = showAvatars && !!ticket.ticket_due_date;
    const urgency = (hasDueDate && !isClosed) ? getDueDateUrgency(ticket.ticket_due_date) : null;
    const urgencyClass = urgency === 'overdue' || urgency === 'critical'
        ? styles.dateCritical
        : urgency === 'warning' ? styles.dateWarning : '';

    // For closed tickets: compare due date vs when the ticket was last updated (closed)
    const closedWithDueDate = isClosed && hasDueDate;
    const wasLate = closedWithDueDate
        ? new Date(ticket.updated_at || ticket.updatedAt || Date.now()) > new Date(ticket.ticket_due_date)
        : false;

    const hasCancellationRequest = !!ticket.cancellation_requested;
    // Hide customer-replied indicator for closed tickets — no longer actionable
    const hasCustomerReplied = showAvatars && !!ticket.customer_last_reply_at && !isClosed;

    return (
        <div className={`${styles.card} ${hasCancellationRequest ? styles.cardCancellation : ''} ${hasCustomerReplied ? styles.cardCustomerReplied : ''}`} onClick={() => onClick && onClick(ticket)}>
            {hasCancellationRequest && (
                <div className={styles.cancellationBanner}>
                    <FiAlertCircle size={11} />
                    Solicitud de cancelación pendiente
                </div>
            )}
            {hasCustomerReplied && (
                <div className={styles.customerReplyBanner}>
                    <FiMessageCircle size={11} />
                    Cliente respondió · {formatTimeAgo(ticket.customer_last_reply_at)}
                </div>
            )}
            <div className={styles.cardTop}>
                <span className={styles.ticketId}>{formatID(ticket.ticket_id)}</span>
                {priority && (
                    <span className={`${styles.priorityBadge} ${styles[priority.className]}`}>
                        {ticket.ticket_priority}
                    </span>
                )}
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.subject}>{ticket.ticket_subject}</h3>
                <p className={styles.company}>{company}</p>
            </div>

            <div className={styles.cardFooter}>
                <div className={`${styles.dateInfo} ${closedWithDueDate ? (wasLate ? styles.dateLate : styles.dateOnTime) : urgencyClass}`}>
                    {closedWithDueDate
                        ? wasLate ? <FiAlertCircle /> : <FiCheckCircle />
                        : (urgency === 'critical' || urgency === 'overdue' || urgency === 'warning')
                            ? <FiAlertCircle />
                            : <LuCalendar />
                    }
                    <span>
                        {closedWithDueDate
                            ? wasLate
                                ? statusId === 9 ? 'Finalizado tarde' : 'Cancelado tarde'
                                : statusId === 9 ? 'Finalizado a tiempo' : 'Cancelado a tiempo'
                            : hasDueDate
                                ? urgency === 'overdue' ? `Vencido · ${formatDate(ticket.ticket_due_date)}`
                                    : urgency === 'critical' ? `¡Vence hoy!`
                                        : formatDate(ticket.ticket_due_date)
                                : formatDate(ticket.created_at)
                        }
                    </span>
                </div>

                {showAvatars && assignedUsers.length > 0 && (
                    <div className={styles.avatarStack}>
                        {assignedUsers.slice(0, 3).map((u, idx) => {
                            const hasFoto = u.foto && u.foto !== 'default.jpg';
                            return (
                                <div
                                    key={u.user_id}
                                    className={styles.avatarItem}
                                    style={{ zIndex: assignedUsers.length - idx }}
                                    title={u.nombre_completo}
                                >
                                    {hasFoto ? (
                                        <img
                                            src={u.foto}
                                            alt={u.nombre_completo}
                                            className={styles.avatar}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={styles.avatarFallback}
                                        style={{ display: !hasFoto ? 'flex' : 'none' }}
                                    >
                                        {u.nombre_completo?.charAt(0)?.toUpperCase()}
                                    </div>
                                </div>
                            );
                        })}
                        {assignedUsers.length > 3 && (
                            <div className={styles.avatarMore} style={{ zIndex: 0 }}>
                                +{assignedUsers.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveTicketCard;