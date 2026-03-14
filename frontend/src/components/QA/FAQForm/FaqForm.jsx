import React, { useState, useEffect } from "react";
import styles from "./FAQForm.module.less";
import { MdClose } from "react-icons/md";
import { getCategories } from "../../../services/Categoryservice";
import { getProducts } from "../../../services/Productservice";
import { getProductModelsByProduct } from "../../../services/Productmodelservice";

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
        loadCategories();  
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
                if (!isSol) {
                    loadProductModels(faq.product_id);
                }
            }
        }
    }, [faq, categories]);

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
        const selectedCategory = categories.find(cat => cat.category_id == categoryId);
        const isSol = selectedCategory?.category_name.toLowerCase() === "soluciones";
        setFormData({
            ...formData,
            category_id: categoryId,
            product_id: "",
            product_model_id: isSol ? "" : "",
        });
        setIsSolution(isSol);
        loadProducts(categoryId);
        setProductModels([]);
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        setFormData({
            ...formData,
            product_id: productId,
            product_model_id: isSolution ? "" : "",
        });
        if (!isSolution) {
            loadProductModels(productId);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateVideoUrl = (url) => {
        if (!url) return true;

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;

        return youtubeRegex.test(url) || vimeoRegex.test(url);
    };

    const handleCloseForm = () => {
        setFormData({
            category_id: "",
            product_id: "",
            product_model_id: "",
            faq_question: "",
            faq_answer: "",
            faq_video_url: "",
        });
        setIsSolution(false);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.category_id || !formData.product_id || !formData.faq_question || !formData.faq_answer) {
                setError("Por favor completa todos los campos requeridos");
                setLoading(false);
                return;
            }

            if (!isSolution && !formData.product_model_id) {
                setError("Por favor selecciona un modelo");
                setLoading(false);
                return;
            }

            if (formData.faq_video_url && !validateVideoUrl(formData.faq_video_url)) {
                setError("Solo se aceptan enlaces de YouTube o Vimeo");
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
        <div className={styles.modalOverlay}>
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
                    {/* Categoría */}
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

                    {/* Producto y Modelo en dos columnas */}
                    <div className={styles.twoColumnsGroup}>
                        {/* Tipo de Dispositivo/Solución */}
                        <div className={styles.formGroup}>
                            <label htmlFor="product">Tipo de Dispositivo/Solución *</label>
                            <select
                                id="product"
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleProductChange}
                                required
                                disabled={!formData.category_id}
                            >
                                <option value="">Seleccione un Producto</option>
                                {products.map((prod) => (
                                    <option key={prod.product_id} value={prod.product_id}>
                                        {prod.product_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Modelo - Solo si no es solución */}
                        {!isSolution && (
                            <div className={styles.formGroup}>
                                <label htmlFor="productModel">Modelo *</label>
                                <select
                                    id="productModel"
                                    name="product_model_id"
                                    value={formData.product_model_id}
                                    onChange={handleInputChange}
                                    required={!isSolution}
                                    disabled={!formData.product_id || isSolution}
                                >
                                    <option value="">Seleccione un Modelo</option>
                                    {productModels.map((model) => (
                                        <option key={model.product_model_id} value={model.product_model_id}>
                                            {model.product_model_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Pregunta */}
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

                    {/* Respuesta */}
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

                    {/* Video URL */}
                    <div className={styles.formGroup}>
                        <label htmlFor="videoUrl">Link Video Tutorial (YouTube/Vimeo)</label>
                        <input
                            id="videoUrl"
                            type="url"
                            name="faq_video_url"
                            placeholder="Ej. https://www.youtube.com/"
                            value={formData.faq_video_url}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={handleCloseForm}
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