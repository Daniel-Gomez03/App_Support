import React from 'react';
import styles from './Button.module.less';

const Button = ({ children, type = 'button', onClick, disabled, className }) => {
    return (
        <button
            type={type}
            className={`${styles.btn} ${className || ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;