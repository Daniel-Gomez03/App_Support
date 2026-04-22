import React from 'react';
import styles from './TicketCard.module.less';
import { FiEye, FiUserPlus, FiClock, FiFileText } from "react-icons/fi";
import { LuTag, LuBox } from "react-icons/lu";

const TicketCard = ({ ticket, onViewDetail, onAssign, activeTab }) => {

    // Formatear ID: T-0014
    const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

    // Formatear fecha simple
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.idBadge}>
                    <span>{formatID(ticket.ticket_id)}</span>
                </div>
                <div className={styles.dateInfo}>
                    <FiClock />
                    <span>{formatDate(ticket.created_at)}</span>
                </div>
            </div>

            <div className={styles.cardBody}>
                {/* 1. Nombre de la empresa / cliente como título principal */}
                <h3 className={styles.clientName}>{ticket.customer?.customer_company}</h3>

                {/* 2. Asunto del ticket como subtítulo destacado */}
                <div className={styles.subjectBox}>
                    <FiFileText className={styles.subjectIcon} />
                    <p className={styles.subjectText}>{ticket.ticket_subject}</p>
                </div>

                {/* 3. Rejilla de información (sin el cliente) */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <LuTag className={styles.icon} />
                        <span className={styles.label}>Categoría:</span>
                        <span className={styles.value}>{ticket.category?.category_name}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <LuBox className={styles.icon} />
                        <span className={styles.label}>Producto:</span>
                        <span className={styles.value}>
                            {ticket.product?.product_name}
                            {ticket.productModel ? ` (${ticket.productModel.product_model_name})` : ''}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.cardFooter}>
                {activeTab === 1 ? (
                    // Botones para pestaña ENTRANTES
                    <button
                        className={styles.detailBtn}
                        onClick={() => onViewDetail(ticket)}
                    >
                        <FiEye /> Ver Detalles
                    </button>
                ) : (
                    // Botón para pestaña BACKLOG
                    <button
                        className={styles.assignBtn}
                        onClick={() => onAssign(ticket)}
                    >
                        <FiUserPlus /> Asignar Ticket
                    </button>
                )}
            </div>
        </div>
    );
};

export default TicketCard;