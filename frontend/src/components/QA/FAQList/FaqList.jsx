import React from "react";
import styles from "./FAQList.module.less";
import FAQItem from "../FAQItem/FaqItem";

const FAQList = ({ faqs, onEdit, onToggleStatus }) => {
    if (!faqs || faqs.length === 0) {
        return null; 
    }

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