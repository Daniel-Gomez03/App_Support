// ============================================
// COMPONENT: COMENTARIOS FILTER MODAL
// Modal de filtros para la página Comentarios.
// Gestiona un estado local `local` como copia de
// currentFilters para que cancelar descarte los
// cambios sin alterar los filtros aplicados.
//
// SINCRONIZACIÓN:
//   useEffect [isOpen] reinicia `local` a
//   currentFilters cada vez que el modal se abre,
//   descartando cualquier cambio no confirmado.
//
// handleReset: aplica filtros vacíos y cierra en
//   un solo paso — no requiere un "Aplicar" extra.
//
// CIERRE POR CLIC FUERA:
//   e.target === e.currentTarget en el overlay
//   evita necesitar un ref; solo cierra si el clic
//   fue directamente sobre el fondo oscuro.
//
// minDate / maxDate || undefined: string vacío se
//   convierte a undefined para que el atributo
//   min/max no se emita en el input de fecha.
//
// SCORES: constante fuera del componente para no
//   recrear el array en cada render.
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './ComentariosFilterModal.module.less';
import { FiX } from 'react-icons/fi';
import { MdFilterListAlt } from 'react-icons/md';

const SCORES = [
    { value: 'excelente', label: 'Excelente (>3 ★)' },
    { value: 'regular', label: 'Regular (3 ★)' },
    { value: 'malo', label: 'Malo (<3 ★)' },
];

const ComentariosFilterModal = ({ isOpen, onClose, currentFilters, onApply, minDate = '', maxDate = '' }) => {
    const [local, setLocal] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) setLocal(currentFilters);
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const handleChange = (key, value) => {
        setLocal(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApply(local);
        onClose();
    };

    const handleReset = () => {
        const empty = { score: '', dateFrom: '', dateTo: '' };
        setLocal(empty);
        onApply(empty);
        onClose();
    };

    const hasChanges = local.score || local.dateFrom || local.dateTo;

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <MdFilterListAlt className={styles.headerIcon} />
                        <h3>Filtrar Comentarios</h3>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                <div className={styles.body}>
                    <div className={styles.filterSection}>
                        <label className={styles.sectionLabel}>Puntuación</label>
                        <div className={styles.radioGroup}>
                            <label className={`${styles.radioItem} ${local.score === '' ? styles.selected : ''}`}>
                                <input
                                    type="radio"
                                    name="score"
                                    value=""
                                    checked={local.score === ''}
                                    onChange={() => handleChange('score', '')}
                                />
                                Todas
                            </label>
                            {SCORES.map(s => (
                                <label
                                    key={s.value}
                                    className={`${styles.radioItem} ${local.score === s.value ? styles.selected : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="score"
                                        value={s.value}
                                        checked={local.score === s.value}
                                        onChange={() => handleChange('score', s.value)}
                                    />
                                    {s.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <label className={styles.sectionLabel}>Rango de Fecha</label>
                        {minDate && (
                            <p className={styles.dateHint}>
                                Reseñas del <strong>{minDate}</strong> al <strong>{maxDate}</strong>
                            </p>
                        )}
                        <div className={styles.dateRange}>
                            <div className={styles.dateGroup}>
                                <span>Desde</span>
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    value={local.dateFrom}
                                    min={minDate || undefined}
                                    max={local.dateTo || maxDate || undefined}
                                    onChange={e => handleChange('dateFrom', e.target.value)}
                                />
                            </div>
                            <div className={styles.dateGroup}>
                                <span>Hasta</span>
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    value={local.dateTo}
                                    min={local.dateFrom || minDate || undefined}
                                    max={maxDate || undefined}
                                    onChange={e => handleChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    {hasChanges && (
                        <button className={styles.resetBtn} onClick={handleReset}>
                            Limpiar filtros
                        </button>
                    )}
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.applyBtn} onClick={handleApply}>Aplicar Filtros</button>
                </div>
            </div>
        </div>
    );
};

export default ComentariosFilterModal;