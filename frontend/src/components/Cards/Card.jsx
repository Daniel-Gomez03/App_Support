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