import React, { useEffect, useState } from 'react';
import Card from '../components/Dashboard/Cards/Card';
import styles from './Dashboard.module.less';
import TablesCases from '../components/Dashboard/Tables/TablesCases';
import PendingCases from '../components/Dashboard/Tables/PendingTables';
import TicketGraph from '../components/Dashboard/TicketGraph/TicketGraph';
import Feedback from '../components/Dashboard/Feedback/Feedback';
import alertIcon from '../assets/icons/Alert-icon.svg';
import checkIcon from '../assets/icons/Check-icon.svg';
import clockIcon from '../assets/icons/Clock-icon.svg';
import grahpIcon from '../assets/icons/Graph-icon.svg';
import { getDashboardStats } from '../services/DashboardService';

const EMPTY_STATS = {
    cards: {
        pendientes: 0, pendientesPct: 0,
        finalizados: 0, finalizadosPct: 0,
        mesActual: 0, mesActualPct: 0,
        mesAnterior: 0, mesAnteriorPct: 0,
    },
    priorities:     [
        { name: 'Alta',  value: 0, color: '#DC2626' },
        { name: 'Media', value: 0, color: '#EAB308' },
        { name: 'Baja',  value: 0, color: '#105030' },
    ],
    casesByUser:    [],
    pendingCases:   { nuevo: 0, revisionGarantia: 0, porAsignar: 0, asignado: 0, enProceso: 0, pendienteInfo: 0, escalado: 0, solCancelacion: 0, finalizado: 0, cancelado: 0 },
    recentFeedback: [],
};

const Dashboard = () => {
    const [stats, setStats]   = useState(EMPTY_STATS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Soporte | Dashboard';
        getDashboardStats()
            .then(data => setStats(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const { cards, priorities, casesByUser, pendingCases, recentFeedback } = stats;

    return (
        <div className={styles.dashboardContainer}>

            <div className={styles.pageHeader}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Resumen de tickets y casos por asignar.</p>
            </div>

            <div className={styles.statsGrid}>
                <Card
                    title="Tickets Pendientes"
                    value={loading ? '—' : String(cards.pendientes)}
                    percentage={String(cards.pendientesPct)}
                    icon={alertIcon}
                    isDark={true}
                />
                <Card
                    title="Tickets Finalizados"
                    value={loading ? '—' : String(cards.finalizados)}
                    percentage={String(cards.finalizadosPct)}
                    icon={checkIcon}
                />
                <Card
                    title="Tickets Mes Anterior"
                    value={loading ? '—' : String(cards.mesAnterior)}
                    percentage={String(cards.mesAnteriorPct)}
                    icon={clockIcon}
                />
                <Card
                    title="Tickets Mes Actual"
                    value={loading ? '—' : String(cards.mesActual)}
                    percentage={String(cards.mesActualPct)}
                    icon={grahpIcon}
                />
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.leftColumn}>
                    <TablesCases data={casesByUser} />
                    <PendingCases data={pendingCases ? [pendingCases] : []} />
                </div>
                <div className={styles.rightColumn}>
                    <TicketGraph data={priorities} />
                    <Feedback data={recentFeedback} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;