// ============================================
// COMPONENT: CARD (Dashboard KPI)
// Tarjeta de indicador clave para el Dashboard.
// Muestra un título, valor actual y variación
// porcentual respecto al mes anterior.
//
// PROPS:
//   title      — etiqueta de la métrica
//   value      — valor a mostrar (string; '—' mientras carga)
//   percentage — variación vs mes anterior (string numérico)
//   icon       — SVG importado para el icono decorativo
//   isDark     — aplica variante oscura (card de pendientes)
//
// TENDENCIA:
//   > 0  → GoArrowUpRight  + trendPositive (verde)
//   < 0  → GoArrowDownRight + trendNegative (rojo)
//   = 0  → GoDash          + trendNeutral  (gris)
// ============================================

import React from "react";
import styles from './Card.module.less';
import { GoArrowDownRight, GoArrowUpRight, GoDash } from "react-icons/go";

const Card = ({ title, value, percentage, icon, isDark = false }) => {
    const numericPercentage = parseFloat(percentage);
    let TrendIcon = GoDash;
    let trendStyle = styles.trendNeutral;

    if (numericPercentage > 0) {
        TrendIcon = GoArrowUpRight;
        trendStyle = styles.trendPositive;
    } else if (numericPercentage < 0) {
        TrendIcon = GoArrowDownRight;
        trendStyle = styles.trendNegative;
    }

    return (
        <div className={`${styles.card} ${isDark ? styles.dark : ''}`}>

            <div className={styles.cardHeader}>
                <span className={styles.title}>{title}</span>
                <div className={styles.iconContainer}>
                    <img src={icon} alt="icon" className={styles.icon} />
                </div>
            </div>

            <div className={styles.body}>
                <h3 className={styles.value}>{value}</h3>

                <div className={styles.footer}>
                    <span className={`${styles.percentage} ${trendStyle}`}>
                        <TrendIcon strokeWidth={0.5} />
                        {percentage}%
                    </span>
                    <span className={styles.label}>vs mes anterior</span>
                </div>
            </div>

        </div>
    );
};

export default Card;