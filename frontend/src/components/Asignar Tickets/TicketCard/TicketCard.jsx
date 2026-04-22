import React from 'react';
import styles from './TicketCard.module.less';
import { FiEye, FiUserPlus, FiClock } from "react-icons/fi";
import { LuTag, LuBox } from "react-icons/lu";

const TicketCard = ({ ticket, onViewDetail, onAssign, showAssignButton }) => {

    const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const customerName = `${ticket.customer?.customer_first_name || ''} ${ticket.customer?.customer_last_name || ''}`.trim()
        || ticket.customer?.customer_company
        || 'Cliente Desconocido';

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.ticketId}>{formatID(ticket.ticket_id)}</span>
                <div className={styles.dateInfo}>
                    <FiClock />
                    <span>{formatDate(ticket.created_at)}</span>
                </div>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.clientName}>{customerName}</h3>

                <div className={styles.tagsRow}>
                    <span className={`${styles.tagBadge} ${styles.cat}`}>
                        <LuTag /> {ticket.category?.category_name}
                    </span>
                    <span className={`${styles.tagBadge} ${styles.prod}`}>
                        <LuBox /> {ticket.product?.product_name}
                    </span>
                    {ticket.productModel && (
                        <span className={`${styles.tagBadge} ${styles.mod}`}>
                            {ticket.productModel.product_model_name}
                        </span>
                    )}
                </div>

                <p className={styles.subjectText}>{ticket.ticket_subject}</p>
            </div>

            <div className={styles.cardFooter}>
                {showAssignButton ? (
                    <button
                        className={styles.assignBtn}
                        onClick={() => onAssign(ticket)}
                    >
                        <FiUserPlus /> Asignar Ticket
                    </button>
                ) : (
                    <button
                        className={styles.detailBtn}
                        onClick={() => onViewDetail(ticket)}
                    >
                        <FiEye /> Ver Detalles
                    </button>
                )}
            </div>
        </div>
    );
};

export default TicketCard;