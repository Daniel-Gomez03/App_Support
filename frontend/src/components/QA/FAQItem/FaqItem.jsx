import React, { useState } from "react";
import styles from "./FAQItem.module.less";
import qaIcon from "../../../assets/icons/QA-icon.svg";
import editIcon from "../../../assets/icons/Edit-icon.svg";
import { TbPointFilled } from "react-icons/tb";
import { FiTag } from "react-icons/fi";
import { RiComputerLine } from "react-icons/ri";
import { HiOutlineCube } from "react-icons/hi2";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaRegCirclePlay } from "react-icons/fa6";

const FAQItem = ({ faq, onEdit, onToggleStatus }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const canEdit = typeof onEdit === 'function';
    const canToggle = typeof onToggleStatus === 'function';

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (canEdit) onEdit(faq);
    };

    const handleToggleClick = (e) => {
        e.stopPropagation();
        if (canToggle) onToggleStatus(faq.faq_id);
    };

    return (
        <div
            className={`${styles.faqCard} ${isExpanded ? styles.expanded : ''} ${!faq.faq_status ? styles.inactive : ''}`}
            onClick={handleCardClick}
        >
            <div className={styles.faqHeader}>
                <div className={styles.faqContent}>
                    <div className={`${styles.faqIcon} ${isExpanded ? styles.active : ''}`}>
                        <img src={qaIcon} alt="Icono Pregunta" className={styles.qaIconImg} />
                    </div>
                    <div className={styles.faqTextContent}>
                        <h3 className={styles.faqQuestion}>{faq.faq_question}</h3>
                        <div className={styles.faqTags}>
                            {faq.category && (
                                <span className={`${styles.tag} ${styles.categoryTag}`}>
                                    <FiTag className={styles.tagIcon} />
                                    {faq.category.category_name}
                                </span>
                            )}
                            {faq.product && (
                                <span className={`${styles.tag} ${styles.productTag}`}>
                                    <RiComputerLine className={styles.tagIcon} />
                                    {faq.product.product_name}
                                </span>
                            )}
                            {faq.product_model && (
                                <span className={`${styles.tag} ${styles.modelTag}`}>
                                    <HiOutlineCube className={styles.tagIcon} />
                                    {faq.product_model.product_model_name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.faqActions}>
                    <div className={styles.actionsTop}>
                        <span className={faq.faq_status ? styles.statusActive : styles.statusInactive}>
                            <TbPointFilled className={styles.statusDot} />
                            {faq.faq_status ? "Activo" : "Inactivo"}
                        </span>

                        {canEdit && (
                            <button
                                className={styles.editBtn}
                                onClick={handleEditClick}
                                title="Editar Pregunta"
                            >
                                <img src={editIcon} alt="Editar" className={styles.editIconImg} />
                            </button>
                        )}
                    </div>

                    {canToggle && (
                        <div className={styles.toggleContainer} onClick={handleToggleClick}>
                            <input
                                type="checkbox"
                                className={styles.toggle}
                                checked={faq.faq_status}
                                readOnly
                                id={`toggle-${faq.faq_id}`}
                            />
                            <label htmlFor={`toggle-${faq.faq_id}`} className={styles.toggleLabel}></label>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${styles.faqBody} ${isExpanded ? styles.show : ''}`}>
                <div className={styles.divider}></div>
                <div className={styles.answerSection}>
                    <div className={styles.answerHeader}>
                        <span className={styles.answerTitle}>INSTRUCCIONES / SOLUCIÓN</span>
                        <IoMdArrowDropdown className={`${styles.expandIcon} ${isExpanded ? styles.rotated : ''}`} />
                    </div>
                    <p className={styles.answerText}>{faq.faq_answer}</p>
                </div>

                {faq.faq_video_url && (
                    <div className={styles.videoLink}>
                        <FaRegCirclePlay className={styles.videoLinkIcon} />
                        <a
                            href={faq.faq_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            Ver Video Tutorial
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FAQItem;