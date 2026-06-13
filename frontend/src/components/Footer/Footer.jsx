// ============================================
// COMPONENT: FOOTER
// Barra inferior estática del layout principal.
// Muestra el aviso de copyright de TBOXSA.
// Renderizado por MainLayout en la parte inferior de cada página.
// ============================================

import React from "react";
import styles from './Footer.module.less';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.text}>Copyright &copy; TBOXSA 2026</p>
        </footer>
    );
};

export default Footer;