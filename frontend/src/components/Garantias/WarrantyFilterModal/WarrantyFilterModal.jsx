import React from 'react';
import { LuX, LuFilter, LuUndo2, LuCheck } from 'react-icons/lu';
import styles from './WarrantyFilterModal.module.less';

const WarrantyFilterModal = ({ isOpen, onClose, currentFilters, onApply }) => {

    if (!isOpen) return null;

    const handleFilterChange = (field, value) => {
        onApply(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetFilters = () => {
        onApply({
            status: 'all',
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                            <button
                                className={`${styles.optionBtn} ${currentFilters.status === 'all' ? styles.active : ''}`}
                                onClick={() => handleFilterChange('status', 'all')}
                            >
                                <div className={styles.radioCircle}></div>
                                Todas las garantías
                            </button>

                            <button
                                className={`${styles.optionBtn} ${currentFilters.status === 'active' ? styles.active : ''}`}
                                onClick={() => handleFilterChange('status', 'active')}
                            >
                                <div className={styles.radioCircle}></div>
                                Solo Vigentes
                            </button>

                            <button
                                className={`${styles.optionBtn} ${currentFilters.status === 'expired' ? styles.active : ''}`}
                                onClick={() => handleFilterChange('status', 'expired')}
                            >
                                <div className={styles.radioCircle}></div>
                                Solo Expiradas
                            </button>
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