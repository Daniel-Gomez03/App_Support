// ============================================
// COMPONENT: FAQ LIST
// Contenedor de la lista de FAQItems.
// Componente puramente presentacional: recibe el
// array ya filtrado/ordenado desde QA.jsx y lo
// renderiza como una columna de FAQItems.
//
// PROPS:
//   faqs           — array de FAQs filtradas (desde QA.jsx useMemo)
//   onEdit         — fn(faq) | null; se pasa directo a cada FAQItem
//   onToggleStatus — fn(faq_id); se pasa directo a cada FAQItem
//
// Retorna null si el array está vacío (sin mensajes de estado —
// el mensaje de "sin resultados" lo gestiona el padre o el filtro).
// ============================================

import React from "react";
import styles from "./FAQList.module.less";
import FAQItem from "../FAQItem/FaqItem";

const FAQList = ({ faqs, onEdit, onToggleStatus }) => {
    if (!faqs?.length) return null;

    return (
        <div className={styles.faqList}>
            {faqs.map((faq) => (
                <FAQItem
                    key={faq.faq_id}
                    faq={faq}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
};

export default FAQList;