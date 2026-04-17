import React, { useState, useEffect } from 'react';
import styles from './UserFilterModal.module.less';
import { MdClose, MdFilterListAlt } from 'react-icons/md';

const UserFilterModal = ({ isOpen, onClose, onApplyFilter, currentFilters, options }) => {
    const [filters, setFilters] = useState({
        rol: '',
        cargo: '',
        area: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFilters(currentFilters || { rol: '', cargo: '', area: '' });
        }
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApply = () => {
        onApplyFilter(filters);
        onClose();
    };

    const handleReset = () => {
        const emptyFilters = { rol: '', cargo: '', area: '' };
        setFilters(emptyFilters);
        onApplyFilter(emptyFilters);
    };

    return (
        <div className={styles.filterOverlay} >
            <div className={styles.filterModal} >
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <MdFilterListAlt className={styles.headerIcon} />
                        <h2>Filtros de Búsqueda</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.formGroup}>
                        <label htmlFor="rol">Rol en el Sistema</label>
                        <select id="rol" name="rol" value={filters.rol} onChange={handleChange}>
                            <option value="">Todos los roles</option>
                            <option value="null">Sin asignar</option>
                            {options.roles.map((rol, index) => (
                                <option key={index} value={rol}>{rol}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="cargo">Cargo</label>
                        <select id="cargo" name="cargo" value={filters.cargo} onChange={handleChange}>
                            <option value="">Todos los cargos</option>
                            <option value="null">Sin asignar</option>
                            {options.cargos.map((cargo, index) => (
                                <option key={index} value={cargo}>{cargo}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="area">Área</label>
                        <select id="area" name="area" value={filters.area} onChange={handleChange}>
                            <option value="">Todas las áreas</option>
                            <option value="null">Sin asignar</option>
                            {options.areas.map((area, index) => (
                                <option key={index} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.resetBtn} onClick={handleReset}>
                        Limpiar
                    </button>
                    <button className={styles.applyBtn} onClick={handleApply}>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserFilterModal;