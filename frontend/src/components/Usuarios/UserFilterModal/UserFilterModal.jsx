// ============================================
// COMPONENT: USER FILTER MODAL
// Panel de filtros para la tabla de usuarios internos.
// Permite filtrar por rol, cargo y área; la limpieza
// aplica el cambio inmediatamente sin cerrar el modal.
//
// PROPS:
//   isOpen         — booleano; si false, retorna null
//   onClose        — fn(); cierra el modal
//   onApplyFilter  — fn(filters); notifica al padre del filtro activo
//   currentFilters — objeto { rol, cargo, area } con los filtros actuales
//   options        — { roles, cargos, areas } arrays de valores disponibles
//
// ESTADO:
//   filters — copia local de currentFilters; se sincroniza al abrir
//
// FLUJO:
//   handleChange — actualiza filtros locales en cada cambio de select
//   handleApply  — aplica filtros y cierra el modal
//   handleReset  — aplica filtros vacíos sin cerrar el modal
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './UserFilterModal.module.less';
import { MdClose, MdFilterListAlt } from 'react-icons/md';

const EMPTY_FILTERS = { rol: '', cargo: '', area: '' };

const UserFilterModal = ({ isOpen, onClose, onApplyFilter, currentFilters, options }) => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    useEffect(() => {
        if (isOpen) {
            setFilters(currentFilters ?? EMPTY_FILTERS);
        }
    }, [isOpen, currentFilters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onApplyFilter(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        onApplyFilter(EMPTY_FILTERS);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.filterOverlay}>
            <div className={styles.filterModal}>
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
                            {options.roles.map(rol => (
                                <option key={rol} value={rol}>{rol}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="cargo">Cargo</label>
                        <select id="cargo" name="cargo" value={filters.cargo} onChange={handleChange}>
                            <option value="">Todos los cargos</option>
                            <option value="null">Sin asignar</option>
                            {options.cargos.map(cargo => (
                                <option key={cargo} value={cargo}>{cargo}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="area">Área</label>
                        <select id="area" name="area" value={filters.area} onChange={handleChange}>
                            <option value="">Todas las áreas</option>
                            <option value="null">Sin asignar</option>
                            {options.areas.map(area => (
                                <option key={area} value={area}>{area}</option>
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