import React, { useState } from 'react';
import styles from './FilterModal.module.less';

const FilterModal = ({ faqs, onApplyFilter, onClose, filterOptions }) => {
    const [selectedFilters, setSelectedFilters] = useState({
        sortBy: '',
        category: '',
        product: '',
        productModel: ''
    });

    const [availableProducts, setAvailableProducts] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);

    const handleCategoryChange = (value) => {
        setSelectedFilters(prev => ({
            ...prev,
            category: value,
            product: '',
            productModel: ''
        }));

        // Filtrar productos disponibles en esa categoría
        if (value) {
            const products = [...new Set(
                faqs
                    .filter(faq => faq.category?.category_name === value)
                    .map(faq => faq.product?.product_name)
                    .filter(Boolean)
            )];
            setAvailableProducts(products);
        } else {
            setAvailableProducts([]);
        }
        setAvailableModels([]);
    };

    const handleProductChange = (value) => {
        setSelectedFilters(prev => ({
            ...prev,
            product: value,
            productModel: ''
        }));

        // Filtrar modelos disponibles en ese producto
        if (value && selectedFilters.category) {
            const models = [...new Set(
                faqs
                    .filter(faq => 
                        faq.category?.category_name === selectedFilters.category &&
                        faq.product?.product_name === value
                    )
                    .map(faq => faq.product_model?.product_model_name)
                    .filter(Boolean)
            )];
            setAvailableModels(models);
        } else {
            setAvailableModels([]);
        }
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'category') {
            handleCategoryChange(value);
        } else if (filterType === 'product') {
            handleProductChange(value);
        } else {
            setSelectedFilters(prev => ({
                ...prev,
                [filterType]: value
            }));
        }
    };

    const handleApply = () => {
        onApplyFilter(selectedFilters);
        onClose();
    };

    const handleReset = () => {
        setSelectedFilters({
            sortBy: '',
            category: '',
            product: '',
            productModel: ''
        });
        setAvailableProducts([]);
        setAvailableModels([]);
    };

    return (
        <div className={styles.filterOverlay}>
            <div className={styles.filterModal}>
                <h2>Filtros</h2>

                <div className={styles.filterGroup}>
                    <label>Ordenar por:</label>
                    <select
                        value={selectedFilters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        <option value="">Sin ordenar</option>
                        <option value="recent">Más reciente</option>
                        <option value="oldest">Más antigua</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Categoría:</label>
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
                    <label>Producto:</label>
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
                    <label>Modelo:</label>
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

                <div className={styles.filterActions}>
                    <button className={styles.resetBtn} onClick={handleReset}>
                        Limpiar
                    </button>
                    <button className={styles.applyBtn} onClick={handleApply}>
                        Aplicar Filtros
                    </button>
                </div>

                <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>
        </div>
    );
};

export default FilterModal;