// ============================================
// COMPONENT: WARRANTY FILTER MODAL (Garantías)
// Modal de filtrado de garantías por vigencia.
//
// PROPS:
//   isOpen         — controla visibilidad
//   onClose        — cierra el modal
//   currentFilters — objeto con el estado actual
//                    de filtros { status: 'all'|'active'|'expired' }
//   onApply        — fn(updater | object); acepta tanto
//                    un updater funcional como un objeto
//                    directo para resetear filtros
//
// Los filtros se aplican en tiempo real al hacer clic
// en cada opción (handleFilterChange llama onApply
// inmediatamente). "Aplicar Filtros" solo cierra el modal.
// ============================================

import React from 'react';
import { LuX, LuFilter, LuUndo2, LuCheck } from 'react-icons/lu';
import styles from './WarrantyFilterModal.module.less';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todas las garantías' },
    { value: 'active', label: 'Solo Vigentes' },
    { value: 'expired', label: 'Solo Expiradas' },
];

const WarrantyFilterModal = ({ isOpen, onClose, currentFilters, onApply }) => {

    if (!isOpen) return null;

    const handleFilterChange = (field, value) => {
        onApply(prev => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        onApply({ status: 'all' });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <LuFilter className={styles.headerIcon} />
                        <h2>Filtrar Garantías</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <LuX />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.filterSection}>
                        <label className={styles.sectionLabel}>Vigencia de Garantía</label>
                        <div className={styles.filterOptions}>
                            {STATUS_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`${styles.optionBtn} ${currentFilters.status === opt.value ? styles.active : ''}`}
                                    onClick={() => handleFilterChange('status', opt.value)}
                                >
                                    <div className={styles.radioCircle}></div>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.resetBtn} onClick={resetFilters}>
                        <LuUndo2 /> Restablecer
                    </button>
                    <button className={styles.applyBtn} onClick={onClose}>
                        <LuCheck /> Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarrantyFilterModal;