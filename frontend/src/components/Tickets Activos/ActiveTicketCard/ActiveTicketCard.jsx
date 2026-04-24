import React from 'react';
import styles from './ActiveTicketCard.module.less';
import { LuCalendar } from 'react-icons/lu';
import { FiAlertCircle } from 'react-icons/fi';

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

    const hasDueDate = showAvatars && ticket.ticket_due_date;
    const urgency = hasDueDate ? getDueDateUrgency(ticket.ticket_due_date) : null;
    const urgencyClass = urgency === 'overdue' || urgency === 'critical'
        ? styles.dateCritical
        : urgency === 'warning' ? styles.dateWarning : '';

    return (
        <div className={styles.card} onClick={() => onClick && onClick(ticket)}>
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
                <div className={`${styles.dateInfo} ${urgencyClass}`}>
                    {(urgency === 'critical' || urgency === 'overdue' || urgency === 'warning')
                        ? <FiAlertCircle />
                        : <LuCalendar />
                    }
                    <span>
                        {hasDueDate
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