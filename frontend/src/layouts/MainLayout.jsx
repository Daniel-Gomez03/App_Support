// ============================================
// COMPONENT: MAIN LAYOUT
// Shell estructural de todas las rutas protegidas de la aplicación.
// Combina Sidebar, Header, área de contenido (children) y Footer
// en una disposición de dos columnas (sidebar fijo + main fluido).
//
// PROPS:
//   children — página activa inyectada por el router
//
// ESTADO:
//   isSidebarOpen — controla si el sidebar está expandido o colapsado.
//     Se inicializa con true en pantallas > 768px y false en móvil,
//     usando window.innerWidth en el momento del primer render.
//     toggleSidebar se pasa tanto al Header (botón de hamburguesa)
//     como al Sidebar (botón interno de colapso).
// ============================================

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.less';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

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