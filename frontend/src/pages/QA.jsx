import React, { useEffect, useState } from "react";
import styles from "./QA.module.less";
import FAQList from "../components/QA/FAQList/FaqList";
import FAQForm from "../components/QA/FAQForm/FaqForm";
import lensIcon from "../assets/icons/Lens-icon.svg"
import { getFaqs, getInactiveFaqs, createFaq, updateFaq, toggleFaqStatus } from "../services/Faqservice";
import { MdFilterListAlt } from "react-icons/md";
import echo from '../services/echo';

const QA = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            } catch (err) {
                setError("Error al cargar las preguntas frecuentes");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

    // useEffect para cargar inicial y escuchar cambios
    useEffect(() => {
        loadFaqs();
        document.title = "Soporte | Q&A";

        // Escuchar cambios en tiempo real
        const channel = echo.channel('faqs');
        channel.listen('FaqStatusToggled', (data) => {
            console.log('FAQ toggled:', data.faq);
            // Actualizar el FAQ en la lista
            setFaqs(prevFaqs => {
                const updated = prevFaqs.map(faq =>
                    faq.faq_id === data.faq.faq_id
                        ? { ...faq, faq_status: data.faq.faq_status }
                        : faq
                ).sort((a, b) => {
                    if (a.faq_status === b.faq_status) return 0;
                    return a.faq_status ? -1 : 1;
                });
                return updated;
            });
        });

        return () => {
            channel.stopListening('FaqStatusToggled');
        };
    }, []);

    // Crear nueva FAQ
    const handleCreateFaq = async (faqData) => {
        try {
            await createFaq(faqData);
            await loadFaqs();
            setShowForm(false);
        } catch (err) {
            setError("Error al crear la pregunta frecuente");
            console.error(err);
        }
    };

    // Actualizar FAQ
    const handleUpdateFaq = async (id, faqData) => {
        try {
            await updateFaq(id, faqData);
            await loadFaqs();
            setEditingFaq(null);
            setShowForm(false);
        } catch (err) {
            setError("Error al actualizar la pregunta frecuente");
            console.error(err);
        }
    };

    // Toggle estado FAQ
    const handleToggleStatus = async (id) => {
        try {
            await toggleFaqStatus(id);
            // El evento de broadcast actualizará automáticamente la UI
        } catch (err) {
            setError("Error al cambiar el estado de la pregunta");
            console.error(err);
        }
    };

    // Filtrar y ordenar FAQs según búsqueda (activos primero, luego inactivos)
    const filteredFaqs = faqs
        .filter(faq =>
            faq.faq_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.faq_answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            // Activos (true) primero, inactivos (false) después
            if (a.faq_status === b.faq_status) return 0;
            return a.faq_status ? -1 : 1;
        });

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
                        <button className={styles.filterBtn} title="Filtros">
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
                <FAQList
                    faqs={filteredFaqs}
                    onEdit={handleEditFaq}
                    onToggleStatus={handleToggleStatus}
                />
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
        </div>
    );
};

export default QA;