import React, { useEffect, useState } from "react";
import styles from "./QA.module.less";
import FAQList from "../components/QA/FAQList/FaqList";
import FAQForm from "../components/QA/FAQForm/FaqForm";
import FilterModal from "../components/QA/FilterModal/FilterModal";
import lensIcon from "../assets/icons/Lens-icon.svg"
import { getFaqs, getInactiveFaqs, createFaq, updateFaq, toggleFaqStatus } from "../services/Faqservice";
import { MdFilterListAlt } from "react-icons/md";
import { connectSocket } from "../services/socketService";
import { LuCheck, LuX } from "react-icons/lu"

const QA = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(null);
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        products: [],
        productModels: []
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const loadFaqs = async () => {
        try {
            setLoading(true);
            const [activeFaqs, inactiveFaqs] = await Promise.all([
                getFaqs(),
                getInactiveFaqs()
            ]);
            const allFaqs = [...activeFaqs, ...inactiveFaqs];
            setFaqs(allFaqs);
            setError(null);

            const categories = [...new Set(allFaqs.map(faq => faq.category?.category_name))].filter(Boolean);
            const products = [...new Set(allFaqs.map(faq => faq.product?.product_name))].filter(Boolean);
            const productModels = [...new Set(allFaqs.map(faq => faq.product_model?.product_model_name))].filter(Boolean);

            setFilterOptions({
                categories,
                products,
                productModels
            })
        } catch (err) {
            setError("Error al cargar las preguntas frecuentes");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFaqs();
        document.title = "Soporte | Q&A";

        const socket = connectSocket();

        socket.on('faq_toggled', (data) => {
            console.log('FAQ toggled via Socket:', data);
            setFaqs(prevFaqs => {
                const faqToMove = prevFaqs.find(faq => faq.faq_id === data.faq_id);
                const otherFaqs = prevFaqs.filter(faq => faq.faq_id !== data.faq_id);

                if (faqToMove) {
                    faqToMove.faq_status = data.new_status;
                }

                const sorted = [
                    ...otherFaqs.filter(faq => faq.faq_status === true),
                    ...otherFaqs.filter(faq => faq.faq_status === false),
                    faqToMove
                ].filter(Boolean);

                return sorted;
            });
        });

        socket.on('faq_created', (data) => {
            console.log('FAQ creada via Socket:', data);
            loadFaqs();
        });

        socket.on('faq_updated', (data) => {
            console.log('FAQ actualizada via Socket:', data);
            loadFaqs();
        });

        socket.on('faq_deleted', (data) => {
            console.log('FAQ eliminada via Socket:', data);
            loadFaqs();
        });

        return () => {
            socket.off('faq_toggled');
            socket.off('faq_created');
            socket.off('faq_updated');
            socket.off('faq_deleted');
        };
    }, []);

    // Crear nueva FAQ
    const handleCreateFaq = async (faqData) => {
        try {
            await createFaq(faqData);
            setShowForm(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
            setError("Error al crear la pregunta frecuente");
            console.error(err);
        }
    };

    // Actualizar FAQ
    const handleUpdateFaq = async (id, faqData) => {
        try {
            await updateFaq(id, faqData);
            setEditingFaq(null);
            setShowForm(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
            setError("Error al actualizar la pregunta frecuente");
            console.error(err);
        }
    };

    // Toggle estado FAQ
    const handleToggleStatus = async (id) => {
        try {
            await toggleFaqStatus(id);
            await loadFaqs();
        } catch (err) {
            setError("Error al cambiar el estado de la pregunta");
            console.error(err);
        }
    };

    // Filtrar y ordenar FAQs según búsqueda 
    const filteredFaqs = faqs
        .filter(faq => {
            const matchesSearch = faq.faq_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.faq_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.product?.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.product_model?.product_model_name.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (appliedFilters) {
                if (appliedFilters.category && faq.category?.category_name.toLowerCase() !== appliedFilters.category.toLowerCase()) {
                    return false;
                }
                if (appliedFilters.product && faq.product?.product_name.toLowerCase() !== appliedFilters.product.toLowerCase()) {
                    return false;
                }
                if (appliedFilters.productModel && faq.product_model?.product_model_name.toLowerCase() !== appliedFilters.productModel.toLowerCase()) {
                    return false;
                }
            }
            return true;
        })

        .sort((a, b) => {
            if (appliedFilters?.sortBy === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            if (appliedFilters?.sortBy === 'recent') {
                return new Date(b.created_at) - new Date(a.created_at);
            }

            if (a.faq_status === b.faq_status) return 0;
            return a.faq_status ? -1 : 1;
        })

    const handleEditFaq = (faq) => {
        setEditingFaq(faq);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingFaq(null);
    };

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
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.createBtn}
                            onClick={() => setShowForm(true)}
                        >
                            + Nueva Pregunta
                        </button>
                        <button className={styles.filterBtn} title="Filtros" onClick={() => setShowFilter(true)}>
                            <MdFilterListAlt />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className={styles.loadingMessage}>Cargando preguntas frecuentes...</div>
            ) : filteredFaqs.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>No hay preguntas frecuentes agregadas</p>
                </div>
            ) : (
                <div className={styles.faqListContainer}>
                    <FAQList
                        faqs={filteredFaqs}
                        onEdit={handleEditFaq}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>
            )}

            {showForm && (
                <FAQForm
                    faq={editingFaq}
                    onSubmit={editingFaq ?
                        (data) => handleUpdateFaq(editingFaq.faq_id, data) :
                        handleCreateFaq
                    }
                    onClose={handleCloseForm}
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
            {showSuccess && (
                <div className={styles.successToast}>
                    <div className={styles.toastIcon}>
                        <LuCheck className={styles.checkIcon} />
                    </div>
                    <div className={styles.toastContent}>
                        <h4>Se ha agregado una pregunta exitosamente</h4>
                        <p>Ha agregado una nueva pregunta frecuente, ahora los usuarios podrán verla</p>
                    </div>
                    <button onClick={() => setShowSuccess(false)} className={styles.toastClose}>
                        <LuX />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QA;