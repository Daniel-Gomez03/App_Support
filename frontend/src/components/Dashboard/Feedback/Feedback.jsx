// ============================================
// COMPONENT: FEEDBACK (Dashboard)
// Tarjeta lateral del Dashboard que muestra
// el promedio de calificación por técnico
// (últimas reseñas). Navega a /comments al
// pulsar "Ver todos los comentarios".
//
// COMPONENTES INTERNOS:
//   TechAvatar: avatar circular con fallback
//     a inicial cuando la imagen falla.
//
// FUNCIONES PURAS (fuera del árbol):
//   renderStars(rating): genera fila de 5
//     FaStar coloreadas según el promedio
//     redondeado; doradas (#FF9F43) vs grises.
//
// DATA SHAPE (item):
//   { name, avatar, rating, totalRatings }
// ============================================

import React, { useState } from 'react';
import styles from './Feedback.module.less';
import { FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const TechAvatar = ({ src, name }) => {
    const [imgOk, setImgOk] = useState(true);
    const hasImg = src && imgOk;
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
        <div className={styles.avatar}>
            {hasImg
                ? <img src={src} alt={name} onError={() => setImgOk(false)} />
                : <span>{initial}</span>
            }
        </div>
    );
};

const renderStars = (rating) => {
    const rounded = Math.round(parseFloat(rating) || 0);
    return [...Array(5)].map((_, index) => (
        <FaStar
            key={index}
            size={14}
            color={index < rounded ? "#FF9F43" : "#E5E7EB"}
            style={{ marginLeft: '2px' }}
        />
    ));
};

const Feedback = ({ data }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.feedbackCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.title}>Opinión del Cliente</h3>
            </div>

            <div className={styles.listContainer}>
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <div key={index} className={styles.userRow}>
                            <div className={styles.userInfo}>
                                <TechAvatar src={item.avatar} name={item.name} />
                                <div className={styles.userMeta}>
                                    <span className={styles.userName}>{item.name}</span>
                                    <span className={styles.ratingCount}>
                                        {item.totalRatings} {item.totalRatings === 1 ? 'reseña' : 'reseñas'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.ratingArea}>
                                <div className={styles.stars}>{renderStars(item.rating)}</div>
                                <span className={styles.ratingNum}>{parseFloat(item.rating).toFixed(1)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.emptyState}>No hay opiniones recientes.</p>
                )}
            </div>

            <div className={styles.footer}>
                <button className={styles.viewAllBtn} onClick={() => navigate('/comments')}>
                    Ver todos los comentarios
                </button>
            </div>
        </div>
    );
};

export default Feedback;