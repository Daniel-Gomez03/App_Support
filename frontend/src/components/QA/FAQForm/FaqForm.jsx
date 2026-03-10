import React, { useState, useEffect } from "react";
import styles from "./FAQForm.module.less";
import { MdClose } from "react-icons/md";
import { getCategories } from "../../../services/Categoryservice";
import { getProducts } from "../../../services/productService";
import { getProductModelsByProduct } from "../../../services/productModelService";

const FAQForm = ({ faq, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        category_id: "",
        product_id: "",
        product_model_id: "",
        faq_question: "",
        faq_answer: "",
        faq_video_url: "",
    });

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [productModels, setProductModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCategories();
        if (faq) {
            setFormData({
                category_id: faq.category_id || "",
                product_id: faq.product_id || "",
                product_model_id: faq.product_model_id || "",
                faq_question: faq.faq_question || "",
                faq_answer: faq.faq_answer || "",
                faq_video_url: faq.faq_video_url || "",
            });
            if (faq.product_id) {
                loadProducts(faq.category_id);
                loadProductModels(faq.product_id);
            }
        }
    }, [faq]);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Error loading categories:", err);
            setError("Error al cargar las categorías");
        }
    };

    const loadProducts = async (categoryId) => {
        try {
            if (categoryId) {
                const data = await getProducts();
                const filtered = data.filter(p => p.category_id == categoryId);
                setProducts(filtered);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Error loading products:", err);
            setError("Error al cargar los productos");
        }
    };

    const loadProductModels = async (productId) => {
        try {
            if (productId) {
                const data = await getProductModelsByProduct(productId);
                setProductModels(data);
            } else {
                setProductModels([]);
            }
        } catch (err) {
            console.error("Error loading product models:", err);
            setError("Error al cargar los modelos");
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData({
            ...formData,
            category_id: categoryId,
            product_id: "",
            product_model_id: "",
        });
        loadProducts(categoryId);
        setProductModels([]);
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        setFormData({
            ...formData,
            product_id: productId,
            product_model_id: "",
        });
        loadProductModels(productId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validar campos requeridos
            if (!formData.category_id || !formData.product_id || !formData.product_model_id || !formData.faq_question || !formData.faq_answer) {
                setError("Por favor completa todos los campos requeridos");
                setLoading(false);
                return;
            }

            await onSubmit(formData);
        } catch (err) {
            setError(err.message || "Error al guardar la pregunta");
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {faq ? "Editar Pregunta Frecuente" : "Nueva Pregunta Frecuente"}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="category">Categoría *</label>
                        <select
                            id="category"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleCategoryChange}
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="product">Tipo de Dispositivo *</label>
                        <select
                            id="product"
                            name="product_id"
                            value={formData.product_id}
                            onChange={handleProductChange}
                            required
                            disabled={!formData.category_id}
                        >
                            <option value="">Seleccione un Modelo</option>
                            {products.map((prod) => (
                                <option key={prod.product_id} value={prod.product_id}>
                                    {prod.product_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="productModel">Modelo *</label>
                        <select
                            id="productModel"
                            name="product_model_id"
                            value={formData.product_model_id}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.product_id}
                        >
                            <option value="">Seleccione un Modelo</option>
                            {productModels.map((model) => (
                                <option key={model.product_model_id} value={model.product_model_id}>
                                    {model.product_model_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="question">Pregunta / Problema Frecuente *</label>
                        <input
                            id="question"
                            type="text"
                            name="faq_question"
                            placeholder="Ej. ¿Cómo reiniciar el dispositivo de fábrica?"
                            value={formData.faq_question}
                            onChange={handleInputChange}
                            required
                            maxLength="255"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="answer">Instrucciones / Solución *</label>
                        <textarea
                            id="answer"
                            name="faq_answer"
                            placeholder="Describe paso a paso la solución..."
                            value={formData.faq_answer}
                            onChange={handleInputChange}
                            required
                            rows="6"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="videoUrl">Link Video Tutorial (YouTube/Vimeo)</label>
                        <input
                            id="videoUrl"
                            type="url"
                            name="faq_video_url"
                            placeholder="Ej. https://www.youtube.com/"
                            value={formData.faq_video_url}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : (faq ? "Actualizar Pregunta" : "Crear Pregunta")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FAQForm;
