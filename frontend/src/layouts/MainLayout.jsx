import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.less';
import { useState } from 'react';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layoutContainer}>

      <Sidebar isOpen={isSidebarOpen} />

      <main className={`${styles.mainContent} ${!isSidebarOpen ? styles.expanded : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className={styles.pageContent}>
          {children}
        </div>
        <Footer />
      </main>

    </div>
  );
};

export default MainLayout;