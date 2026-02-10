import React from 'react';
import { FaUser, FaLock } from 'react-icons/fa'; 
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './Login.module.less';

const Login = () => {
    return (
        <div className={styles.loginContainer}>

            <div className={styles.card}>

                <div className={styles.leftSide}>
                    <div className={styles.imagePlaceholder}>
                        <span>Ilustración Aquí</span>
                    </div>
                </div>

                <div className={styles.rightSide}>

                    <div className={styles.header}>
                        <div className={styles.logoPlaceholder}>
                            <div className={styles.logoIcon}>📦</div>
                            <div className={styles.logoText}>
                                <h1>TBOXSA</h1>
                                <small>THINK OUTSIDE THE BOX</small>
                            </div>
                        </div>

                        <h2 className={styles.welcomeTitle}>BIENVENIDO</h2>
                    </div>

                    <form>
                        <Input
                            label="Correo Electrónico"
                            placeholder="nombre@tboxsa.com"
                            type="email"
                            icon={FaUser}
                        />

                        <Input
                            label="Contraseña"
                            placeholder="••••••••"
                            type="password"
                            icon={FaLock}
                        />

                        <div className={styles.formFooter}>
                            <label className={styles.checkboxContainer}>
                                <input type="checkbox" />
                                <span>Recuérdame</span>
                            </label>

                            <a href="#" className={styles.forgotPassword}>
                                ¿Olvidaste la Contraseña?
                            </a>
                        </div>

                        <Button type="submit">
                            Iniciar Sesión
                        </Button>
                    </form>

                    <footer className={styles.copyright}>
                        COPYRIGHT © TBOXSA 2026
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;