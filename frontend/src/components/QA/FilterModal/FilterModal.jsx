// ============================================
// COMPONENT: FILTER MODAL
// Panel lateral/modal para filtrar y ordenar FAQs.
//
// PROPS:
//   faqs          — array completo de FAQs (para derivar
//                   productos y modelos disponibles en cascada)
//   onApplyFilter — fn(selectedFilters); aplica los filtros en QA.jsx
//   onClose       — cierra el modal
//   filterOptions — { categories: string[] } precalculadas por QA.jsx
//
// ESTADO:
//   selectedFilters  — { sortBy, category, product, productModel }
//   availableProducts — derivado de faqs según categoría activa
//   availableModels   — derivado de faqs según categoría + producto activos
//
// CASCADA:
//   Al cambiar categoría → resetea product y productModel
//   Al cambiar product   → resetea productModel
//   Los efectos recalculan las listas disponibles en cada cambio.
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.less';
import { MdClose, MdRestartAlt, MdCheck } from "react-icons/md";

const INITIAL_FILTERS = {
    sortBy: '',
    category: '',
    product: '',
    productModel: ''
};

const FilterModal = ({ faqs = [], onApplyFilter, onClose, filterOptions }) => {
    const [selectedFilters, setSelectedFilters] = useState(INITIAL_FILTERS);

    const [availableProducts, setAvailableProducts] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        if (selectedFilters.category) {
            const products = [...new Set(
                faqs
                    .filter(faq => faq?.category?.category_name === selectedFilters.category)
                    .map(faq => faq?.product?.product_name)
                    .filter(Boolean)
            )];
            setAvailableProducts(products);
        } else {
            setAvailableProducts([]);
        }
    }, [selectedFilters.category, faqs]);

    useEffect(() => {
        if (selectedFilters.product && selectedFilters.category) {
            const models = [...new Set(
                faqs
                    .filter(faq =>
                        faq?.category?.category_name === selectedFilters.category &&
                        faq?.product?.product_name === selectedFilters.product
                    )
                    .map(faq => faq?.product_model?.product_model_name)
                    .filter(Boolean)
            )];
            setAvailableModels(models);
        } else {
            setAvailableModels([]);
        }
    }, [selectedFilters.product, selectedFilters.category, faqs]);

    const handleFilterChange = (filterType, value) => {
        setSelectedFilters(prev => {
            const newState = { ...prev, [filterType]: value };

            if (filterType === 'category') {
                newState.product = '';
                newState.productModel = '';
            }
            if (filterType === 'product') {
                newState.productModel = '';
            }

            return newState;
        });
    };

    const handleApply = () => {
        onApplyFilter(selectedFilters);
        onClose();
    };

    const handleReset = () => setSelectedFilters(INITIAL_FILTERS);

    return (
        <div className={styles.filterOverlay}>
            <div className={styles.filterModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.titleArea}>
                        <h2 className={styles.modalTitle}>Filtrar Preguntas</h2>
                        <p className={styles.modalSubtitle}>Personaliza tu vista de Q&A</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.filterGroup}>
                        <label>Ordenar por fecha:</label>
                        <select
                            value={selectedFilters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                            <option value="">Predeterminado (Estado)</option>
                            <option value="recent">Más recientes primero</option>
                            <option value="oldest">Más antiguas primero</option>
                        </select>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.filterGroup}>
                        <label>Filtrar por Categoría:</label>
                        <select
                            value={selectedFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {filterOptions?.categories?.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Filtrar por Producto:</label>
                        <select
                            value={selectedFilters.product}
                            onChange={(e) => handleFilterChange('product', e.target.value)}
                            disabled={!selectedFilters.category}
                        >
                            <option value="">Todos los productos</option>
                            {availableProducts.map((prod, idx) => (
                                <option key={idx} value={prod}>{prod}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Filtrar por Modelo:</label>
                        <select
                            value={selectedFilters.productModel}
                            onChange={(e) => handleFilterChange('productModel', e.target.value)}
                            disabled={!selectedFilters.product}
                        >
                            <option value="">Todos los modelos</option>
                            {availableModels.map((model, idx) => (
                                <option key={idx} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.filterActions}>
                    <button className={styles.resetBtn} onClick={handleReset} title="Restablecer">
                        <MdRestartAlt /> Limpiar
                    </button>
                    <button className={styles.applyBtn} onClick={handleApply}>
                        <MdCheck /> Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;