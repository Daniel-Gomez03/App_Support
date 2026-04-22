import React from 'react';
import styles from './TicketsTabs.module.less'; 

const TicketsTabs = ({ activeTab, setActiveTab, nuevosCount, backlogCount }) => {
    return (
        <div className={styles.tabsContainer}>
            <button 
                className={`${styles.tabButton} ${activeTab === 1 ? styles.active : ''}`}
                onClick={() => setActiveTab(1)}
            >
                Entrantes
                <span className={styles.badge}>{nuevosCount}</span>
            </button>
            
            <button 
                className={`${styles.tabButton} ${activeTab === 2 ? styles.active : ''}`}
                onClick={() => setActiveTab(2)}
            >
                Backlog (Por Asignar)
                <span className={styles.badge}>{backlogCount}</span>
            </button>
        </div>
    );
};

export default TicketsTabs;