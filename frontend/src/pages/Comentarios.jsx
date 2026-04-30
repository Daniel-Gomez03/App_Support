import React, { useState, useEffect, useMemo } from 'react';
import styles from './Comentarios.module.less';
import lensIcon from '../assets/icons/Lens-icon.svg';
import { MdFilterListAlt } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getAllRatings } from '../services/Ratingservice';
import ComentariosGrid from '../components/Comentarios/ComentariosGrid/ComentariosGrid';
import ComentariosFilterModal from '../components/Comentarios/ComentariosFilterModal/ComentariosFilterModal';

const Comentarios = () => {
    const { user } = useAuth();

    const canRead = user?.Permissions?.some(p =>
        p.Seccion?.module_name === 'Comentarios' && p.permissions_read === 1
    );

    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [appliedFilters, setAppliedFilters] = useState({
        score: '',
        dateFrom: '',
        dateTo: '',
    });

    const loadRatings = async () => {
        try {
            setLoading(true);
            const data = await getAllRatings();
            setRatings(Array.isArray(data) ? data : []);
        } catch {
            setRatings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Soporte | Comentarios';
        if (canRead) loadRatings();
        else setLoading(false);
    }, [canRead]);

    const dateRange = useMemo(() => {
        if (ratings.length === 0) return { min: '', max: '' };
        const dates = ratings
            .map(r => r.rating_createdAt?.split('T')[0])
            .filter(Boolean)
            .sort();
        return { min: dates[0], max: dates[dates.length - 1] };
    }, [ratings]);

    const hasActiveFilters = appliedFilters.score || appliedFilters.dateFrom || appliedFilters.dateTo;

    const filteredRatings = useMemo(() => {
        return ratings.filter(r => {
            const searchLower = searchTerm.toLowerCase();
            const clientName = `${r.customer_first_name || ''} ${r.customer_last_name || ''}`.toLowerCase();
            const company = (r.customer_company || '').toLowerCase();
            const techName = (r.tech_name || '').toLowerCase();
            const ticketNum = `T-${r.ticket_id?.toString().padStart(4, '0')}`;

            const matchesSearch = !searchTerm || (
                ticketNum.toLowerCase().includes(searchLower) ||
                clientName.includes(searchLower) ||
                company.includes(searchLower) ||
                techName.includes(searchLower)
            );

            const matchesScore = !appliedFilters.score || (() => {
                const s = r.rating_score;
                if (appliedFilters.score === 'excelente') return s > 3;
                if (appliedFilters.score === 'regular') return s === 3;
                if (appliedFilters.score === 'malo') return s < 3;
                return true;
            })();

            const ratingDate = r.rating_createdAt ? r.rating_createdAt.split('T')[0] : '';
            const matchesFrom = !appliedFilters.dateFrom || ratingDate >= appliedFilters.dateFrom;
            const matchesTo = !appliedFilters.dateTo || ratingDate <= appliedFilters.dateTo;

            return matchesSearch && matchesScore && matchesFrom && matchesTo;
        });
    }, [ratings, searchTerm, appliedFilters]);

    const stats = useMemo(() => {
        const total = filteredRatings.length;
        const average = total > 0
            ? (filteredRatings.reduce((sum, r) => sum + r.rating_score, 0) / total).toFixed(1)
            : '0.0';
        const withComment = filteredRatings.filter(r => r.rating_comment?.trim()).length;
        const onlyScore = total - withComment;
        return { total, average, withComment, onlyScore };
    }, [filteredRatings]);

    if (!canRead) {
        return (
            <div className={styles.comentariosContainer}>
                <div className={styles.errorInfo}>No tienes permisos para visualizar los comentarios.</div>
            </div>
        );
    }

    return (
        <div className={styles.comentariosContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Historial de Comentarios</h1>
                    <p className={styles.subtitle}>Reseñas y puntuaciones dejadas por los clientes al finalizar un caso.</p>
                </div>
            </div>

            <div className={styles.controlsWrapper}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <img src={lensIcon} alt="Buscar" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, ticket, empresa o técnico..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.actionButtons}>
                        <div className={styles.iconGroup}>
                            <button
                                className={`${styles.filterBtn} ${hasActiveFilters ? styles.activeFilter : ''}`}
                                onClick={() => setShowFilterModal(true)}
                                title="Filtrar"
                            >
                                <MdFilterListAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Total Reseñas</p>
                    <p className={styles.statValue}>{loading ? '—' : stats.total}</p>
                </div>
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Promedio</p>
                    <p className={styles.statValue}>
                        {loading ? '—' : stats.average}
                        {!loading && <FaStar className={styles.starIcon} />}
                    </p>
                </div>
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Con Comentario</p>
                    <p className={styles.statValue}>{loading ? '—' : stats.withComment}</p>
                </div>
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>Solo Puntuación</p>
                    <p className={styles.statValue}>{loading ? '—' : stats.onlyScore}</p>
                </div>
            </div>

            <div className={styles.gridContainer}>
                {loading ? (
                    <div className={styles.loadingState}>Cargando reseñas...</div>
                ) : (
                    <ComentariosGrid data={filteredRatings} />
                )}
            </div>

            <ComentariosFilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                currentFilters={appliedFilters}
                onApply={setAppliedFilters}
                minDate={dateRange.min}
                maxDate={dateRange.max}
            />
        </div>
    );
};

export default Comentarios;
