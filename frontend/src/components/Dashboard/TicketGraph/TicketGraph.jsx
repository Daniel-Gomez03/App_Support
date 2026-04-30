import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './TicketGraph.module.less';

const DEFAULT = [
    { name: 'Alta',  value: 0, color: '#DC2626' },
    { name: 'Media', value: 0, color: '#EAB308' },
    { name: 'Baja',  value: 0, color: '#105030' },
];

const TicketGraph = ({ data = DEFAULT }) => {

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = total > 0
        ? data
        : [{ name: 'Vacio', value: 1, color: '#F3F4F6' }]; 

    return (
        <div className={styles.chartCard}>

            <div className={styles.cardHeader}>
                <h3 className={styles.title}>Prioridad</h3>
            </div>

            <div className={styles.donutContainer}>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={70} 
                            outerRadius={90} 
                            paddingAngle={total > 0 ? 8 : 0}
                            dataKey="value"
                            stroke="none" 
                            cornerRadius={total > 0 ? 10 : 0} 
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className={styles.centerText}>
                    <span className={styles.totalNumber}>{total}</span>
                    <span className={styles.totalLabel}>TOTAL</span>
                </div>
            </div>

            <div className={styles.customLegend}>
                {data.map((item, index) => (
                    <div key={index} className={styles.legendItem}>
                        <div className={styles.legendLeft}>
                            <span
                                className={styles.dot}
                                style={{ backgroundColor: item.color }}
                            ></span>
                            <span className={styles.legendName}>{item.name}</span>
                        </div>
                        <span className={styles.legendValue}>{item.value}</span>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default TicketGraph;