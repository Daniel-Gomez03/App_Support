// ============================================
// COMPONENT: HISTORIAL FILTER MODAL
// Modal de filtrado de la bitácora de tickets.
// Permite filtrar por estado, prioridad y rango
// de fechas de creación.
//
// PROPS:
//   isOpen         — controla visibilidad
//   onClose        — cierra sin aplicar
//   currentFilters — estado activo de filtros
//   onApply        — fn(filters); persiste en el padre
//   minDate/maxDate — límites del date picker derivados
//                     de los tickets cargados
//
// FLUJO:
//   local state copia currentFilters al abrirse;
//   handleApply → onApply(local) + onClose
//   handleReset → limpia local, llama onApply({...vacío}) + onClose
//   hasChanges controla visibilidad del botón "Limpiar filtros".
//
// CONSTANTES (módulo):
//   STATUSES — lista completa de estados (id + label)
//   PRIORITIES — opciones de prioridad
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './HistorialFilterModal.module.less';
import { FiX } from 'react-icons/fi';
import { MdFilterListAlt } from 'react-icons/md';

const STATUSES = [
    { id: 1, label: 'Nuevo' },
    { id: 2, label: 'Revisión Garantía' },
    { id: 3, label: 'Por Asignar' },
    { id: 4, label: 'Asignado' },
    { id: 5, label: 'En Proceso' },
    { id: 6, label: 'Pendiente Info' },
    { id: 7, label: 'Escalado' },
    { id: 8, label: 'Sol. Cancelación' },
    { id: 9, label: 'Finalizado' },
    { id: 10, label: 'Cancelado' },
];

const PRIORITIES = ['Alta', 'Media', 'Baja'];

const HistorialFilterModal = ({ isOpen, onClose, currentFilters, onApply, minDate = '', maxDate = '' }) => {
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
        const empty = { status: '', priority: '', dateFrom: '', dateTo: '' };
        setLocal(empty);
        onApply(empty);
        onClose();
    };

    const hasChanges = local.status || local.priority || local.dateFrom || local.dateTo;

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <MdFilterListAlt className={styles.headerIcon} />
                        <h3>Filtrar Historial</h3>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                <div className={styles.body}>

                    <div className={styles.filterSection}>
                        <label className={styles.sectionLabel}>Posición (Estado)</label>
                        <select
                            className={styles.select}
                            value={local.status}
                            onChange={e => handleChange('status', e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            {STATUSES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterSection}>
                        <label className={styles.sectionLabel}>Prioridad</label>
                        <div className={styles.radioGroup}>
                            <label className={`${styles.radioItem} ${local.priority === '' ? styles.selected : ''}`}>
                                <input
                                    type="radio"
                                    name="priority"
                                    value=""
                                    checked={local.priority === ''}
                                    onChange={() => handleChange('priority', '')}
                                />
                                Todas
                            </label>
                            {PRIORITIES.map(p => (
                                <label
                                    key={p}
                                    className={`${styles.radioItem} ${local.priority === p ? styles.selected : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={p}
                                        checked={local.priority === p}
                                        onChange={() => handleChange('priority', p)}
                                    />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <label className={styles.sectionLabel}>Rango de Fecha de Creación</label>
                        {minDate && (
                            <p className={styles.dateHint}>
                                Tickets del <strong>{minDate}</strong> al <strong>{maxDate}</strong>
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
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles.applyBtn} onClick={handleApply}>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistorialFilterModal;