import React, { useState, useEffect } from 'react';
import styles from './ComentariosGrid.module.less';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiMessageSquare } from 'react-icons/fi';

const LIMIT = 6;

const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const getLabel = (score) => {
    if (score > 3) return { text: 'Excelente', cls: styles.excelente };
    if (score === 3) return { text: 'Regular', cls: styles.regular };
    return { text: 'Malo', cls: styles.malo };
};

const ClientAvatar = ({ src, name }) => {
    const [imgOk, setImgOk] = useState(true);
    const hasImg = src && src !== 'default.jpg' && imgOk;
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
        <div className={styles.clientAvatar}>
            {hasImg
                ? <img src={src} alt={name} onError={() => setImgOk(false)} />
                : initial
            }
        </div>
    );
};

const TechAvatar = ({ src, name }) => {
    const [imgOk, setImgOk] = useState(true);
    const hasImg = src && src !== 'default.jpg' && imgOk;
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
        <div className={styles.techAvatar}>
            {hasImg
                ? <img src={src} alt={name} onError={() => setImgOk(false)} />
                : initial
            }
        </div>
    );
};

const TechAvatarStack = ({ names, fotos }) => {
    const MAX = 3;
    const visible = names.slice(0, MAX);
    const overflow = names.length - MAX;
    return (
        <div className={styles.techStack}>
            {visible.map((name, i) => (
                <TechAvatar key={i} src={fotos[i]} name={name} />
            ))}
            {overflow > 0 && (
                <div className={styles.techOverflow}>+{overflow}</div>
            )}
        </div>
    );
};

const Stars = ({ score }) => (
    <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map(s =>
            s <= score
                ? <FaStar key={s} />
                : <FaRegStar key={s} className={styles.starEmpty} />
        )}
    </div>
);

const RatingCard = ({ r }) => {
    const clientName = `${r.customer_first_name} ${r.customer_last_name}`.trim();
    const label = getLabel(r.rating_score);
    const techNames = r.tech_names ? r.tech_names.split('|||') : [];
    const techFotos = r.tech_fotos ? r.tech_fotos.split('|||') : [];
    const techLabel = techNames.length > 0 ? techNames.join(', ') : 'Sin asignar';

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <ClientAvatar src={r.customer_image} name={clientName} />
                <div className={styles.clientInfo}>
                    <h4>{clientName || '—'}</h4>
                    <span>{r.customer_company || '—'}</span>
                </div>
                <div className={styles.ratingArea}>
                    <Stars score={r.rating_score} />
                    <span className={`${styles.badge} ${label.cls}`}>{label.text}</span>
                </div>
            </div>

            <p className={styles.ticketRef}>
                <strong>{formatID(r.ticket_id)}</strong> · {r.ticket_subject}
            </p>

            {r.rating_comment?.trim()
                ? <p className={styles.comment}>{r.rating_comment}</p>
                : <p className={styles.noComment}>Sin comentario escrito</p>
            }

            <div className={styles.cardFooter}>
                {techNames.length > 0
                    ? <TechAvatarStack names={techNames} fotos={techFotos} />
                    : <TechAvatar src={null} name="S/A" />
                }
                <span className={styles.techName}>
                    Atendido por <strong>{techLabel}</strong>
                </span>
                <span className={styles.cardDate}>{formatDate(r.rating_createdAt)}</span>
            </div>
        </div>
    );
};

const ComentariosGrid = ({ data }) => {
    const [page, setPage] = useState(1);

    useEffect(() => { setPage(1); }, [data.length]);

    if (data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <FiMessageSquare />
                <p>No se encontraron reseñas.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(data.length / LIMIT);
    const paged = data.slice((page - 1) * LIMIT, page * LIMIT);
    const from = (page - 1) * LIMIT + 1;
    const to = Math.min(page * LIMIT, data.length);

    return (
        <>
            <div className={styles.grid}>
                {paged.map(r => <RatingCard key={r.rating_id} r={r} />)}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <span className={styles.pageInfo}>
                        Mostrando {from}-{to} de {data.length}
                    </span>
                    <div className={styles.pageBtns}>
                        <button
                            className={styles.pageBtn}
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <FiChevronLeft />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                            <button
                                key={i}
                                className={`${styles.pageBtn} ${i === page ? styles.current : ''}`}
                                onClick={() => setPage(i)}
                            >
                                {i}
                            </button>
                        ))}
                        <button
                            className={styles.pageBtn}
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ComentariosGrid;
