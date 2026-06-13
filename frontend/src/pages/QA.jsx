// ============================================
// PAGE: QA (Preguntas Frecuentes)
// Gestión del banco de FAQs del sistema.
// Permite buscar, filtrar, crear, editar y
// activar/desactivar preguntas frecuentes.
//
// PERMISOS:
//   canRead  — ver listado
//   canEdit  — editar y cambiar estado
//   canWrite — crear nuevas FAQs
//
// CARGA DE DATOS:
//   loadFaqs hace dos llamadas en paralelo (getFaqs +
//   getInactiveFaqs) y concatena ambas listas para que
//   el admin vea activas e inactivas juntas.
//
// FILTRADO (filteredFaqs — useMemo):
//   búsqueda por pregunta, categoría y producto;
//   luego filtros opcionales por categoría/producto/modelo
//   y orden por fecha (recent/oldest) o por estado activo primero.
//
// SOCKET:
//   Suscribe loadFaqs (referencia directa, no wrapper) a 4 eventos
//   para recargar en tiempo real; cleanup con la misma referencia
//   para no eliminar otros listeners del mismo evento.
//
// handleEdit extrae la lógica de setEditingFaq + setShowForm
//   para no recrear el inline arrow en cada render.
// ============================================

import React, { useEffect, useState, useMemo } from "react";
import styles from "./QA.module.less";
import FAQList from "../components/QA/FAQList/FaqList";
import FAQForm from "../components/QA/FAQForm/FaqForm";
import FilterModal from "../components/QA/FilterModal/FilterModal";
import lensIcon from "../assets/icons/Lens-icon.svg";
import { getFaqs, getInactiveFaqs, createFaq, updateFaq, toggleFaqStatus, socket } from "../services/Faqservice";
import { MdFilterListAlt } from "react-icons/md";
import { LuCheck, LuX, LuCircleAlert } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const QA = () => {
    const { user } = useAuth();

    const canRead = user?.Permissions?.some(p => p.Seccion?.module_name === "Q&A" && p.permissions_read === 1);
    const canEdit = user?.Permissions?.some(p => p.Seccion?.module_name === "Q&A" && p.permissions_edit === 1);
    const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === "Q&A" && p.permissions_write === 1);

    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(null);

    const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "", type: "success" });

    const showToast = (title, message, type = "success") => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
    };

    const filterOptions = useMemo(() => ({
        categories: [...new Set(faqs.map(faq => faq.category?.category_name))].filter(Boolean),
        products: [...new Set(faqs.map(faq => faq.product?.product_name))].filter(Boolean),
        productModels: [...new Set(faqs.map(faq => faq.product_model?.product_model_name))].filter(Boolean)
    }), [faqs]);

    const loadFaqs = async () => {
        if (!canRead) return;
        try {
            setLoading(true);
            const [activeFaqs, inactiveFaqs] = await Promise.all([getFaqs(), getInactiveFaqs()]);
            setFaqs([...activeFaqs, ...inactiveFaqs]);
        } catch {
            setFaqs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFaqs();
        document.title = "Soporte | Q&A";
        socket.connect();
        socket.on('faq_created', loadFaqs);
        socket.on('faq_updated', loadFaqs);
        socket.on('faq_deleted', loadFaqs);
        socket.on('faq_toggled', loadFaqs);

        return () => {
            socket.off('faq_created', loadFaqs);
            socket.off('faq_updated', loadFaqs);
            socket.off('faq_deleted', loadFaqs);
            socket.off('faq_toggled', loadFaqs);
        };
    }, [canRead]);

    const handleCreateFaq = async (faqData) => {
        try {
            await createFaq(faqData);
            setShowForm(false);
            showToast("Éxito", "La pregunta ha sido agregada correctamente.");
        } catch (err) {
            showToast("Error de validación", err.message, "error");
        }
    };

    const handleUpdateFaq = async (id, faqData) => {
        try {
            await updateFaq(id, faqData);
            setEditingFaq(null);
            setShowForm(false);
            showToast("Actualizado", "La información se ha actualizado con éxito.");
        } catch (err) {
            showToast("Error al actualizar", err.message, "error");
        }
    };

    const handleToggleStatus = async (id) => {
        if (!canEdit) return showToast("Permiso denegado", "No tienes permisos para cambiar el estado.", "error");
        try {
            await toggleFaqStatus(id);
            loadFaqs();
        } catch {
            showToast("Error", "No se pudo cambiar el estado.", "error");
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setShowForm(true);
    };

    const filteredFaqs = useMemo(() => faqs.filter(faq => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            faq.faq_question.toLowerCase().includes(searchLower) ||
            faq.category?.category_name.toLowerCase().includes(searchLower) ||
            faq.product?.product_name.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        if (appliedFilters) {
            if (appliedFilters.category && faq.category?.category_name !== appliedFilters.category) return false;
            if (appliedFilters.product && faq.product?.product_name !== appliedFilters.product) return false;
            if (appliedFilters.productModel && faq.product_model?.product_model_name !== appliedFilters.productModel) return false;
        }
        return true;
    }).sort((a, b) => {
        if (appliedFilters?.sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
        if (appliedFilters?.sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        return a.faq_status === b.faq_status ? 0 : a.faq_status ? -1 : 1;
    }), [faqs, searchTerm, appliedFilters]);

    return (
        <div className={styles.qaContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Preguntas Frecuentes (Q&A)</h1>
                    <p className={styles.subtitle}>Gestión de problemas frecuentes y soluciones.</p>
                </div>

                <div className={styles.topBar}>
                    <div className={styles.searchBar}>
                        <img src={lensIcon} alt="Buscar" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por problema, modelo o categoría..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        {canWrite && (
                            <button className={styles.createBtn} onClick={() => setShowForm(true)}>
                                + Nueva Pregunta
                            </button>
                        )}
                        <button className={styles.filterBtn} onClick={() => setShowFilter(true)}>
                            <MdFilterListAlt />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingMessage}>Cargando preguntas frecuentes...</div>
            ) : !canRead ? (
                <div className={styles.errorInfo}>No tienes permisos para ver esta sección.</div>
            ) : (
                <div className={styles.faqListContainer}>
                    <FAQList
                        faqs={filteredFaqs}
                        onEdit={canEdit ? handleEdit : null}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>
            )}

            {showForm && (
                <FAQForm
                    faq={editingFaq}
                    onSubmit={editingFaq ? (data) => handleUpdateFaq(editingFaq.faq_id, data) : handleCreateFaq}
                    onClose={() => { setShowForm(false); setEditingFaq(null); }}
                />
            )}

            {showFilter && (
                <FilterModal
                    faqs={faqs}
                    onApplyFilter={setAppliedFilters}
                    onClose={() => setShowFilter(false)}
                    filterOptions={filterOptions}
                />
            )}

            {toastConfig.show && (
                <div className={`${styles.successToast} ${toastConfig.type === 'error' ? styles.errorToast : ''}`}>
                    <div className={styles.toastIcon}>
                        {toastConfig.type === 'success' ? <LuCheck /> : <LuCircleAlert />}
                    </div>
                    <div className={styles.toastContent}>
                        <h4>{toastConfig.title}</h4>
                        <p>{toastConfig.message}</p>
                    </div>
                    <button onClick={() => setToastConfig(prev => ({ ...prev, show: false }))} className={styles.toastClose}>
                        <LuX />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QA;