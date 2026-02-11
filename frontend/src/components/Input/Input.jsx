import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./Input.module.less";

const Input = ({ label, icon: Icon, type = 'text', placeholder, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
                {Icon && <span className={styles.iconTop}><Icon /></span>}
                {label && <label className={styles.label}>{label}</label>}
            </div>

            <div className={styles.inputWrapper}>

                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={styles.input}
                    placeholder={placeholder}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        className={styles.iconRight}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;