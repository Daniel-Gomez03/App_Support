import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
// import Header from '../components/Header/Header';
import styles from './MainLayout.module.less';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      
      {/* 1. Sidebar Fijo a la Izquierda */}
      <Sidebar />
      
      {/* 2. Área Principal (Header + Contenido) */}
      <main className={styles.mainContent}>
        {/* <Header />
         */}
        {/* Aquí se inyectan las páginas (Dashboard, Tickets, etc) */}
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>

    </div>
  );
};

export default MainLayout;