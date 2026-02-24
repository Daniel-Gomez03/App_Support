import React from 'react';
import styles from './Feedback.module.less';
import { FaStar } from "react-icons/fa";

const Feedback = ({ data }) => {

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      return (
        <FaStar 
            key={index} 
            size={14} 
            color={index < rating ? "#FF9F43" : "#E5E7EB"} 
            style={{ marginLeft: '2px' }}
        />
      );
    });
  };

  return (
    <div className={styles.feedbackCard}>
        <div className={styles.cardHeader}>
            <h3 className={styles.title}>Opinión del Cliente</h3>
        </div>

        <div className={styles.listContainer}>
            {data.length > 0 ? (
                data.map((item, index) => (
                    <div key={index} className={styles.userRow}>
                        
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                                {item.avatar ? (
                                    <img src={item.avatar} alt={item.name} />
                                ) : (
                                    <span>{item.name.charAt(0)}</span>
                                )}
                            </div>
                            <span className={styles.userName}>{item.name}</span>
                        </div>

                        <div className={styles.stars}>
                            {renderStars(item.rating)}
                        </div>
                    </div>
                ))
            ) : (
                <p className={styles.emptyState}>No hay opiniones recientes.</p>
            )}
        </div>

        <div className={styles.footer}>
            <button className={styles.viewAllBtn}>
                Ver todos los comentarios
            </button>
        </div>

    </div>
  );
};

export default Feedback;