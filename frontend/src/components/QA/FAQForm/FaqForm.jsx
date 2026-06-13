// ============================================
// COMPONENT: FAQ FORM
// Modal para crear o editar una FAQ.
//
// PROPS:
//   faq      — null = modo creación; objeto = modo edición
//   onSubmit — fn(cleanData); en edición QA.jsx lo envuelve
//              con el id; errores se propagan al catch local
//   onClose  — cierra el modal
//
// ESTADO:
//   formData       — campos del formulario (category, product,
//                    product_model, question, answer, video_url)
//   categories /
//   products /
//   productModels  — listas para los selects en cascada
//   isSolution     — true cuando la categoría seleccionada es
//                    "Soluciones"; oculta el selector de modelo
//   loading / error — control de envío y feedback inline
//
// SELECTS EN CASCADA:
//   1. Categoría → loadProducts filtra por category_id
//   2. Producto  → loadProductModels (solo si !isSolution)
//   Al cambiar categoría se resetean product y product_model.
//
// VALIDACIÓN (handleSubmit):
//   - faq_question ≥ 10 chars (después de trim)
//   - faq_answer   ≥ 20 chars (después de trim)
//   - faq_video_url: solo YouTube o Vimeo (VIDEO_REGEX)
//   handleInputChange bloquea espacios al inicio en tiempo real
//   (complementa el trim() del submit).
//
// MODO EDICIÓN:
//   El segundo useEffect se dispara cuando llegan tanto `faq`
//   como `categories` (cargadas asincrónicamente); reconstituye
//   el estado completo incluyendo los selects en cascada.
// ============================================

import React, { useState, useEffect } from "react";
import styles from "./FAQForm.module.less";
import { MdClose } from "react-icons/md";
import { getCategories } from "../../../services/Categoryservice";
import { getProducts } from "../../../services/Productservice";
import { getProductModelsByProduct } from "../../../services/Productmodelservice";

const VIDEO_REGEX = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie|vimeo)\.(com|be)\//;

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
    const [isSolution, setIsSolution] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch {
                setError("Error al cargar las categorías");
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (faq && categories.length > 0) {
            setFormData({
                category_id: faq.category_id || "",
                product_id: faq.product_id || "",
                product_model_id: faq.product_model_id || "",
                faq_question: faq.faq_question || "",
                faq_answer: faq.faq_answer || "",
                faq_video_url: faq.faq_video_url || "",
            });

            const selectedCategory = categories.find(cat => cat.category_id == faq.category_id);
            const isSol = selectedCategory?.category_name.toLowerCase() === "soluciones";
            setIsSolution(isSol);

            if (faq.product_id) {
                loadProducts(faq.category_id);
                if (!isSol) loadProductModels(faq.product_id);
            }
        }
    }, [faq, categories]);

    const loadProducts = async (categoryId) => {
        try {
            const data = await getProducts();
            setProducts(data.filter(p => p.category_id == categoryId));
        } catch {
            setError("Error al cargar los productos");
        }
    };

    const loadProductModels = async (productId) => {
        try {
            const data = await getProductModelsByProduct(productId);
            setProductModels(data);
        } catch {
            setError("Error al cargar los modelos");
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        const selectedCategory = categories.find(cat => cat.category_id == categoryId);
        const isSol = selectedCategory?.category_name.toLowerCase() === "soluciones";

        setFormData({ ...formData, category_id: categoryId, product_id: "", product_model_id: "" });
        setIsSolution(isSol);
        setProductModels([]);
        if (categoryId) loadProducts(categoryId);
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        setFormData({ ...formData, product_id: productId, product_model_id: "" });
        if (productId && !isSolution) loadProductModels(productId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (value.startsWith(' ')) return;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanData = {
            ...formData,
            faq_question: formData.faq_question.trim(),
            faq_answer: formData.faq_answer.trim(),
            faq_video_url: formData.faq_video_url.trim()
        };

        if (cleanData.faq_question.length < 10) {
            setError("El asunto debe tener al menos 10 caracteres reales.");
            setLoading(false);
            return;
        }
        if (cleanData.faq_answer.length < 20) {
            setError("Las instrucciones deben tener al menos 20 caracteres reales.");
            setLoading(false);
            return;
        }
        if (cleanData.faq_video_url && !VIDEO_REGEX.test(cleanData.faq_video_url)) {
            setError("Solo se aceptan enlaces de YouTube o Vimeo.");
            setLoading(false);
            return;
        }

        try {
            await onSubmit(cleanData);
        } catch (err) {
            setError(err.message || "Error al procesar la solicitud");
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {faq ? "Editar Pregunta" : "Nueva Pregunta"}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}><MdClose /></button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Categoría *</label>
                        <select name="category_id" value={formData.category_id} onChange={handleCategoryChange} required>
                            <option value="">Selecciona una categoría</option>
                            {categories.map(cat => (
                                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.twoColumnsGroup}>
                        <div className={styles.formGroup}>
                            <label>Producto *</label>
                            <select name="product_id" value={formData.product_id} onChange={handleProductChange} required disabled={!formData.category_id}>
                                <option value="">Seleccione un Producto</option>
                                {products.map(prod => (
                                    <option key={prod.product_id} value={prod.product_id}>{prod.product_name}</option>
                                ))}
                            </select>
                        </div>

                        {!isSolution && (
                            <div className={styles.formGroup}>
                                <label>Modelo *</label>
                                <select name="product_model_id" value={formData.product_model_id} onChange={handleInputChange} required disabled={!formData.product_id}>
                                    <option value="">Seleccione un Modelo</option>
                                    {productModels.map(model => (
                                        <option key={model.product_model_id} value={model.product_model_id}>{model.product_model_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Asunto / Pregunta *</label>
                        <input
                            type="text"
                            name="faq_question"
                            placeholder="Mínimo 10 caracteres (sin espacios al inicio)"
                            value={formData.faq_question}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Instrucciones / Solución *</label>
                        <textarea
                            name="faq_answer"
                            placeholder="Mínimo 20 caracteres (sin espacios al inicio)"
                            value={formData.faq_answer}
                            onChange={handleInputChange}
                            required
                            rows="5"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Link Video Tutorial *</label>
                        <input
                            type="url"
                            name="faq_video_url"
                            placeholder="https://www.youtube.com/..."
                            value={formData.faq_video_url}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Guardando..." : (faq ? "Actualizar" : "Crear")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FAQForm;